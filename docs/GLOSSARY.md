# Glossary

> The product's vocabulary, one term per row, used identically in conversation, tickets, code and UI.
> Born in the `flow-mvp` grill on 2026-10-22; rewritten the same day when the world moved from the
> Inferno to the sea.
>
> **When a term changes meaning**, this file changes in the same PR as the code — or the code is renamed to match it.
> **Language:** the term as the UI shows it (Spanish); the code name as the code spells it (English).

---

## The campaign

| Term | Means | Not to confuse with | In code |
|---|---|---|---|
| Arponera | The only Personaje: the lighthouse keeper's daughter. Persists across Mareas | Farolero: what keeps her father's watch in the tower | `Hero` |
| Muelle | The town's dock: the screen between Mareas, where the Capítulo, the Encargos and the Equipo live | Mapa's starting Sala, which is also the Muelle | `Dock` |
| Campaña | One playthrough of the Historia, from the first Capítulo to a Final or to the third Marca | Marea: one outing inside it | `Campaign` |
| Marea | One outing to sea: from Bajar to coming back (or not). Playable in ≤10 min | Campaña | `Tide` |
| Bajar | Starting a Marea. The main call to action | — | `descend()` |
| Historia | The authored story: three Capítulos and two Finales | Evento: a one-off happening in a Sala | `Story` |
| Capítulo | One part of the Historia. Someone from the town asks for the Luz (and sometimes a piece); completing it reveals part of the mystery | Encargo: a side request that improves the Equipo | `Chapter` |
| Final | One of the two endings, chosen after the third Capítulo: light the lighthouse or go down to him | — | `Ending` |
| Encargo | A townsperson asks for a specific Botín; delivering it raises one Equipo piece a level | Capítulo | `Request` |
| Repisa | Where the Botín brought home is kept between Mareas, waiting for an Encargo or a Capítulo | Bodega: what you carry at sea | `Shelf` |
| Cebo | A Botín nobody asked for, spent at the Muelle so a Carta that drops something wanted is the first bite next Marea, when you cast in its water as deep as it lives | Encargo: a trade for Equipo | `bait` |
| Marca | What a transformation leaves: the Cordura maximum drops 1 for the rest of the Campaña and the Mutación stays. The third Marca loses the Campaña | Mutación: the power a Marca brings | `Scar` |
| Mutación | A power gained by losing Cordura: Ojos de bruma (see Vida), Brazo de ventosas (+1 damage). Temporary within a Marea, permanent once it comes with a Marca | Equipo | `Mutation` |
| Bestiario | The record of the creatures you chose to write down. Writing one costs Cordura maximum for that Marea; it survives across Campañas | Mazo | `Bestiary` |

## At sea

| Term | Means | Not to confuse with | In code |
|---|---|---|---|
| Lugar | A sea with its own Mapa layout and Mazo. The MVP has one: the bay | Tipo de agua | `Place` |
| Mapa | The layout of a Marea's Salas, revealed as you sail. Never called "carta náutica" | Carta | `SeaMap` |
| Sala | One point of the Mapa: open water, shipwreck, island, Evento, the lighthouse or the Muelle | — | `Room` |
| Tipo de agua | Río, lago, mar or mar profundo. Decides the deepest Profundidad and what can bite | Lugar | `waterType` |
| Profundidad | How deep you cast, 1 to 4. Going one deeper costs a d6 roll against Cordura | — | `depth` |
| Lance | One cast in a Sala of open water. Each such Sala has 3 | — | `cast` |
| Sombra | What you see of a Carta before it surfaces: small, medium or huge | Carta | `shadow` |
| Carta | One thing from the Mazo: a creature with its Botín. Unfolds when it surfaces. On paper, a d66 row | Mapa, Sombra | `Card` |
| Mazo | The bay's set of Cartas. On paper, the d66 table on the Hoja de marea | — | `Deck` |
| Errante | A creature that finds you when Cordura is low; it comes to you, you do not cast for it | Carta from a Lance | `Wanderer` |
| Evento | A one-off happening in a Sala, with a choice | Historia | `Event` |
| Jefe | El Farolero. He is not killed: you steal the Luz and survive him back to the Muelle | — | `Boss` |
| Luz | The lighthouse light. Stealing it wakes the Farolero; bringing it home completes the Luz part of a Capítulo | — | `Light` |

## Resources and things

| Term | Means | Not to confuse with | In code |
|---|---|---|---|
| Vida | Hit points. At 0 you sink and the Marea ends. Comes back full between Mareas | Cordura | `hp` |
| Cordura | The Marea's clock: drops with time, depth, Eventos and the Farolero. At 0 you transform. Its maximum drops with each Marca | Vida | `sanity` |
| Sangrar | Spending 2 Vida after a failed roll to turn it into a hit | — | `bleed()` |
| Sedal | The fishing line in a fight: 4–6 knots. When it runs out, the creature escapes | — | `line` |
| Equipo | The boat's five pieces, each with 3 levels: Caña, Sedal, Farol, Motor, Casco. Kept across Mareas | Botín | `gear` |
| Botín | A piece a creature drops. Use it once at sea (Golpe, Nudo, Ojo, Calma, Huida) or bring it home for an Encargo or a Capítulo | Equipo | `Loot` |
| Bodega | The boat's hold: 6 spaces for Botín during a Marea. Lost if you sink or transform | Repisa | `hold` |
| Rareza | Común ○, Extraño ◐, Abisal ●, Innombrable ✶. Always symbol and color together | — | `rarity` |

## Paper and records

| Term | Means | Not to confuse with | In code |
|---|---|---|---|
| Hoja de marea | The printable page with the bay's Mapa, the Mazo's d66 table and the Marea's tracks | Hoja de campaña | `TideSheet` |
| Hoja de campaña | The printable sheet that holds the Campaña's state: Equipo, Marcas, Bestiario, Capítulo | Hoja de marea | `CampaignSheet` |
| Registro de sesiones | Local log of each Marea (date, duration, ending, Cordura lost and why) that measures the bet | Partida guardada: the game state itself | `SessionLog` |
