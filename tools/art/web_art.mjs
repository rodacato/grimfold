// Horrors keyed out of their petrol, lossless; a horror with cortes.json also gets its puppet rig.
// Needs ffmpeg and cwebp on PATH. Usage: node tools/art/web_art.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const SOURCE = "assets/horrors";
const TARGET = "assets/web/horrors";
const RIGS = "src/content/bay/puppets.json";
const KEY_AND_SIZE = "colorkey=0x123f45:0.08:0.06,scale='min(iw,900)':-1:flags=lanczos";

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
  if (result.status !== 0) throw new Error(`${cmd} failed: ${result.stderr}`);
}

mkdirSync(TARGET, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), "grimfold-art-"));
const files = readdirSync(SOURCE).filter((f) => f.endsWith(".png") && f !== "farolero.png");
for (const file of files) {
  const keyed = join(scratch, "keyed.png");
  run("ffmpeg", ["-loglevel", "error", "-y", "-i", join(SOURCE, file), "-vf", KEY_AND_SIZE, keyed]);
  run("cwebp", ["-quiet", "-lossless", "-exact", "-z", "9", keyed, "-o", join(TARGET, `${basename(file, ".png")}.webp`)]);
}
rmSync(scratch, { recursive: true });
console.log(`${files.length} horrors → ${TARGET}`);

// Layers stay at full size: scaling each cut on its own would open hairline seams between them.
const rigs = {};
for (const id of readdirSync(SOURCE).filter((d) => existsSync(join(SOURCE, d, "cortes.json")))) {
  const cuts = JSON.parse(readFileSync(join(SOURCE, id, "cortes.json"), "utf8"));
  mkdirSync(join(TARGET, id), { recursive: true });
  const pieces = cuts.capas.map((layer, i) => {
    const [x, y, w, h] = layer.bbox;
    const crop = ["-crop", x, y, w, h].map(String);
    run("cwebp", ["-quiet", "-lossless", "-exact", "-z", "9", ...crop, join(SOURCE, id, layer.archivo), "-o", join(TARGET, id, `${layer.id}.webp`)]);
    if (i === 0) return { id: layer.id, x, y, w, pivot: null, file: `${layer.id}.webp` };
    const [px, py] = layer.pivote;
    const big = Math.max(w, h) > cuts.lienzo[0] * 0.4;
    return {
      id: layer.id,
      x,
      y,
      w,
      pivot: [+((px - x) / w).toFixed(3), +((py - y) / h).toFixed(3)],
      file: `${layer.id}.webp`,
      sway: big ? 1 : 3,
      beat: +(1.7 + (i % 4) * 0.4).toFixed(1),
    };
  });
  rigs[id] = { size: cuts.lienzo, pieces };
}
writeFileSync(RIGS, `${JSON.stringify(rigs, null, 2)}\n`);
run("npx", ["biome", "format", "--write", RIGS]);
console.log(`${Object.keys(rigs).length} puppets → ${RIGS}`);
