#!/usr/bin/env python3
"""CLI script to test cutout + black-to-white inversion."""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.image_processor import ImageProcessor


def main():
    parser = argparse.ArgumentParser(description="Cutout and invert image colors")
    parser.add_argument("image", help="Image file path")
    parser.add_argument("--threshold", type=int, default=50, help="Black threshold 0-255")
    parser.add_argument("--output", default=None, help="Output PNG path")
    args = parser.parse_args()

    input_path = Path(args.image)
    if not input_path.exists():
        print(f"Error: file not found: {input_path}")
        sys.exit(1)

    with open(input_path, "rb") as f:
        image_bytes = f.read()

    output_bytes = ImageProcessor.cutout_and_invert_black_to_white(
        image_bytes,
        threshold=args.threshold
    )

    output_path = Path(args.output) if args.output else input_path.with_name(f"{input_path.stem}_cutout.png")
    output_path.write_bytes(output_bytes)
    print(f"Saved processed image: {output_path}")


if __name__ == "__main__":
    main()
