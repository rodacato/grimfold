"""Print, as JSON, the [x, y, w, h] of every non-transparent pixel in each PNG given, or null if none."""
import json
import sys

from PIL import Image

boxes = []
for path in sys.argv[1:]:
    box = Image.open(path).convert("RGBA").getchannel("A").getbbox()
    boxes.append(None if box is None else [box[0], box[1], box[2] - box[0], box[3] - box[1]])
print(json.dumps(boxes))
