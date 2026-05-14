import io
import cv2
import numpy as np
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

        # 4. The Magic: Otsu's Thresholding
        # This automatically calculates the absolute perfect cutoff point between 
        # the black cutouts and the white desk, creating a solid, crisp mask.
        _, mask = cv2.threshold(
            blurred, 
            0, 
            255, 
            cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )

        # 5. Build the final transparent PNG
        h, w = mask.shape
        
        # Create a blank, pure white RGB canvas
        white_rgb = np.full((h, w, 3), 255, dtype=np.uint8)
        
        # Stack the white canvas with our new, solid Otsu mask as the transparency channel
        rgba = np.dstack((white_rgb, mask))

        # 6. Encode and return
        result = Image.fromarray(rgba, mode="RGBA")
        output = io.BytesIO()
        result.save(output, format="PNG")
        return output.getvalue()

# Global instance
global_image_processor = ImageProcessor()