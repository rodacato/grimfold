# Standing gates

The properties that must hold for as long as Grimfold exists: one gate per non-negotiable in
[docs/BRIEF.md](docs/BRIEF.md). Every `CHECK:` is a test CI runs; each prints its marker only when
it passes. Every scope close re-verifies this file. A failing gate means the product is broken. A
missing gate is not allowed.

Simulations run the Arponera with a fixed seed and ≥1,000 runs, playing toward the lighthouse,
unless a gate says otherwise.

- [x] N1: the simulated median Marea takes at most 40 rolls plus decisions (~15 s each, so ≤10 min)
  CHECK: npx vitest run tests/gates/n1-tide-length.test.ts && echo GATE-N1-OK
  EXPECT: GATE-N1-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=cd15a2dc0a46bba1de8dacb59dc41c523f4897c49a8a28341a7b15cfc03b9c87; exit=0; EXPECT=matched; output-sha256=cdfebc0791321b5a3ef536b309138145dd4f1968be28ac4dc950489e6b3e8337; output-bytes=182

- [ ] N2: every demo screen passes `ui-review` with no blocking findings, on phone and on the printed sheets, in the cut-paper direction chosen in the probe
  EVIDENCE: pending

- [ ] N3: a printed Marea is played to the end with only the Hoja de campaña, the Hoja de marea, a pencil and the dice, without opening the web
  EVIDENCE: pending

- [x] N3b: every Carta of the bay's Mazo has exactly one d66 row on the Hoja de marea, with the same content
  CHECK: npx vitest run tests/gates/n3-paper-parity.test.ts && echo GATE-N3B-OK
  EXPECT: GATE-N3B-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=d4c1749096a53c2d5602f0bb328e621d893d4e6aab387f41e7f155526b88116b; exit=0; EXPECT=matched; output-sha256=f92e510d49e04fbfc67b0eaad68dab90275b40e70ca4530803ad3541c9281b62; output-bytes=220

- [x] N4: every Marea, won or lost, keeps something (Bestiario, Equipo or Repisa), and a Campaña lost to the third Marca keeps the Bestiario for the next one
  CHECK: npx vitest run tests/gates/n4-loss-progress.test.ts && echo GATE-N4-OK
  EXPECT: GATE-N4-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=6301551d1bb7dd8e7c96128d07a6daa62ce53b6925a25265be6219695d44db7c; exit=0; EXPECT=matched; output-sha256=379ecce401a475393c845127075c44d16e7087e9565a2339ad2713016f9204c4; output-bytes=207

- [ ] N5: bringing the Luz home succeeds 45–65% of the time with each Capítulo's expected Equipo; a Campaña takes 6–12 Mareas; with 2 Marcas, sailing straight to the lighthouse and back does not transform the Arponera on its own
  CHECK: npx vitest run tests/gates/n5-balance.test.ts && echo GATE-N5-OK
  EXPECT: GATE-N5-OK
  EVIDENCE: pending

- [ ] N6: with the best reachable Equipo, bringing the Luz home succeeds at most 85% of the time
  CHECK: npx vitest run tests/gates/n6-power-cap.test.ts && echo GATE-N6-OK
  EXPECT: GATE-N6-OK
  EVIDENCE: pending

- [x] N7: no Historia text repeats within one simulated Campaña, and both Finales are reachable
  CHECK: npx vitest run tests/gates/n7-story.test.ts && echo GATE-N7-OK
  EXPECT: GATE-N7-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=efe0c635c4ca202d4a3dc4d4734eb626b407bb06c7a898af0feb330e1219193e; exit=0; EXPECT=matched; output-sha256=e0cc14db227889d21e3dc796091493549862bc3c0969257b8f27c040021e7bce; output-bytes=218

- [x] N8: closing the app mid-Marea and reopening it restores the exact state from IndexedDB
  CHECK: npx vitest run tests/gates/n8-resume.test.ts && echo GATE-N8-OK
  EXPECT: GATE-N8-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=cd7647a21b891642b7c5d1172b22cc41ab7b257c1f7b86ba5c0ce6739b3c71b6; exit=0; EXPECT=matched; output-sha256=51d7dea3b4b2d00a628d076b1b8e372f2466309a37a83e0afdcb86d60125a328; output-bytes=220

- [ ] N8b: the installed PWA opens and plays a Marea in airplane mode on Adrian's phone
  EVIDENCE: pending

- [ ] N9: the repo is public, the game is served from GitHub Pages, and nothing asks for an account or a payment or shows ads
  EVIDENCE: pending

- [x] N10: every UI and content string comes from a locale file; a hardcoded string fails the test
  CHECK: npx vitest run tests/gates/n10-i18n.test.ts && echo GATE-N10-OK
  EXPECT: GATE-N10-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=3d38ebea07796db67dd896990a7ea0fa5177c33e53483e06b1352fbc6d2357fd; exit=0; EXPECT=matched; output-sha256=a414cf56f781a35da8c560f387933568fc44233c2430f24f20f501f2c7dd4ab5; output-bytes=221
