//comments are for learning purposes

export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    score: number;
}

interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }

//changing rgb to hsl for better color analysis
function rgbToHsl({ r, g, b }: RGB): HSL {
    const rn = r / 255, gn = g / 255, bn = b / 255; //normalize 0-1 range, HSL math requires this
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);

    //lightness formula = average of max and min 
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l }; // if equal, its shade of gray, so no saturation and hue is irrelevant

    const d = max - min; //delta
    //saturation formula, results 0-1 where 0 is no saturation (gray) and 1 is full saturation color
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    //hue formula, results 0-1 which is converted to degress on color wheel
    //irrelevant for our project but included for completeness
    let h = 0;
    switch (max) {
        case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
        case gn: h = ((bn - rn) / d + 2) / 6; break;
        case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
    return { h, s, l };
}

function classifyPixel(rgb: RGB): 'white' | 'black' | 'shadow' | 'problem' {
    const { s, l } = rgbToHsl(rgb);

    //lightness above 70% and low saturation is white (background)
    if (l > 0.70 && s < 0.30) return 'white';

    //low lightness is black (cutout)
    if (l < 0.25) return 'black';

    //medium lightness and low saturation is shadow
    if (l > 0.40 && s < 0.25) return 'shadow';

    //anything else is a problem
    return 'problem';
}

function sampleBlock(
    data: Uint8ClampedArray,
    width: number,
    xStart: number,
    yStart: number,
    blockSize: number
): RGB[] {
    const pixels: RGB[] = [];

    //start from top left corner of block 
    for (let y = yStart; y < yStart + blockSize; y++) {
        for (let x = xStart; x < xStart + blockSize; x++) {
            //formula for finding a pixel's index in the 1D data array based on its x,y coordinates and image width
            const i = (y * width + x) * 4;

            pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
    }
    return pixels;
}

export async function validateCutout(file: File): Promise<ValidationResult> {
    return new Promise((resolve) => {
        const img = new Image(); //HTML iage element
        const url = URL.createObjectURL(file); // converts uploaded file to local URL that the image element can load

        img.onload = () => {
            const canvas = document.createElement('canvas');
            //scale down if larger than 600px, faster processing 
            const scale = Math.min(1, 600 / Math.max(img.width, img.height));

            canvas.width = Math.floor(img.width * scale);
            canvas.height = Math.floor(img.height * scale);

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url); //free memory

            const { width, height } = canvas;
            const { data } = ctx.getImageData(0, 0, width, height);

            //Check 1: Corners must be white
            //based on earlier butterfly example
            const issues: string[] = [];
            const cornerSize = Math.min(20, Math.floor(width * 0.05));

            const corners = [
                sampleBlock(data, width, 0, 0, cornerSize), //top left
                sampleBlock(data, width, width - cornerSize, 0, cornerSize), //top right
                sampleBlock(data, width, 0, height - cornerSize, cornerSize), //bottom left
                sampleBlock(data, width, width - cornerSize, height - cornerSize, cornerSize) //bottom right
            ];
            const cornerLabels = ['top left', 'top right', 'bottom left', 'bottom right'];

            corners.forEach((corner, i) => {
                const avgBrightness = corner.reduce((sum, px) => sum + (px.r + px.g + px.b) / 3, 0) / corner.length;
                if (avgBrightness < 100) {
                    issues.push(`Corner ${cornerLabels[i]} is not white — check background`);
                }
            });

            //Check 2: Global pixel classification
            let whiteCount = 0, blackCount = 0, shadowCount = 0, problemCount = 0;
            const total = width * height;

            for (let i = 0; i < data.length; i += 4) {
                const px = { r: data[i], g: data[i + 1], b: data[i + 2] };
                switch (classifyPixel(px)) {
                    case 'white': whiteCount++; break;
                    case 'black': blackCount++; break;
                    case 'shadow': shadowCount++; break;
                    case 'problem': problemCount++; break;
                }
            }

            const problemRatio = problemCount / total;
            const shadowRatio = shadowCount / total;
            const blackRatio = blackCount / total;

            if (problemRatio > 0.10) {
                issues.push('Image contains unexpected colors or mid-tones')
            }
            if (shadowRatio > 0.35) {
                issues.push('Image contains too much shadow - try better lighting');
            }
            if (blackRatio < 0.02) {
                issues.push('No clear black cutout detected - make sure the cutout is visible');
            }
            if (blackRatio > 0.75) {
                issues.push('Image contains too much black - check photo framing');
            }

            //Check 3: Shine on cutout
            let shineCount = 0;
            const shineCheckLimit = 500;
            const step = Math.max(1, Math.floor(total / shineCheckLimit)); //check every 500px

            for (let i = 0; i < total; i += step) {
                const idx = i * 4;
                const px = { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
                const { l } = rgbToHsl(px);

                if (l > 0.75) continue;

                const x = idx % width, y = Math.floor(idx / width);
                if (x < 1 || x >= width - 1 || y < 1 || y >= height - 1) continue;

                const neighbors = [
                    { r: data[((y - 1) * width + x) * 4], g: data[((y - 1) * width + x) * 4 + 1], b: data[((y - 1) * width + x) * 4 + 2] },
                    { r: data[((y + 1) * width + x) * 4], g: data[((y + 1) * width + x) * 4 + 1], b: data[((y + 1) * width + x) * 4 + 2] },
                ];
                const darkNeighbors = neighbors.filter(n => rgbToHsl(n).l < 0.25).length;
                const brightNeighbors = neighbors.filter(n => rgbToHsl(n).l > 0.80).length;

                if (darkNeighbors >= 1 && brightNeighbors >= 1) shineCount++;
            }

            if (shineCount > 40) {
                issues.push('Silhouette may have shine or glare - try adjusting lighting or angle');
            }

            const deductions =
                issues.length * 20 +
                Math.min(30, problemRatio * 500) +
                Math.min(15, shadowRatio * 50);

            const score = Math.max(0, 100 - deductions);

            resolve({ isValid: issues.length === 0, issues, score });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ isValid: false, issues: ['Failed to load image - check file format'], score: 0 });
        };

        img.src = url;
    });
}