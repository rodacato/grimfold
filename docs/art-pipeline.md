# Art pipeline

How Grimfold's cut-paper art is made: an image model (Codex) draws the pieces, and the game does
the composition, the motion and the print version. What to ask for is in [ASSETS.md](../ASSETS.md),
which also holds the style lock pasted into every request.

**Why this split:** hand-built SVG was tried first and does not reach this look. The layered
paper, the per-tooth tearing and the inner shadows are illustration work. What we can do well is
everything around the image: cutting, assembling, moving, laying out.

## The process: base, then sheet

Every asset is one Codex chat with at most two requests:

1. **Base.** The style lock, the entry's description from ASSETS.md and the format line for its kind
   (below). Attach the three style references named in ASSETS.md, so forty separate chats still
   look like one game; an older asset attached for its content never overrides them. Iterate in the same chat until it is right, then save it as
   `assets/<folder>/<id>.png`, with its prompt in that folder's `prompts.json`.
2. **Sheet.** Only for what moves. In the same chat, attach the base and paste the sheet prompt for
   its kind. Save as `assets/<folder>/<id>/sheet.png`.

What does not move stops at step 1: the base is drawn on `#FF00FF`, so `cut_sheet.py` turns it into a
transparent PNG like any sheet. Because the base is kept, a sheet can be requested later, when an
asset earns motion, without redrawing anything.

| Kind | Base | Sheet | In the MVP |
|---|---|---|---|
| Horrors | One creature on `#FF00FF` | Puppet sheet | Sheet only for the Farolero; the rest are stills |
| The Arponera | Stage 1 on `#FF00FF` | Puppet sheet **plus mutation pieces** | Sheet; stage 4 is a separate base |
| Locations | Vertical 9:16 scene | Layer sheet | Sheet only where the player stays: the four waters, the lighthouse, the Muelle |
| Townspeople | One bust on `#FF00FF` | — | Stills |
| Objects, loot, card backs | An item sheet, up to 9 | — | Stills |

Every sheet uses a flat `#FF00FF` background: it is the color the scripts remove, and nothing in
the palette is close to it.

### Format lines for step 1

- **Creature or person:** `Isolated, centered, complete, on a plain flat #FF00FF background. No text.`
- **Location:** `A vertical 9:16 portrait scene for a phone. Sky and far background in the top third,
  the main subject in the middle, water across the bottom third. Keep the bottom fifth calm and
  uncluttered: the game draws buttons there. No people, no text.`

## 1. Puppet sheet (horrors and the Arponera)

```
Use the attached creature as the exact reference. Same art, same colors, same scale,
same facing direction. Create a PUPPET SHEET for animation: the same creature cut
into separate paper pieces, laid out apart from each other on a plain flat #FF00FF
background, with clear space between every piece. No text, no labels.

Pieces: <list them, e.g. body without jaw/fins/lure; lower jaw; lure; dorsal fin;
side fin; tail>. Also include the fully assembled creature, for reference.
If a mouth opens, fill the opening on the body with the dark inner mouth.

Every piece that sits BEHIND the body must extend a little past its joint (extra paper
that will be hidden under the body), so no gap appears when the piece rotates. Pieces that
sit IN FRONT of the body (<e.g. the side fin>) get no extra tab: their root is the natural
edge of the fin. Keep each
piece complete, flat and unrotated, with the same torn construction-paper style, fibers
and small hard shadows. Do not cast shadows from one piece onto another.
```

If the pieces come back redrawn or at another size: *"Same sheet, but every piece must match the
reference exactly in size; only separate them, do not redraw."* If the second try still does not
fit, stop and note it: that creature is not worth animating.

**What a good sheet looks like:** each moving piece carries a small rectangular tab at its joint
(that tab is where the pivot goes), and the body has a dark fill wherever a piece used to cover it.

**Mutations are piece swaps.** The Arponera's sheet adds, after the assembled reference:

```
Also include these extra pieces, drawn to fit her exactly at the same joints:
two extra yellow eyes that sit on her cheek; a tentacle arm that replaces the harpoon arm
at the same shoulder joint, with the same tab.
```

Stages 2 and 3 are then the same puppet with a piece added or swapped, so they cannot drift from
stage 1. Stage 4 changes what is inside the clothes, so it is its own base with stage 1 attached.
The Farolero's guardian form works the same way: the keeper's cap and coat, and a lighthouse-lamp
lure, as extra pieces for the existing puppet.

## 2. Layer sheet (locations)

Not tried yet. The base is the assembled reference; the sheet holds only what moves.

```
Use the attached location as the exact reference: same art, colors and scale. Create a
LAYER SHEET for parallax: the scene's moving elements as separate horizontal paper strips,
laid out one above another on a plain flat #FF00FF background, with clear space between
them. The sheet may be wider than the reference. No text, no labels.

Strips: <e.g. far fog band; back waves; front waves; the red buoy>. Each strip keeps the
height it has in the scene and is 20% wider than the reference (extra paper hidden off
screen), so it can slide sideways without showing an edge. Keep the torn top edge of every
wave and fog strip. Do not include the sky or the background: they stay in the reference.
```

The strips slide and bob over the base. If the waves painted into the base ghost behind the moving
strips, ask for a third image: the same scene with plain dark water.

## 3. Item sheet (objects, loot, card backs)

Static, so no tabs and no assembled reference. They are seen small (a 34–48 px icon in the hold,
a card corner), so the silhouette has to read on its own.

```
Create an ITEM SHEET: <n, up to 9> separate objects in a 3x3 grid on a plain flat #FF00FF
background, generous space between them. Each object complete, centered in its cell, all at the
same scale and the same three-quarter view, lit from the top-left. Bold silhouette that still
reads at 48 pixels: one clear shape, few small details. No text, no labels.

Objects: <names and descriptions from ASSETS.md>.
```

Group a sheet by kind (all loot of one water type, all equipment) so the scale is comparable.

## Cutting and assembling

Setup once (Python 3):

```
python3 -m venv .venv && .venv/bin/pip install numpy pillow scipy
```

1. **Cut.** `.venv/bin/python tools/art/cut_sheet.py SHEET.png OUT_DIR` removes the magenta, cleans
   the pink fringe from torn edges and writes one transparent PNG per piece, named after its
   position on the sheet. Stills and item sheets stop here.
2. **Name.** Rename each piece by what it is (`body.png`, `jaw.png`, …). The largest one is
   usually the assembled reference.
3. **Fit.** `.venv/bin/python tools/art/fit_pieces.py OUT_DIR ASSEMBLED.png` finds the scale
   between the pieces and the assembled version, places every piece inside it by comparing pixels,
   and prints a table ready to paste: `{ id, x, y, w, h, pivot }`. The scale is searched on the
   largest piece; pass `--scale` to force one. For a location, the base is the assembled version.
4. **Pivots.** Set `pivot: [fx, fy]` per piece, as fractions of its own width and height, at the
   middle of its tab. The body has no pivot: everything else turns around it.
5. **Assemble.** Each piece is an absolutely positioned `<img>` inside a box with the assembled
   reference's aspect ratio: `left = x / W`, `top = y / H`, `width = w * SCALE / W`, and
   `transform-origin` at the pivot. Stack order back to front: pieces hidden behind the body first,
   then the body, then the pieces in front of it.
6. **Check.** Overlay the assembled reference at 50% opacity with motion paused: the pieces should
   ghost on top of it. Then pause at the widest point of each motion and look at every joint for
   a gap.

## Motion rules

- Pieces only **rotate** around their pin, and the whole puppet translates. Never scale or skew
  paper. Location strips only translate.
- Idle loops: `ease-in-out`, `alternate`, a different duration per piece so they never sync.
- Actions (a bite, a lunge): one shot with a small overshoot, `cubic-bezier(.3, 1.45, .5, 1)`.
- `prefers-reduced-motion`: the puppet stands still.

## Known issues

- Magenta can bleed into the art itself (a lilac tooth on the Farolero). The script only cleans
  edges; fix it in the request, or repaint those pixels.
- A tab on a piece that sits in front of the body shows as a box on top of it. The prompt now
  asks for tabs only behind; if one comes back anyway, hide it with a `clip-path` on that piece.
- Sheets come at different scales (0.82 on the first Farolero sheet, 1.14 on the second): never
  reuse coordinates from an older sheet; refit.
- The model redraws the assembled version slightly, so it never overlays perfectly. Fitting finds
  the closest match; trust the joints over the overlay.
- Generated art may not be copyrightable, so the repository's art license may not protect it.
