# Grimfold — product brief

Stage: build (skeleton closed 2026-10-23: the seven steps run end to end and Adrian confirmed the shape on his phone; the paper walk moves to the paper checkpoint)

## Who and what

For Adrian, who has 10–20 free minutes with nothing to play and ends up on TikTok/YouTube feeling
nothing. Grimfold is a sea-horror crawler on the phone, in cut-paper collage
([WORLDS.md](WORLDS.md)). You are the lighthouse keeper's daughter: each Marea you sail out, fish
horrors by fighting them with 2d6, steal the Luz from the Farolero and run home with it, and each
Capítulo brings you closer to what happened to your father. The Equipo, the Marcas and the
Historia carry over. On paper, the same Mazo is a d66 table on the Hoja de marea, so paper needs
only the sheets, a pencil and 2d6. Vocabulary: [GLOSSARY.md](GLOSSARY.md).

## The bet

If the game exists, in my 10–20 min gaps I open it instead of TikTok/YouTube, because I want to
know what comes next in the mystery. **False if** I stop opening it, or open it and close it
without finishing Mareas.

**MVP:** one Lugar (the bay: town, lighthouse, four Tipos de agua), one Personaje (the Arponera),
a Historia of three Capítulos and two Finales, Encargos that level the Equipo, Marcas that carry
the cost of transforming. Spanish only, i18n-ready.

**Signal:** I finish the Campaña twice and see both Finales, playing 2–3 days a week, with a median
Marea of ≤10 min, as the local Registro de sesiones records. Measured from the skeleton on.

**Appetite:** 3 weeks, 2026-10-22 → 2026-11-12, played while it is built. Paper checkpoint around
2026-10-29: one Marea played on paper, even on an ugly sheet. If late, cut in this order without
renegotiating: (1) paper moves after the MVP and demo step 7 stays open; (2) the Arponera's puppet;
(3) Encargos go from 9 to 5.

## Demo

1. Abro Grimfold en mi celular, instalado como app, y veo el Muelle: quién del pueblo me pide algo, en qué capítulo voy, mi Equipo y mis marcas.
2. Toco "Bajar" y veo el Mapa con bruma; elijo a qué Sala navegar.
3. En agua abierta decido qué tan hondo bajo, lanzo, veo una sombra y peleo lo que pica con 2d6, gastando Vida o un Botín si hace falta.
4. Sube una Carta que se desdobla y decido: a la Bodega, al bestiario (me cuesta Cordura) o usarla.
5. Llego al faro, robo la Luz y huyo del Farolero hasta el Muelle. Gane o pierda, veo qué conservo, qué marca me quedó y qué descubrí del misterio. Todo en menos de 10 minutos.
6. Si cierro la app a la mitad y vuelvo, sigue exactamente donde estaba.
7. En casa imprimo la Hoja de marea y la juego completa en papel con lápiz y 2 dados, con las mismas reglas.

## Not now

More than one Lugar · more Personajes or Clases · more than 3 Capítulos or 2 Finales · the probe's
Laboratorio mechanics (Cordura that lies, dice drafting, chained bait, a Mapa drawn on arrival,
campaign clock, daily sea, streaks) · a spatial Bodega · shops, money or selling in the town (the
Encargos are the only trade) · new townspeople, such as a mayor, until the story is played · animation beyond two puppets (Farolero,
Arponera) and layered locations · sound and music · final art on every screen (missing art ships as
a paper silhouette; art never blocks a screen) · paper ↔ web sync, QR codes, multiplayer, languages
other than Spanish.

## Non-negotiables

| Property | Gate |
|---|---|
| A Marea takes ≤10 min | `GATES.md` → `N1` |
| Visual quality is first-class, on phone and on paper | `GATES.md` → `N2` |
| Plays on paper with the same rules and no extra components | `GATES.md` → `N3`, `N3b` |
| Losing is never wasted time | `GATES.md` → `N4` |
| Balance is proven with numbers | `GATES.md` → `N5` |
| Real challenge, no power creep | `GATES.md` → `N6` |
| The Historia does not repeat itself | `GATES.md` → `N7` |
| Works offline and never loses a Marea | `GATES.md` → `N8`, `N8b` |
| Open and free: public, no accounts, ads or payments | `GATES.md` → `N9` |
| i18n-ready | `GATES.md` → `N10` |

## Current focus

Build: the look. The cut-paper language the probe proved goes into every screen, one demo step at a
time, with the Codex art from [ASSETS.md](../ASSETS.md). Paper checkpoint around 2026-10-29. Live at
rodacato.github.io/grimfold. (as of 2026-10-23)

Stack: TypeScript, Vite, PWA, IndexedDB, Vitest (rules and balance simulation), GitHub Pages via
Actions.
