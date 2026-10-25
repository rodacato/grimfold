# assets

Grimfold's cut-paper art. What still has to be requested is [ASSETS.md](../ASSETS.md); how to
request, cut and animate is [docs/art-pipeline.md](../docs/art-pipeline.md).

Two halves, and only one is in git:

- **`raw/`, gitignored:** the Codex originals and the prompts that made them, the candidates and
  the redo queue. They live on the author's machine only, so back them up outside the repo: without
  them `web/` cannot be rebuilt.
- **`web/`, tracked and generated, never edited:** the copies the game loads and the site publishes
  (`publicDir`). `node --env-file=.env tools/art/web_art.mjs` builds it from `raw/`: horrors keyed out
  of their petrol and scaled to 900 px, puppet layers cropped to their bbox, everything as PNG, and
  every PNG over 20 KB compressed with TinyPNG when `TINYPNG` is set. `tinify.json` records what was
  already compressed, so a rerun spends no quota on unchanged files. `redo/` ships uncompressed.

New deliveries from Codex go to `raw/pending/`.

| Folder in `raw/` | Holds | Format as delivered |
|---|---|---|
| `horrors/` | The 22 creatures of the bay's Mazo in the flat style of the three references (eight promoted from `candidates/`), plus `farolero.png` | 1254×1254, opaque petrol background |
| `horrors/farolero/` | The Farolero's puppet: `sheet.png` and the pieces cut from it | Transparent pieces |
| `horrors/<id>/` | A horror's puppet as exact cuts: numbered layers back to front, `armado.png` (the transparent base they rebuild), `cortes.json` (bbox, pivot, parent and stack order per layer). From batch 3 on, `solape-*` / `relleno-*` overlaps hidden under the paper at rest, listed in `solapes.json`; batches 1–2 instead keep `sheet.png` / `apoyo-cuerpo.png`, generative support for painting what the layers hide. Every horror of the Mazo except `duerme`, `reina`, `gaviota` and `mascaron` | Layers 1254×1254 transparent, all at 0,0 |
| `town/` | The Muelle panorama: `pueblo-muelle`, `pueblo-centro`, `pueblo-loma`, left to right, and `pueblo-panorama` | 941×1672 panels; `zones.json` holds the tap areas, normalized 0–1 per panel |
| `locations/` | The Salas, the lighthouse, Eventos and the title screen (`pueblo-faro`) | 1536×1024 horizontal |
| `objects/` | Equipment and loot: `farol`, `bote` (La Vigilia) | 1254×1254 |
| `characters/` | `arponera` and `arponera-del-mar`, her puppet in `arponera/` (sheet and cut pieces), and `profundo`, the reference for her last stage | Arponera 1024×1536 transparent; `profundo` 1254×1254 opaque petrol |
| `loot/` | The Botines, one per id in ASSETS.md, plus `luz` | 1254×1254 transparent |
| `redo/` | **To redo:** the five townspeople in their picked pose and the three card backs. Each record says why. A redone asset replaces its file here and then moves to its folder | As delivered |
| `candidates/objects/` | `idolo-primero`, the first idol, which showed Cthulhu; kept because the loot prompts used it as a style reference | 1254×1254 |
| `candidates/characters/` | Portrait poses not picked, and `marta-mayor` (Marta at 70–75) | 1254×1254 |
| `candidates/horrors/` | Horrors outside the Mazo: four cosmic ones (`nudo`, `ausencia`, `inquilino`, `desove`), and `cthulhu`, which is never used | 1254×1254 |
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

- **Horrors are on opaque petrol, not `#FF00FF`.** They work as-is on a petrol card. Placing one over
  a location, or cutting it into a puppet, needs a magenta version: attach the original and ask for
  *"the same creature, unchanged, on a plain flat #FF00FF background"*.
- **Locations are horizontal.** The phone needs a 9:16 base of each; the town panels are the only
  vertical ones.
- `isla-observatorio` and `naufragio-cementerio` came from the probe and their prompts were not kept.
- Four candidate locations (`calle-ausente`, `pozos-ajenos`, `huerto-ceniza`, `claustro-adentro`)
  are edits that removed a boat; only the edit prompt was delivered, not the original one.
