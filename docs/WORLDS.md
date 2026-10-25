# Worlds

Grimfold's engine is world-agnostic: a world is data (Places, Personajes, creatures, loot names, story) plus an art set. **The MVP is built on the Sea.** The Inferno, B and C stay here as candidates for later volumes.

Every world shares one look: **cut-paper collage, moved like puppets**. That is the line from Lotte Reiniger's silhouette films (*The Adventures of Prince Achmed*, 1926) to Terry Gilliam's Monty Python animations to South Park's construction paper. We use their *technique*, never their characters. How the pieces are made and animated: [art-pipeline.md](art-pipeline.md).

> **Public domain, briefly.** In the US, everything published in 1930 or earlier is public domain as of 2026-01-01. A faithful photo of a public-domain 2D artwork adds no new copyright (US: *Bridgeman v. Corel*; EU: Directive 2019/790, art. 14). What is **not** free: modern translations, modern illustrations, film-specific designs and trademarks. Verify each source before it ships.

---

## The Sea — *the MVP world*

**One line:** a fishing town on a foggy bay switched off its lighthouse, and since then the fish come in on their own. You are the keeper's daughter, and you go out to find out what happened to him.

**Tone:** mysterious and expressive, not grimdark. Cosmic horror is hinted, never named: no Cthulhu, no Dagon, no Innsmouth. The horror is what the town agreed to and what the sea gives back.

### The bay (the MVP's one Lugar)

| Part | What it is |
|---|---|
| Muelle | The town's dock, between Mareas. The townspeople, the Encargos and the Repisa live here |
| Four Tipos de agua | Río, lago, mar, mar profundo. Each decides how deep you can go and what bites |
| Naufragios, islas, Eventos | Salas to explore between fishing |
| El faro | The lighthouse. The Luz is there, and so is the Farolero |

### The town

| Who | Role |
|---|---|
| Nico | A boy who still sees the lighthouse lit from his window. Gives Capítulo 1 |
| don Tomás | Keeps the town's register and the acta. Gives Capítulo 2 |
| Chela | Closed the door on the keeper. Gives Capítulo 3 |
| Marta | Lost a daughter to the lake. Encargos only |
| Ruelas padre | A fisherman whose boat came back empty. Fishes you out when you transform |

### The mystery

The town voted, eleven raised hands, to switch the lighthouse off. The keeper went into the water of his own will, so that something below would keep sleeping. The Farolero who guards the lighthouse now is the keeper, changed. Each Luz you steal from him wakes it a little more. Transforming makes the Arponera more like her father, which is why the Marcas carry the theme. Two Finales: relight the lighthouse (it sleeps again, the town goes back to fishing far out) or go down to him (the fish keep coming). The authored text lives in the code; this is only the shape. What lies under it, and the rules for writing more, is [LORE.md](../LORE.md).

### Sources and cautions

| What | Source | Note |
|---|---|---|
| Tone | Lovecraft, *Dagon* (1919) and *The Call of Cthulhu* (1928) | PD in the US. Read for tone; no names, no quotes |
| Tone | Lovecraft, *The Shadow over Innsmouth* (1936) | Copyright status disputed; tone reference only |
| Sea monsters | Olaus Magnus, *Carta Marina* (1539) | Reference for the creatures' shapes |
| Sea forms | Ernst Haeckel, *Kunstformen der Natur* (1904) | Reference for textures and silhouettes |
| Night sea | Gustave Doré, *The Rime of the Ancient Mariner* (1876) | Reference for mood |

- **The art is generated with Codex** from these references, never traced from them. Whether AI-generated art can be copyrighted is unsettled; Grimfold's license does not depend on it.
- The mystery and its people are ours; nothing comes from a modern Lovecraft adaptation.

---

## A · Inferno — candidate

**One line:** you descend the nine circles of Dante's Hell, floor by floor. You are not Dante.

**Why it fits.** Descent is already the book's structure. Each circle's punishment can be a mechanic, the nine circles are an expansion roadmap in order, and the Malebranche are mocking, almost comic demons that suit cut-out puppets.

| # | Place | Mechanic idea | Boss idea |
|---|---|---|---|
| 0 | Antinferno | Wasps: standing still costs Vida | Charon |
| 1 | Limbo | Fog: you only see adjacent Salas | Minos |
| 2 | Lust | Wind pushes you to another Sala | A pair of bound souls |
| 3 | Gluttony | Filthy rain: every move drains the Recurso | Cerberus, three attacks a round |
| 4 | Greed | Heavy loot, carry limit | Plutus |
| 5 | Wrath | Swamp: sink if you stop | Phlegyas |
| 6 | Heresy | Burning tombs: loot or fire | The Furies and Medusa |
| 7 | Violence | Three rings, three sub-rules | The Minotaur |
| 8 | Malebolge | Each Sala a different trick; the Malebranche lie | Malacoda |
| 9 | Cocytus | Ice: each step is earned | Lucifer |

**Sources:** Dante's Italian original; Longfellow (1867) and Mitre (1890s, verify edition) translations; Doré's *Inferno* engravings (1861); Botticelli's *Map of Hell*; Bosch, Bruegel, Holbein's *Dance of Death*, Piranesi's *Carceri*.
**Risks:** Dante is famous (EA's *Dante's Inferno*, 2010), so the protagonist and story must be our own; religious imagery stays literary and folk-medieval.

---

## B · Gothic Victorian, with steam — candidate

**One line:** the monsters of 19th-century novels are loose under the cities of Europe, and you hunt them with machines.

Places: the Paris Catacombs, the London Sewers (water rises each Sala), the Opera's underground lake, an automaton factory, Moreau's island, the Count's castle (the boss heals in the dark), the center of the Earth. Monsters as written in the novels: Frankenstein's creature (1818), Carmilla (1872), Hyde (1886), Dracula (1897), the Invisible Man (1897), Wells's Martians (1898), the Phantom (1910).

**Cautions:** avoid film designs (Universal's Frankenstein look is the studio's). Steampunk is crowded in indie games.

---

## C · The Void Cathedral — candidate

**One line:** a gothic cathedral-ship drifts dead in the void. You board it and descend deck by deck.

Places: a zero-gravity nave (movement overshoots), a flooded coolant deck, a plague sector, a machine sanctuary, the navigators' crypt (a dead pilot's map that sometimes lies).

**Cautions:** tone inspiration only. Warhammer 40,000 and Space Hulk are Games Workshop property: never Imperium, Astartes, Space Marine, Tyranid, Genestealer, Adeptus, Emperor of Mankind, or any of its faction or unit names.

---

## Decision log

| Date | Decision |
|---|---|
| 2026-10-22 | MVP on World A (Inferno). B and C kept for later volumes. The engine stays world-agnostic (`Place`, `HeroClass`… never "Circle" in code). |
| 2026-10-22 | MVP Places: Limbo (minimum Nivel 1) and Gluttony (minimum Nivel 4). MVP Classes: the Penitent (spends Vida) and the Friar (spends Fe). |
| 2026-10-22 | **Supersedes both rows above.** The MVP moves to the Sea: Lovecraftian cosmic horror, hinted and not grimdark, in cut-paper collage. Inferno, B and C stay as candidates. |
| 2026-10-22 | One Lugar (the bay) and one Personaje (the Arponera) instead of two Places and two Classes. Fishing is the fight. |
| 2026-10-22 | The story: the town switched off the lighthouse; the Farolero is the keeper, the Arponera's father. Three Capítulos, two Finales, Marcas as the cost of transforming. |
| 2026-10-22 | Art is generated with Codex as puppet sheets and cut with the scripts in `tools/art/`, instead of collaged from PD engravings. |
