# Standing gates

The properties that must hold for as long as Grimfold exists: one gate per non-negotiable in
[docs/BRIEF.md](docs/BRIEF.md). Every `CHECK:` is a test CI runs; each prints its marker only when
it passes. Every scope close re-verifies this file. A failing gate means the product is broken. A
missing gate is not allowed.

Simulations run both Clases, with a fixed seed and ≥1,000 runs each, unless a gate says otherwise.

- [ ] N1: the simulated median Piso takes at most 40 rolls plus decisions (~15 s each, so ≤10 min)
  CHECK: npx vitest run tests/gates/n1-floor-length.test.ts && echo GATE-N1-OK
  EXPECT: GATE-N1-OK
  EVIDENCE: pending

- [ ] N2: Adrian picked one of three visual directions in the probe, and every demo screen passes `ui-review` with no blocking findings, on phone and on the printed sheets
  EVIDENCE: pending

- [ ] N3: a printed Piso is played to the end with only the Hoja de personaje, the Hoja de piso, a pencil and the dice, without opening the web
  EVIDENCE: pending

- [ ] N3b: every Carta of each Lugar's deck has exactly one d66 row on that Lugar's Hoja de piso, with the same content
  CHECK: npx vitest run tests/gates/n3-paper-parity.test.ts && echo GATE-N3B-OK
  EXPECT: GATE-N3B-OK
  EVIDENCE: pending

- [ ] N4: death always keeps something, and a Personaje is stronger after 3 straight losses than before them
  CHECK: npx vitest run tests/gates/n4-loss-progress.test.ts && echo GATE-N4-OK
  EXPECT: GATE-N4-OK
  EVIDENCE: pending

- [ ] N5: each Lugar's Jefe is won 45–65% of the time by a Personaje at that Lugar's minimum Nivel, and reaching Gula's minimum Nivel takes 3–5 Pisos
  CHECK: npx vitest run tests/gates/n5-balance.test.ts && echo GATE-N5-OK
  EXPECT: GATE-N5-OK
  EVIDENCE: pending

- [ ] N6: with the best reachable Equipo, no Lugar's Jefe is won more than 85% of the time
  CHECK: npx vitest run tests/gates/n6-power-cap.test.ts && echo GATE-N6-OK
  EXPECT: GATE-N6-OK
  EVIDENCE: pending

- [ ] N7: no Historia text or Evento repeats within one simulated campaign run, and each Clase can reach at least 2 Finales
  CHECK: npx vitest run tests/gates/n7-story.test.ts && echo GATE-N7-OK
  EXPECT: GATE-N7-OK
  EVIDENCE: pending

- [ ] N8: closing the app mid-Piso and reopening it restores the exact state from IndexedDB
  CHECK: npx vitest run tests/gates/n8-resume.test.ts && echo GATE-N8-OK
  EXPECT: GATE-N8-OK
  EVIDENCE: pending

- [ ] N8b: the installed PWA opens and plays a Piso in airplane mode on Adrian's phone
  EVIDENCE: pending

- [ ] N9: the repo is public, the game is served from GitHub Pages, and nothing asks for an account or a payment or shows ads
  EVIDENCE: pending

- [ ] N10: every UI and content string comes from a locale file; a hardcoded string fails the test
  CHECK: npx vitest run tests/gates/n10-i18n.test.ts && echo GATE-N10-OK
  EXPECT: GATE-N10-OK
  EVIDENCE: pending
