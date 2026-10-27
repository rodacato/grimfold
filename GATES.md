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
  EVIDENCE: automatic-evidence=v1; definition-sha256=cd15a2dc0a46bba1de8dacb59dc41c523f4897c49a8a28341a7b15cfc03b9c87; exit=0; EXPECT=matched; output-sha256=c5866562d97ea946a6822d574f3ad0f6c39268775482aeba5034ce02969859ac; output-bytes=182

- [ ] N2: every demo screen passes `ui-review` with no blocking findings, on phone and on the printed sheets, in the cut-paper direction chosen in the probe
  EVIDENCE: pending

- [ ] N3: a printed Marea is played to the end with only the Hoja de campaña, the Hoja de marea, a pencil and the dice, without opening the web
  EVIDENCE: pending

- [x] N3b: every Carta of the bay's Mazo has exactly one d66 row on the Hoja de marea, with the same content
  CHECK: npx vitest run tests/gates/n3-paper-parity.test.ts && echo GATE-N3B-OK
  EXPECT: GATE-N3B-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=d4c1749096a53c2d5602f0bb328e621d893d4e6aab387f41e7f155526b88116b; exit=0; EXPECT=matched; output-sha256=8c0dfa0651e4a7af5a7ca8039be70a29ecc795fe19ba0a95a11a6687c4510a4c; output-bytes=221

- [x] N4: every Marea, won or lost, keeps something (Bestiario, Equipo or Repisa), and a Campaña lost to the third Marca keeps the Bestiario for the next one
  CHECK: npx vitest run tests/gates/n4-loss-progress.test.ts && echo GATE-N4-OK
  EXPECT: GATE-N4-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=6301551d1bb7dd8e7c96128d07a6daa62ce53b6925a25265be6219695d44db7c; exit=0; EXPECT=matched; output-sha256=cf919f1e3a2ee4b443a8dac5d8ea147149f9caf261de521cfaa5e4a1c2830855; output-bytes=182

- [x] N5: bringing the Luz home succeeds 45–65% of the time with each Capítulo's expected Equipo; a Campaña takes 6–12 Mareas; with 2 Marcas, sailing straight to the lighthouse and back does not transform the Arponera on its own
  CHECK: npx vitest run tests/gates/n5-balance.test.ts && echo GATE-N5-OK
  EXPECT: GATE-N5-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=4ceaa4e1038d3f66d475da0d249a4142c6fa4acfff7f9d96f03494b94fd2dccf; exit=0; EXPECT=matched; output-sha256=d3708d3147e256a31aa01a694803e8d10d2bec641f31c5a41c9e07a6a72bdaa8; output-bytes=183

- [x] N6: with the best reachable Equipo, bringing the Luz home succeeds at most 85% of the time
  CHECK: npx vitest run tests/gates/n6-power-cap.test.ts && echo GATE-N6-OK
  EXPECT: GATE-N6-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=1f8d8ecacac5d4578938c777068885e3a80fd9fd0598e0618e9c876cb1f7de33; exit=0; EXPECT=matched; output-sha256=05d8d49f5e410861b4e1a8e97f60e619fc866ffed8fa926963007e5819fd596c; output-bytes=207

- [x] N7: no Historia text repeats within one simulated Campaña, and both Finales are reachable
  CHECK: npx vitest run tests/gates/n7-story.test.ts && echo GATE-N7-OK
  EXPECT: GATE-N7-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=efe0c635c4ca202d4a3dc4d4734eb626b407bb06c7a898af0feb330e1219193e; exit=0; EXPECT=matched; output-sha256=963ce77ab403896f9f33d4aa948cecea14e09a3f33b6c49378f6ecb4eb19d936; output-bytes=218

- [x] N8: closing the app mid-Marea and reopening it restores the exact state from IndexedDB
  CHECK: npx vitest run tests/gates/n8-resume.test.ts && echo GATE-N8-OK
  EXPECT: GATE-N8-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=cd7647a21b891642b7c5d1172b22cc41ab7b257c1f7b86ba5c0ce6739b3c71b6; exit=0; EXPECT=matched; output-sha256=abe8b0cdaca550080bd45136ba960f25055f5791269968768b7988483828e2d2; output-bytes=220

- [ ] N8b: the installed PWA opens and plays a Marea in airplane mode on Adrian's phone
  EVIDENCE: pending

- [ ] N9: the repo is public, the game is served from GitHub Pages, and nothing asks for an account or a payment or shows ads
  EVIDENCE: pending

- [x] N10: every UI and content string comes from a locale file; a hardcoded string fails the test
  CHECK: npx vitest run tests/gates/n10-i18n.test.ts && echo GATE-N10-OK
  EXPECT: GATE-N10-OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=3d38ebea07796db67dd896990a7ea0fa5177c33e53483e06b1352fbc6d2357fd; exit=0; EXPECT=matched; output-sha256=860f07e5ea1bafb20fa0d1456ce75810108a076721f2ce6144b02e3d43ba6555; output-bytes=221
