"""Find where each cut piece sits inside the assembled reference, and print a JS table.

Usage: python fit_pieces.py PIECES_DIR ASSEMBLED.png [--scale 0.82]
Without --scale, the scale is searched on the largest piece (usually the body).
Prints one line per piece: { id, x, y, w, h, pivot } in assembled-reference pixels, at the
pieces' original size; the page multiplies w and h by SCALE. Pivots are left for you to set.
"""
import argparse
import glob
import os

import numpy as np
from PIL import Image
from scipy.signal import fftconvolve

REDUCE = 2

parser = argparse.ArgumentParser()
parser.add_argument("pieces_dir")
parser.add_argument("assembled")
parser.add_argument("--scale", type=float)
args = parser.parse_args()


def load(path, factor):
    image = Image.open(path).convert("RGBA")
    size = (max(1, round(image.width * factor)), max(1, round(image.height * factor)))
    return np.asarray(image.resize(size)).astype(np.float64) / 255


reference = load(args.assembled, 1 / REDUCE)
ref_rgb, ref_alpha = reference[..., :3], reference[..., 3]
ref_flat = ref_rgb * ref_alpha[..., None] + (1 - ref_alpha[..., None]) * 0.5


def best_fit(path, scale):
    piece = load(path, scale / REDUCE)
    color, mask = piece[..., :3], (piece[..., 3] > 0.5).astype(np.float64)
    if color.shape[0] > ref_flat.shape[0] or color.shape[1] > ref_flat.shape[1]:
        return float("inf"), 0, 0
    error = 0
    for c in range(3):
        weighted = (mask * color[..., c])[::-1, ::-1]
        error = error + (mask * color[..., c] ** 2).sum() \
            - 2 * fftconvolve(ref_flat[..., c], weighted, mode="valid") \
            + fftconvolve(ref_flat[..., c] ** 2, mask[::-1, ::-1], mode="valid")
    error = error / mask.sum()
    y, x = np.unravel_index(np.argmin(error), error.shape)
    return float(error[y, x]), x * REDUCE, y * REDUCE


pieces = [p for p in sorted(glob.glob(f"{args.pieces_dir}/*.png"))
          if os.path.abspath(p) != os.path.abspath(args.assembled)]
scale = args.scale
if scale is None:
    largest = max(pieces, key=lambda p: Image.open(p).width * Image.open(p).height)
    candidates = np.arange(0.5, 1.61, 0.02)
    scale = float(min(candidates, key=lambda s: best_fit(largest, s)[0]))
    print(f"// scale found on {os.path.basename(largest)}: {scale:.2f}")

print(f"const SCALE = {scale:.2f};")
for path in pieces:
    error, x, y = best_fit(path, scale)
    width, height = Image.open(path).size
    name = os.path.splitext(os.path.basename(path))[0]
    print(f'  {{ id: "{name}", x: {x}, y: {y}, w: {width}, h: {height}, pivot: null }}, // error {error:.3f}')
