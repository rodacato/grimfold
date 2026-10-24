# Assets

Art requests for Grimfold's cut-paper look. Each entry says what the thing **is** in the game and
the story; the image generator invents the shape. Names stay in Spanish because they are in-game copy.

Background story every piece hints at, never states: the town voted to switch off the lighthouse,
because in the dark the fish come on their own, and the lighthouse keeper went into the sea.

Save each Codex original as `assets/<folder>/<id>.png`, add its prompt to that folder's
`prompts.json` and tick it here ([assets/README.md](assets/README.md)). How each kind is requested, cut and animated (puppet sheets, item sheets, layers) is
in [docs/art-pipeline.md](docs/art-pipeline.md).

## Batches

Art enters in `build`, screen by screen, and never blocks one: a screen whose art is missing ships
with a paper silhouette ([docs/BRIEF.md](docs/BRIEF.md)). One request per Codex chat: the style lock
below, the entry's text, and its format (still, puppet sheet, item sheet or layers).

| # | When | Batch | Requests | Serves demo step |
|---|---|---|---|---|
| 1 | Week 1, during the skeleton | **Pipeline test:** one loot item sheet (`luz`, `mecha`, `pinza`, `espina`, `red`), `mar-abierto` base and layer sheet (card backs done) | 3 | 3, 4 |
| 2 | Week 1–2 | **Story:** the dock's layer sheet; the Arponera's base, sheet and stage 4; the Farolero's guardian pieces (townspeople, town panels and `faro-lampara` done; pick v1 or v2 of each portrait) | 5 | 1, 5 |
| 3 | Week 2 | **Horrors:** the 18 are done on petrol; left: `farolero-persigue`, and magenta versions only for a creature that must sit over a location | 1+ | 3, 4 |
| 4 | Week 2 | **Objects:** the rest of the loot in two sheets, the equipment in one | 3 sheets | 1, 4 |
| 5 | Week 2–3 | **Places:** the horizontal ones are done; left: a 9:16 base of each, and a layer sheet for those marked (moves) | ~18 | 2, 3, 5 |

Batch 1 goes first because item sheets and layered locations are still untried in the pipeline;
ordering forty requests on an unproven format is how a week gets lost. If the appetite runs short,
the Arponera's puppet is the second cut in the brief: her four stages stay as stills.

## Style lock (paste with every request)

Attach the three style references with every request: `assets/horrors/farolero.png`,
`assets/characters/profundo.png` and `assets/objects/farol.png`. They override any other image
attached, and any older asset that does not look like them.

```
Flat cut-paper collage in exactly the style of the three attached references. Several dozen large,
broad, hand-cut matte paper pieces in shallow layers, not hundreds of small flakes. Mostly flat
solid colors with a soft paper grain inside each piece; simple angular outlines, torn only here and
there. Scales are broad polygons, fins are angular strips, teeth are large ivory triangles, eyes
are flat mustard and charcoal discs. Depth is only paper thickness and short soft shadows between
layers: no sculpted relief, no fine cracks or pores, no realistic bone. The horror comes from
anatomy and negative space, never from more detail or gore. Palette: background petrol #123f45,
dark petrol #244c50, sage #9bb9a7, rust #c45b38, mustard #dda845, ivory #eee0bb, charcoal #2b2926.
No text, labels or frames.
```

- Every asset is a base, plus a sheet only when it moves; the format line for each kind and the
  sheet prompts are in [docs/art-pipeline.md](docs/art-pipeline.md).
- Entries marked **(moves)** get a sheet in the MVP. The rest are stills.
- Lovecraft is hinted, never shown or named: no full-body gods.

**Redo before anything new:** what is in `assets/redo/` was delivered but does not match the style
references. Unticked below until redone; attach the three references plus the old image as content
only.

## Locations

Every ticked location except the town panels exists only horizontally (1536×1024): each still needs
its 9:16 base, with the horizontal one attached as reference.

**The town is a panorama of three 9:16 panels** that scroll sideways on the Muelle screen. Each
panel is requested with the previous one attached: *"continue this town to the right"*. Where two
panels meet, a torn paper edge or a post hides the seam. Every thing you can tap is something the
rules already have; there are no shops.

- [x] `pueblo-muelle` **(moves)** — The dock at night: your launch tied up, Ruelas padre mending nets, Chela's shed with a huge key ring on the door, the lighthouse across the water. Taps: Equipo and Bajar, Ruelas, Chela.
- [x] `pueblo-centro` — The small square: don Tomás's register office with a lamp on, Marta's window with a jar on the sill, Nico on a wall looking toward the lighthouse. Taps: don Tomás, Marta, Nico.
- [x] `pueblo-loma` — The hill above town: the keeper's house, now yours, its window facing the lighthouse; the father's things still on the porch. Taps: Repisa, Bestiario, Marcas.
- [x] `pueblo-faro` **(moves)** — The town, the dock and the lighthouse across the bay; ruins and tentacles in the fog. Title screen. (horizontal only)
- [x] `naufragio-cementerio` — Ship graveyard on a tidal flat. Naufragio Sala. (horizontal only)
- [x] `isla-observatorio` — Observatory on a rock among stone arches. Isla Sala: from here you see two more Salas. (horizontal only)
- [x] `rio-estero` **(moves)** — Narrow mangrove estuary, tea-colored water, empty stilt houses with nets still drying, a bell buoy that stays still in the wind.
- [x] `lago-campanario` **(moves)** — Mirror-still lake between hills; the tilted tip of a sunken bell tower breaks the surface. The old town is below.
- [x] `mar-abierto` **(moves)** — Long swells, fog banks, one red buoy; the lighthouse always on the horizon.
- [x] `mar-profundo` **(moves)** — Water turning black; lit windows of a city under the surface, stone stairs going down into the water and on, an arch resting on nothing.
- [x] `faro-exterior` **(moves)** — Boss Sala. Tower on a rock, light on, door open, the keeper's cap on a nail, nets with things still moving.
- [x] `faro-lampara` — Lamp room: the great lens lit, an empty chair shaped by someone who is gone, an open logbook. "Robar la luz" scene.
- [x] `isla-fogata` — Small beach, a cold campfire and five chairs around it, as if waiting; a rebozo on one of them.
- [x] `naufragio-ruelas` — The Ruelas' launch beached on a sandbar, intact, outboard motor ripped off, dinner still served on the table.
- [x] `evento-boya` — A buoy ringing alone at night in the fog, no waves to move it.
- [x] `evento-sal` — The boat under falling salt crystals; the dock in the distance, people watching without umbrellas.
- [ ] `carta-bahia` — The Mapa: a 2:3 portrait sea chart of the bay seen from above, 1024×1536. Muelle at the bottom left, the lighthouse rock at the top right; the water darkens from tea-colored estuary near the Muelle to black sea below the lighthouse. Eight round clear spots of open water where the game places its Salas, at these fractions of width and height: Muelle 0.13 0.89 · 0.35 0.76 · 0.16 0.60 · 0.53 0.61 · 0.34 0.39 · 0.74 0.45 · 0.79 0.78 · lighthouse 0.85 0.21. Nothing drawn on those spots: what is there changes every Marea.

## Horrors

Odd, not muscular: the horror is the detail that should not be there.

- [x] `anguila` — **Anguila de faro apagado.** Long thin eel with a burnt lamp wick on its forehead, coiling in search of a light that no longer exists.
- [x] `cangrejo` — **Cangrejo de los ahogados.** Wedding rings threaded on its legs, shell shaped like a small tombstone.
- [x] `globo` — **Pez globo resentido.** Puffed up, offended face, a little bell hanging from it that does not ring.
- [x] `sinojos` — **Banco de peces sin ojos.** Hundreds of small silver fish with empty sockets that together form the outline of a face.
- [x] `ajolote` — **Larva de la Puerta.** A pale axolotl with legs too long and a hollow skull; its six branching gills end in black globes. Lago, from a Codex candidate.
- [x] `esturion` — **El Arzobispo del Limo.** An armored sturgeon with an eyeless bone mask, snout split into vertical jaws, a fossil of itself in its side. Lago, from a Codex candidate.
- [x] `lucio` — **Lucio con dientes de leche.** Long pike with a child's baby teeth, small and uneven, one crooked.
- [x] `medusa` — **Medusa de campana rota.** Its body is a cracked bronze church bell; its tentacles are bell-tower ropes.
- [x] `linterna` — **Pez linterna desertor.** Wears a lighthouse lens as a monocle; its lure is out and it looks ashamed.
- [x] `sirena` — **Sirena desafinada.** Not the pretty mermaid: half conch shell, mouth open on an endless note, seaweed hair. Nervous laughter more than fear.
- [x] `pez-hacha` — **El Flautista del Tajo.** A blind hatchetfish whose gill tubes twist like flutes; teeth line its empty belly, pointing inward. Mar, from a Codex candidate.
- [x] `tripode` — **El Oficiante del Fondo.** Three very tall fin rays ending in hands with inverted fingers; a small fish body on top, its face opening in three bony plates. Mar, from a Codex candidate.
- [x] `tiburon` — **Tiburón de quilla.** Its dorsal fin is a launch's keel; a propeller shows through a stitched seam in its belly.
- [x] `calamar` — **Calamar del ancla.** Coiled around a rusty anchor that has gills. The anchor is what breathes.
- [x] `reina` — **Reina de los percebes.** A mound of barnacles on a rock forming a crown and the worn face of a town woman.
- [x] `duerme` — **Lo que duerme bajo el ancla.** Never whole: a closed eyelid the size of a house under the water, an anchor chain going into it.
- [x] `gaviota` — **Gaviota con dientes** (wanderer). A gull with a human smile, teeth too even and too white.
- [x] `mascaron` — **Mascarón de proa despierto** (wanderer). A ship's figurehead carved with the keeper's face, wooden eyes just opened.
- [x] `farolero` **(moves)** — **El Farolero**, base: four-eyed anglerfish with a lantern lure.
- [x] `farolero-marioneta` — Its puppet sheet: body, jaw, lure, dorsal fin, side fin, tail.
- [ ] `farolero-guardian` — Extra pieces for the same puppet: the keeper's cap, a torn coat, and a lure that is the lighthouse lamp itself.
- [ ] `farolero-persigue` — The same, in profile, coming out of the fog in pursuit.

## The Arponera, four stages

Same pose in all four; only the change moves. Stages 2 and 3 are pieces on her puppet sheet, not
images of their own.

- [x] `arponera` **(moves)** — Red raincoat, rain hat, harpoon. Her sheet `arponera/sheet.png`: body, head with hat, harpoon arm, coat tail.
- [x] `arponera-2` — **Ojos de bruma.** Extra yellow eyes on her cheek: `arponera/ojos-bruma.png`.
- [x] `arponera-3` — **Brazo de ventosas.** The hanging arm becomes a tentacle, behind the coat: `arponera/brazo-ventosas.png`, worn with `cuerpo-sin-mano.png` (the body with the human hand erased).
- [x] `arponera-del-mar` — **Del mar.** The clothes remain; what is inside is something else. Its own base; `profundo` stays as the reference it came from.

## Townspeople (bestiary diary)

Bust portraits, like old photos cut out of paper.

- [ ] `chela` — **Chela, la del muelle.** Apron, a huge key ring, looks sideways like someone who knows.
- [ ] `tomas` — **don Tomás, el del registro.** Glasses, a record book under his arm with a page torn out.
- [ ] `nico` — **Nico, nueve años.** Slingshot and a small bell around his neck; the only one looking straight ahead.
- [ ] `marta` — **Marta.** Rebozo, a jar of baby teeth pressed to her chest.
- [ ] `ruelas` — **Ruelas padre.** Old fisherman with a cap; the mark of a missing ring on his finger.

## Equipment

- [x] `farol` — **Farol de aceite.** Rusty oil lantern.
- [x] `bote` — The boat.
- [ ] `cana` — **Caña de mar.** Reinforced rod with bone charms tied on.
- [ ] `casco-madera` — **Casco de madera.** Patched planks.
- [ ] `casco-reforzado` — **Casco reforzado.** Riveted plates sealed with barnacles; something breathes between the seams.
- [ ] `motor` — **Motor que tose.** Old outboard motor puffing smoke, an eye painted on it.

## Loot

Transparent 1254×1254 in `assets/loot/`. The game shows each beside its name; one without art
shows only the name.

- [x] `luz` — **La luz del faro.** The object you steal: a small lens with fire inside, wrapped in a rag.
- [x] `mecha` — **Mecha de farol.** Still warm.
- [x] `pinza` — **Pinza de latón.** A brass crab claw with a ring stuck in it.
- [x] `espina` — **Espina con veneno viejo.**
- [x] `red` — **Red remendada.** Patches in different colors.
- [x] `diente` — **Diente de leche.**
- [x] `perla` — **Perla turbia.** Something moving inside.
- [x] `lente` — **Lente de faro.** A curved fragment.
- [x] `concha` — **Concha que zumba.**
- [ ] `motor-tose` — **Motor que tose.** The Ruelas' outboard motor, still coughing, from the shark's belly.
- [x] `ancla` — **Ancla que respira.**
- [x] `corona` — **Corona de coral.**
- [x] `brujula` — **Brújula que apunta abajo.**
- [ ] `branquia` — **Branquia que flota.** One of the axolotl's black globes, still on its stalk.
- [ ] `escudo` — **Escudo de esturión.** A bony plate shaped like a monolith's vertebra.
- [ ] `flauta` — **Flauta de branquia.** A twisted gill tube that whistles on its own.
- [ ] `mano` — **Mano al revés.** A hand with its fingers bent the wrong way.
- [x] `pluma` — **Pluma con sal.**
- [x] `ojo-madera` — **Ojo de madera.** The figurehead's eye.
- [x] `idolo` — **Ídolo de algo que duerme.** A faceless figure with closed eyes carved all over its body. Redone; the first one, which showed Cthulhu, is `candidates/objects/idolo-primero.png`.

## Cards

- [ ] `dorso-chica`, `dorso-mediana`, `dorso-enorme` — Card backs: the creature's shadow seen from above the water, one per size. Used on the bite screen and in the printed deck.

## Not used

- The full-body Cthulhu: shows and names the god, which the game never does.
