import io
import cv2
import numpy as np
import svgwrite
from PIL import Image

class ImageProcessor:
    def __init__(self):
        pass

    def cutout_and_invert_black_to_white(
        self,
        image_bytes: bytes,
        threshold: int = 50 
    ) -> bytes:
        # 1. Decode raw bytes into an OpenCV image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 2. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 3. Apply a Gaussian Blur to smooth out the paper texture and desk grain
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # 4. Otsu's Thresholding
        _, mask = cv2.threshold(
            blurred, 
            0, 
            255, 
            cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )

        # 5. Find contours for filling
        contours, _ = cv2.findContours(
            mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        h, w = mask.shape
        
        # 6. Build final PNG with white filled shapes on transparent background
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        
        for contour in contours:
            # Smooth contour
            epsilon = 0.002 * cv2.arcLength(contour, True)
            smooth = cv2.approxPolyDP(contour, epsilon, True)
            
            # FILL the contour with white
            cv2.fillPoly(
                rgba,
                [smooth],
                (255, 255, 255, 255)
            )

        # 7. Encode and return
        result = Image.fromarray(rgba, mode="RGBA")
        output = io.BytesIO()
        result.save(output, format="PNG")
        return output.getvalue()
    
    def generate_svg(
        self,
        image_bytes: bytes,
        threshold: int = 50
    ) -> str:
        """Optional: Generate SVG vector alongside PNG"""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        _, mask = cv2.threshold(
            blurred,
            0,
            255,
            cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )
        
        contours, _ = cv2.findContours(
            mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        h, w = mask.shape
        
        svg_output = io.StringIO()
        dwg = svgwrite.Drawing(size=(w, h))
        
        for contour in contours:
            epsilon = 0.002 * cv2.arcLength(contour, True)
            smooth = cv2.approxPolyDP(contour, epsilon, True)
            
            points = [
                (int(point[0][0]), int(point[0][1]))
                for point in smooth
            ]
            
            if len(points) > 2:
                dwg.add(
                    dwg.polygon(
                        points=points,
                        fill="white",     
                        stroke="white",
                        stroke_width=2
                    )
                )
        
        dwg.write(svg_output)
        return svg_output.getvalue()

# Global instance
global_image_processor = ImageProcessor()