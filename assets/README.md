# assets

Grimfold's cut-paper art. What still has to be requested is [ASSETS.md](../ASSETS.md); how to
request, cut and animate is [docs/art-pipeline.md](../docs/art-pipeline.md).

Two halves, and only one is in git:

- **`raw/`, gitignored:** the Codex originals and the prompts that made them, the candidates and
  the off-style art that was replaced (`v1/` folders). They live on the author's machine only, so back them up outside the repo: without
  them `web/` cannot be rebuilt.
- **`web/`, tracked and generated, never edited:** the copies the game loads and the site publishes
  (`publicDir`). `node --env-file=.env tools/art/web_art.mjs` builds it from `raw/`: horrors keyed out
  of their petrol and scaled to 900 px, puppet layers and overlaps cropped to their bbox, everything as
  PNG, and every PNG over 20 KB compressed with TinyPNG when `TINYPNG` is set. `tinify.json` records
  what was already compressed, so a rerun spends no quota on unchanged files. Card backs ship at
  600 px, portraits at 384 px, Botín and Equipo icons at 192 px: they are drawn far smaller than
  delivered, and a phone decodes every pixel. The run also writes `src/ui/art-versions.json`, a hash
  per file that the game adds to each URL, because a redrawn file keeps its name and an installed
  game would otherwise keep the old one in its cache.

New deliveries from Codex go to `raw/pending/`.

| Folder in `raw/` | Holds | Format as delivered |
|---|---|---|
| `horrors/` | The 22 creatures of the bay's Mazo in the flat style of the three references (eight promoted from `candidates/`), plus `farolero.png` | 1254×1254, opaque petrol background |
| `horrors/farolero*/` | The Farolero's three puppets as exact cuts: `farolero` (the ending), `farolero-guardian` (the lighthouse, with `accesorios/` holding the cap, coat and lamp-room lure on their own) and `farolero-persigue` (the chase). `farolero-hoja/` is the first, hand-cut rig, no longer shipped | Layers 1254×1254 transparent, all at 0,0 |
| `horrors/<id>/` | A horror's puppet as exact cuts: numbered layers back to front, `armado.png` (the transparent base they rebuild), `cortes.json` (bbox, pivot, parent and stack order per layer). From batch 3 on, `solape-*` / `relleno-*` overlaps hidden under the paper at rest, listed in `solapes.json`; batches 1–2 came without them and keep `sheet.png` / `apoyo-cuerpo.png`; their overlaps are derived by `tools/art/overlaps.py` from the cuts themselves. Every horror of the Mazo, plus `reina-retazo`, the Reina's learned face | Layers 1254×1254 transparent, all at 0,0 |
| `town/` | The Muelle panorama: `pueblo-muelle`, `pueblo-centro`, `pueblo-loma`, left to right, and `pueblo-panorama` | 941×1672 panels; `zones.json` holds the tap areas, normalized 0–1 per panel |
| `locations/` | The Salas, the lighthouse, the Eventos, and `pueblo-faro` (for a title screen the game does not have; not shipped) | 1536×1024 horizontal |
| `objects/` | `farol` (a style reference), `bote` (La Vigilia, transparent) and `bote-fondo`, the boat as first delivered on petrol | 1254×1254 |
| `gear/` | The Equipo icons: `cana`, `sedal`, `farol`, `motor`, `casco-madera`, `casco-reforzado` | 1254×1254 transparent |
| `people/` | The five townspeople portraits; `v1/` holds the painted ones they replaced, kept as content references | 1254×1254 transparent |
| `cards/` | The three card backs, one per Sombra; `v1/` holds the first ones | 1060×1484 opaque |
| `characters/` | `arponera` and `arponera-del-mar`, her puppet in `arponera/` (sheet and cut pieces), and `profundo`, the reference for her last stage | Arponera 1024×1536 transparent; `profundo` 1254×1254 opaque petrol |
| `loot/` | The Botines, one per id in ASSETS.md, plus `luz` | 1254×1254 transparent |
| `candidates/objects/` | `idolo-primero`, the first idol, which showed Cthulhu; kept because the loot prompts used it as a style reference | 1254×1254 |
| `candidates/characters/` | The painted portraits' second poses and `marta-mayor`, all off-style and unused | 1254×1254 |
| `candidates/horrors/` | Horrors outside the Mazo: four cosmic ones (`nudo`, `ausencia`, `inquilino`, `desove`), each with its exact-cut puppet in a folder, kept out by LORE.md; and `cthulhu`, which is never used | 1254×1254 |
| `candidates/locations/` | Eight cosmic locations Codex proposed outside the bay, with their concept and Lovecraft source; and `carta-bahia-vacia`, a chart that keeps the requested Sala spots but empties the bay | 1672×941 horizontal; the chart 1024×1536 |

## Conventions

- **A file is named by its id in ASSETS.md**, never by the name Codex gave it. Codex's name, when
  different, is the record's `codexName`.
- **Each folder has one `prompts.json`**: per asset, the prompt that made it, the images attached as
  references (paths in this folder), and Codex's direction notes and literary sources, kept verbatim
  in Spanish. A new asset adds its record there; a regenerated one replaces its record.
- Indexes, hashes and status files that Codex returns are not kept: ASSETS.md tracks the status.
- These are originals: never edit one by hand. A change is a new delivery, then a rebuild of `web/`.

**Style references:** `raw/horrors/farolero.png`, `raw/characters/profundo.png` and
`raw/objects/farol.png` define the look ([ASSETS.md](../ASSETS.md), style lock). An asset that does
not match them is redrawn from them, as the horrors were.

## Known gaps

- `isla-observatorio` and `naufragio-cementerio` came from the probe and their prompts were not kept.
- Four candidate locations (`calle-ausente`, `pozos-ajenos`, `huerto-ceniza`, `claustro-adentro`)
  are edits that removed a boat; only the edit prompt was delivered, not the original one.
