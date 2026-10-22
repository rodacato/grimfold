# Grimfold — product brief

Stage: probe

## Who and what

For Adrian, who has 10–20 free minutes with nothing to play and ends up on TikTok/YouTube feeling
nothing. Grimfold is a grimdark, Diablo-ish dungeon crawler on the phone, set in Dante's Inferno
([WORLDS.md](WORLDS.md), World A) with a Doré cut-out collage look. One Piso per session, ≤10 min;
the Personaje, its Botín and the Historia carry over. Dice resolve; what you discover is
multipurpose Cartas (a Monstruo with the Botín it drops, or an Evento), one deck per Lugar. On paper
the same Carta is a d66 row on the Hoja de piso, so paper needs only the sheets, a pencil and 2d6.

## The bet

If the game exists, in my 10–20 min gaps I open it instead of TikTok/YouTube, because I want to
know what comes next for my Personaje. **False if** I stop opening it, or open it and close it
without finishing Pisos.

**MVP:** two Clases, each with its own Recurso and its own reason to descend: the Penitente
(spends Vida, descends to atone) and the Fraile (spends Fe, descends to rescue a soul). Two
Lugares: Limbo (Nivel 1, fog, Jefe Minos) and Gula (Nivel 4, attrition, Jefe Cerbero). A Historia
with at least 2 Finales, reached by choices and Clase. Spanish only, i18n-ready.

**Signal:** I finish the whole MVP twice, once per Clase (both Lugares and the final Jefe),
playing 2–3 days a week, with a median Piso of ≤10 min, as the local Registro de sesiones records.
Measured from the skeleton on.

**Appetite:** 6 weeks, 2026-10-22 → 2026-12-03, played while it is built.

## Demo

1. Abro el juego en mi celular (instalado como app) y veo a mi personaje donde lo dejé: nivel, equipo y el siguiente piso de la historia.
2. Toco "Bajar" y entro al piso 3 del primer círculo: veo un mapa chico de 5–7 salas.
3. Elijo una sala, peleo con un monstruo tirando 2d6 y decido si gasto un recurso para asegurar el golpe.
4. Cae botín: veo su rareza por color y decido si lo equipo o lo tiro.
5. Llego al jefe del piso. Gane o muera, veo qué conservo y la siguiente línea de la historia. Todo en menos de 10 minutos.
6. Si cierro la app a la mitad y vuelvo después, sigue exactamente donde estaba.
7. En casa imprimo mi hoja de personaje y un piso, y lo juego completo en papel con lápiz y 2 dados, con las mismas reglas.

## Not now

Paper ↔ web sync · QR codes and unlocks · expansions (both arrive as new Cartas, so the model must
allow them; Gula proves it) · multiplayer · more than 2 Clases, 2 Lugares or 2 Finales · languages other than Spanish.

## Non-negotiables

| Property | Gate |
|---|---|
| A Piso takes ≤10 min | `GATES.md` → `N1` |
| Visual quality is first-class, on phone and on paper | `GATES.md` → `N2` |
| Plays on paper with the same rules and no extra components | `GATES.md` → `N3`, `N3b` |
| Losing is never wasted time | `GATES.md` → `N4` |
| Balance is proven with numbers | `GATES.md` → `N5` |
| Real challenge, no power creep | `GATES.md` → `N6` |
| The Historia does not feel repetitive | `GATES.md` → `N7` |
| Works offline and never loses a run | `GATES.md` → `N8`, `N8b` |
| Open and free: public, no accounts, ads or payments | `GATES.md` → `N9` |
| i18n-ready | `GATES.md` → `N10` |

## Current focus

Probe: Adrian picks one of three visual directions for the cut-out look, shown on the Piso screen
and on a printed Hoja de piso. Then a paper checkpoint around week 2 (~2026-11-05): one Piso of
Limbo played on paper, to see the shape early. (as of 2026-10-22)

Stack: TypeScript, Vite, PWA, IndexedDB, Vitest (rules and balance simulation), GitHub Pages via
Actions.
