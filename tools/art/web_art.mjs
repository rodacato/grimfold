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

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const toWebp = (src, out, crop = []) =>
  run("cwebp", ["-quiet", "-lossless", "-exact", "-z", "9", ...crop.map(String), src, "-o", out]);

function rig(id) {
  const cuts = readJson(join(SOURCE, id, "cortes.json"));
  const lapsFile = join(SOURCE, id, "solapes.json");
  const laps = existsSync(lapsFile) ? readJson(lapsFile).assets : [];
  const [W, H] = cuts.lienzo;
  const layers = cuts.capas;
  // sin_solape alone is a fixed piece (a floor); with `movimiento` it floats free, like a school's fish.
  const still = (i) => i === 0 || Boolean(layers[i].sin_solape && !layers[i].movimiento);
  const joints = (i) => (still(i) ? [] : [...joints(layers[i].parent ?? 0), layers[i].id]);
  const ancestors = (i) => joints(layers[i].parent ?? 0);
  mkdirSync(join(TARGET, id), { recursive: true });

  // Overlaps sit at the back, hidden under opaque paper until their piece moves.
  const back = laps.map((lap) => {
    const name = basename(lap.archivo, ".png");
    toWebp(join(SOURCE, id, lap.archivo), join(TARGET, id, `${name}.webp`));
    const owner = lap.seguir ?? layers.findIndex((l) => l.id === lap.pieza);
    return { id: name, x: 0, y: 0, w: W, h: H, pivot: null, file: `${name}.webp`, follows: joints(owner) };
  });
  const order = cuts.orden_superior_a_inferior?.toReversed() ?? layers.map((_, i) => i);
  // Layers stay at full size: scaling each cut on its own would open hairline seams between them.
  const front = order.map((i) => {
    const layer = layers[i];
    const [x, y, w, h] = layer.bbox;
    toWebp(join(SOURCE, id, layer.archivo), join(TARGET, id, `${layer.id}.webp`), ["-crop", x, y, w, h]);
    const piece = { id: layer.id, x, y, w, h, pivot: null, file: `${layer.id}.webp`, follows: ancestors(i) };
    if (still(i)) return piece;
    const [px, py] = layer.pivote;
    return {
      ...piece,
      pivot: [+((px - x) / w).toFixed(3), +((py - y) / h).toFixed(3)],
      sway: Math.max(w, h) > W * 0.4 ? 1 : 3,
      beat: +(1.7 + (i % 4) * 0.4).toFixed(1),
    };
  });
  const pieces = [...back, ...front].map(({ follows, ...p }) => (follows.length ? { ...p, follows } : p));
  return { size: cuts.lienzo, pieces };
}

const rigs = {};
for (const id of readdirSync(SOURCE).filter((d) => existsSync(join(SOURCE, d, "cortes.json")))) rigs[id] = rig(id);
writeFileSync(RIGS, `${JSON.stringify(rigs, null, 2)}\n`);
run("npx", ["biome", "format", "--write", RIGS]);
console.log(`${Object.keys(rigs).length} puppets → ${RIGS}`);
