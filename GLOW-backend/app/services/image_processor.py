import io
import cv2
import numpy as np
import svgwrite
from PIL import Image

class ImageProcessor:
    def __init__(self):
        pass

    def _decode_image(self, image_bytes: bytes):
        if not image_bytes:
            return None
        nparr = np.frombuffer(image_bytes, np.uint8)
        if nparr.size == 0:
            return None
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img

    def cutout_and_invert_black_to_white(
        self,
        image_bytes: bytes,
        threshold: int = 50
    ) -> bytes:
        img = self._decode_image(image_bytes)
        if img is None:
            tiny = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
            out = io.BytesIO()
            tiny.save(out, format="PNG")
            return out.getvalue()
            
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
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        
        for contour in contours:
            if contour is None or len(contour) == 0:
                continue
            arc = cv2.arcLength(contour, True)
            epsilon = 0.002 * arc
            smooth = cv2.approxPolyDP(contour, epsilon, True)
            cv2.drawContours(
                rgba,
                [smooth],
                -1,
                (255, 255, 255, 255),
                thickness=15
            )
            
        result = Image.fromarray(rgba, mode="RGBA")
        output = io.BytesIO()
        result.save(output, format="PNG")
        return output.getvalue()

    def generate_svg(
        self,
        image_bytes: bytes,
        threshold: int = 50
    ) -> str:
        img = self._decode_image(image_bytes)
        if img is None:
            dwg = svgwrite.Drawing(size=(1, 1))
            return dwg.tostring()
            
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
        dwg = svgwrite.Drawing(size=(w, h))
        
        for contour in contours:
            if contour is None or len(contour) == 0:
                continue
            arc = cv2.arcLength(contour, True)
            epsilon = 0.002 * arc
            smooth = cv2.approxPolyDP(contour, epsilon, True)
            points = [(int(p[0][0]), int(p[0][1])) for p in smooth]
            if len(points) > 2:
                dwg.add(
                    dwg.polygon(
                        points=points,
                        fill="none",
                        stroke="white",
                        stroke_width=15
                    )
                )
                
        return dwg.tostring()

# Global instance
global_image_processor = ImageProcessor()

