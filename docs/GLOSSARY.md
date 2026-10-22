# Glossary

> The product's vocabulary, one term per row, used identically in conversation, tickets, code and UI.
> Born in the `flow-mvp` grill on 2026-10-22.
>
> **When a term changes meaning**, this file changes in the same PR as the code — or the code is renamed to match it.
> **Language:** the term as the UI shows it (Spanish); the code name as the code spells it (English).

---

| Term | Means | Not to confuse with | In code |
|---|---|---|---|
| Personaje | The hero the player controls. Persists across sessions: level, gear, XP, story progress. The MVP has two, mechanically very different | Clase: the template a Personaje is created from | `Hero` |
| Clase | The template a Personaje is created from (stats, rules it breaks, starting gear). MVP: 2 | Personaje: an instance with its own progress | `HeroClass` |
| Nivel | The Personaje's level, raised by XP. Gates entry to Lugares | Profundidad: how deep a Piso is | `level` |
| Experiencia (XP) | Earned by defeating monsters and bosses; kept on death | Oro or Botín | `xp` |
| Lugar | A kind of place with its own terrain, monsters, rule and atmosphere. Has a minimum Nivel to enter. MVP: 2. In World A (Inferno) each Lugar is a **Círculo** (Limbo, Gula…) and the UI may show that word; the code stays world-agnostic | Piso: one session inside a Lugar | `Place` |
| Piso | One session: a short dungeon of 5–7 Salas ending in a Jefe, playable in ≤10 min | Lugar: the kind of place the Piso belongs to | `Floor` |
| Bajar | Starting a Piso. The main call to action | — | `descend()` |
| Mapa | The layout of a Piso's Salas and how they connect | Lugar | `FloorMap` |
| Sala | One room of a Piso; holds a monster, Botín, an event or nothing | Piso | `Room` |
| Monstruo | An enemy in a Sala, belongs to a Lugar's roster | Jefe | `Monster` |
| Jefe | The final enemy of a Piso (or of a Lugar's story). Victory or death closes the Piso | Monstruo | `Boss` |
| Recurso | The Personaje's spendable resource used to secure a hit after seeing the dice (the Veladora lesson: clock + weapon). One per Clase: the Penitente spends Vida, the Fraile spends Fe. The UI shows the Clase's own name, never "Recurso" | Oro | `resource` |
| Vida | Hit points. At 0 the Personaje dies and the Piso ends. For the Penitente it is also the Recurso | Fe | `hp` |
| Fe | The Fraile's Recurso: a depleting clock that is also a weapon | Vida | `faith` |
| Carta | One thing discovered in a Sala: a Monstruo with the Botín it drops, or an Evento. Multipurpose. On the phone it is flipped; on paper it is a d66 row on the Hoja de piso, same content and ID. Expansions and future QR codes add Cartas | Botín: what a Carta can yield | `Card` |
| Mazo | A Lugar's set of Cartas. On paper, the d66 table on its Hoja de piso | Lugar | `Deck` |
| Equipo | The items worn in the Personaje's limited slots (arma, armadura, amuleto, cinturón, mochila — draft) | Botín: an item not yet equipped | `gear` |
| Botín | An item that drops (from a monster, chest or boss), with a Rareza. Equip it, keep it or discard it | Equipo | `Loot` |
| Rareza | Item tier shown by color (común → legendario, draft from the 2d6 sum) | Nivel | `rarity` |
| Historia | The authored story that advances as Pisos are cleared, with choices and more than one ending | Evento: a one-off happening inside a Sala | `Story` |
| Final | One of the story's endings, reached by choices and Clase | — | `Ending` |
| Hoja de personaje | The printable sheet that holds a Personaje's state for paper play | Hoja de piso: the printable Mapa of one Piso | `HeroSheet` |
| Hoja de piso | The printable page with one Piso's Mapa and its tables | Hoja de personaje | `FloorSheet` |
| Registro de sesiones | Local log of each session (date, duration, Piso, finished or not) that measures the bet | Partida guardada: the game state itself | `SessionLog` |
