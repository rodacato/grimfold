"""Cut a sheet of pieces on a flat magenta background into separate transparent PNGs.

Usage: python cut_sheet.py SHEET.png OUT_DIR [--min-pixels 4000]
Each piece is saved as piece_<x>_<y>.png, named after its top-left corner on the sheet.
"""
import argparse

import numpy as np
from PIL import Image
from scipy import ndimage

parser = argparse.ArgumentParser()
parser.add_argument("sheet")
parser.add_argument("out_dir")
parser.add_argument("--min-pixels", type=int, default=4000)
args = parser.parse_args()

img = np.asarray(Image.open(args.sheet).convert("RGB")).astype(np.float32)
r, g, b = img[..., 0], img[..., 1], img[..., 2]

# How magenta a pixel is; a soft ramp keeps the torn paper edges.
magenta = np.minimum(r, b) - g
alpha = np.clip(1 - (magenta - 60) / 90, 0, 1)
background = alpha < 0.02

# Remove the magenta tint that bleeds into half-transparent edge pixels.
spill = np.clip(np.minimum(r, b) - g, 0, None) * (1 - alpha)
clean = img.copy()
clean[..., 0] -= spill
clean[..., 2] -= spill
clean = np.clip(clean, 0, 255)

labels, count = ndimage.label(~background, structure=np.ones((3, 3)))
sizes = ndimage.sum(np.ones_like(labels), labels, range(1, count + 1))
boxes = ndimage.find_objects(labels)
rgba = np.dstack([clean, alpha * 255]).astype(np.uint8)

for index, size in enumerate(sizes, start=1):
    if size < args.min_pixels:
        continue
    box = boxes[index - 1]
    piece = rgba[box].copy()
    piece[..., 3] = np.where(labels[box] == index, piece[..., 3], 0)
    y, x = box[0].start, box[1].start
    name = f"{args.out_dir}/piece_{x}_{y}.png"
    Image.fromarray(piece).save(name)
    print(f"{name}  {piece.shape[1]}x{piece.shape[0]}  {int(size)} px")
