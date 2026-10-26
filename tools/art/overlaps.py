"""Derive hidden overlaps for a horror whose exact cuts came without them.

Usage: python overlaps.py HORROR_DIR [--reach 14]
For every layer that moves, grows its edge up to REACH px, copying its own nearest edge pixels, and
keeps only what lies under fully opaque paper of a layer that never moves: hidden at rest, it fills
the crack a rotation opens, and no other moving piece can uncover it. Writes solape-<id>.png and
solapes.json in the same format Codex delivers; the pipeline places them at the back, following
their piece.
"""
import argparse
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

parser = argparse.ArgumentParser()
parser.add_argument("dir")
parser.add_argument("--reach", type=int, default=14)
args = parser.parse_args()

cuts = json.load(open(os.path.join(args.dir, "cortes.json")))
if os.path.exists(os.path.join(args.dir, "solapes.json")):
    raise SystemExit(f"{args.dir} already has solapes.json")
def alpha(layer):
    return np.asarray(Image.open(os.path.join(args.dir, layer["archivo"])).convert("RGBA"))


def still(index, layer):
    return index == 0 or bool(layer.get("sin_solape") and not layer.get("movimiento"))


layers = list(enumerate(cuts["capas"]))
paper = np.any([alpha(layer)[..., 3] >= 250 for i, layer in layers if still(i, layer)], axis=0)

assets = []
for index, layer in layers:
    if still(index, layer):
        continue
    piece = alpha(layer)
    # Faint edge pixels keep whatever RGB the cut left under them, so only solid ones are copied.
    solid = piece[..., 3] >= 250
    distance, (rows, cols) = ndimage.distance_transform_edt(~solid, return_indices=True)
    reach = (distance > 0) & (distance <= args.reach) & paper & (piece[..., 3] == 0)
    if not reach.any():
        continue
    lap = np.zeros_like(piece)
    lap[reach] = piece[rows[reach], cols[reach]]
    lap[reach, 3] = 255
    name = f"solape-{layer['id']}.png"
    Image.fromarray(lap).save(os.path.join(args.dir, name))
    assets.append({"tipo": "raiz", "capa": index, "capa_padre": layer.get("parent", 0), "pieza": layer["id"],
                   "archivo": name, "pixeles": int(reach.sum()), "extension_maxima_px": args.reach,
                   "visible_por_defecto": False})

with open(os.path.join(args.dir, "solapes.json"), "w") as f:
    json.dump({"id": cuts.get("id"), "derivado_por": "tools/art/overlaps.py",
               "limite": "Edge pixels of each moving piece, grown under opaque paper only; hidden at rest.",
               "assets": assets}, f, ensure_ascii=False, indent=2)
print(f"{args.dir}: {len(assets)} overlaps")
