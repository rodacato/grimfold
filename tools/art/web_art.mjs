// Builds assets/web/, the only folder the site publishes, from the originals. Needs ffmpeg on PATH and the
// .venv of docs/art-pipeline.md. With TINYPNG set (node --env-file=.env tools/art/web_art.mjs) PNGs over
// 20 KB are compressed once.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative } from "node:path";

const ASSETS = "assets/raw";
const WEB = "assets/web";
const CACHE = "assets/tinify.json";
const RIGS = "src/content/bay/puppets.json";
const VERSIONS = "src/ui/art-versions.json";
const PYTHON = ".venv/bin/python";
const BBOX = "tools/art/bbox.py";
const KEY_AND_SIZE = "colorkey=0x123f45:0.08:0.06,scale='min(iw,900)':-1:flags=lanczos";
const TINY_FROM = 20 * 1024;

const LOCATIONS = [
  "rio-estero",
  "lago-campanario",
  "mar-abierto",
  "mar-profundo",
  "naufragio-cementerio",
  "naufragio-ruelas",
  "isla-fogata",
  "isla-observatorio",
  "evento-boya",
  "evento-sal",
  "evento-nombre",
  "evento-sirena",
  "carta-bahia",
  "faro-exterior",
  "faro-lampara",
  "final-faro",
  "final-bajar",
];

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) throw new Error(`${cmd} failed: ${result.stderr}`);
  return result.stdout.toString();
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const pngs = (dir, skip = []) =>
  readdirSync(join(ASSETS, dir)).filter((f) => f.endsWith(".png") && !skip.some((s) => f.startsWith(s)));

const stage = mkdtempSync(join(tmpdir(), "grimfold-web-"));
const staged = new Set();

function put(rel, make) {
  mkdirSync(dirname(join(stage, rel)), { recursive: true });
  make(join(stage, rel));
  staged.add(rel);
}
const copy = (rel) => put(rel, (out) => copyFileSync(join(ASSETS, rel), out));
const ffmpeg = (src, filter, out) => run("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-vf", filter, out]);

for (const f of ["pueblo-muelle", "pueblo-centro", "pueblo-loma"]) copy(`town/${f}.png`);
for (const f of LOCATIONS) copy(`locations/${f}.png`);
const scaled = (rel, width) =>
  put(rel, (out) => ffmpeg(join(ASSETS, rel), `scale='min(iw,${width})':-1:flags=lanczos`, out));

for (const f of pngs("loot")) scaled(`loot/${f}`, 192);
for (const f of pngs("gear")) scaled(`gear/${f}`, 192);
// 512 and 192 for the manifest, 180 for iOS, which ignores it.
for (const size of [512, 192, 180]) {
  put(`app/icono-${size}.png`, (out) => ffmpeg(join(ASSETS, "app/icono.png"), `scale=${size}:-1:flags=lanczos`, out));
}
copy("characters/arponera-del-mar.png");
for (const f of pngs("characters/arponera", ["sheet", "ojos-bruma-parche"])) copy(`characters/arponera/${f}`);
copy("objects/bote.png");
for (const f of pngs("people")) scaled(`people/${f}`, 384);
for (const f of pngs("cards")) put(`cards/${f}`, (out) => ffmpeg(join(ASSETS, "cards", f), "scale=600:-1:flags=lanczos", out));
for (const f of pngs("horrors", ["farolero"])) {
  put(`horrors/${f}`, (out) => ffmpeg(join(ASSETS, "horrors", f), KEY_AND_SIZE, out));
}

function rig(id) {
  const dir = join(ASSETS, "horrors", id);
  const cuts = readJson(join(dir, "cortes.json"));
  const laps = existsSync(join(dir, "solapes.json")) ? readJson(join(dir, "solapes.json")).assets : [];
  const [W, H] = cuts.lienzo;
  const layers = cuts.capas;
  // sin_solape alone is a fixed piece (a floor); with `movimiento` it floats free, like a school's fish.
  const still = (i) => i === 0 || Boolean(layers[i].sin_solape && !layers[i].movimiento);
  const joints = (i) => (still(i) ? [] : [...joints(layers[i].parent ?? 0), layers[i].id]);
  const ancestors = (i) => joints(layers[i].parent ?? 0);

  // Overlaps sit at the back, hidden under opaque paper until their piece moves; cropped like the layers.
  const boxes = laps.length ? JSON.parse(run(PYTHON, [BBOX, ...laps.map((l) => join(dir, l.archivo))])) : [];
  const back = laps.flatMap((lap, n) => {
    if (!boxes[n]) return [];
    const [x, y, w, h] = boxes[n];
    put(`horrors/${id}/${lap.archivo}`, (out) => ffmpeg(join(dir, lap.archivo), `crop=${w}:${h}:${x}:${y}`, out));
    const owner = lap.seguir ?? layers.findIndex((l) => l.id === lap.pieza);
    const name = basename(lap.archivo, ".png");
    return [{ id: name, x, y, w, h, pivot: null, file: lap.archivo, follows: joints(owner) }];
  });
  const order = cuts.orden_superior_a_inferior?.toReversed() ?? layers.map((_, i) => i);
  // Layers stay at full size: scaling each cut on its own would open hairline seams between them.
  const front = order.map((i) => {
    const layer = layers[i];
    const [x, y, w, h] = layer.bbox;
    const file = `${layer.id}.png`;
    put(`horrors/${id}/${file}`, (out) => ffmpeg(join(dir, layer.archivo), `crop=${w}:${h}:${x}:${y}`, out));
    const piece = { id: layer.id, x, y, w, h, pivot: null, file, follows: ancestors(i) };
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
for (const id of readdirSync(join(ASSETS, "horrors"))) {
  if (existsSync(join(ASSETS, "horrors", id, "cortes.json"))) rigs[id] = rig(id);
}

const keyName = Object.keys(process.env).find((k) => /tinypng/i.test(k));
const auth = keyName && `Basic ${Buffer.from(`api:${process.env[keyName]}`).toString("base64")}`;
if (!auth) console.warn("No TINYPNG key in the environment: new files ship uncompressed.");
const cache = existsSync(CACHE) ? readJson(CACHE) : {};
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

async function tinify(src) {
  const shrink = await fetch("https://api.tinify.com/shrink", {
    method: "POST",
    headers: { Authorization: auth },
    body: readFileSync(src),
  });
  if (!shrink.ok) throw new Error(`TinyPNG ${shrink.status}: ${await shrink.text()}`);
  const result = await fetch(shrink.headers.get("location"), { headers: { Authorization: auth } });
  const bytes = Buffer.from(await result.arrayBuffer());
  if (!result.ok || !bytes.subarray(0, 4).equals(PNG)) throw new Error(`TinyPNG download ${result.status}: ${src}`);
  return { bytes, count: shrink.headers.get("compression-count") };
}

let compressed = 0;
let count = "?";
try {
  for (const rel of staged) {
    const src = join(stage, rel);
    const out = join(WEB, rel);
    const source = createHash("sha256").update(readFileSync(src)).digest("hex");
    const tiny = Boolean(auth) && statSync(src).size > TINY_FROM;
    const done = cache[rel];
    if (existsSync(out) && done?.source === source && (done.tiny || !tiny)) continue;
    mkdirSync(dirname(out), { recursive: true });
    if (tiny) {
      const result = await tinify(src);
      writeFileSync(out, result.bytes);
      count = result.count ?? count;
      compressed++;
    } else copyFileSync(src, out);
    cache[rel] = { source, tiny };
    writeFileSync(CACHE, `${JSON.stringify(cache, null, 1)}\n`);
  }
} finally {
  rmSync(stage, { recursive: true });
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
const stale = walk(WEB).filter((f) => !staged.has(relative(WEB, f)));
for (const f of stale) rmSync(f);
for (const rel of Object.keys(cache)) if (!staged.has(rel)) delete cache[rel];
writeFileSync(CACHE, `${JSON.stringify(cache, null, 1)}\n`);

// Art keeps its file names, so a version in the URL is what makes an installed game fetch a redrawn file.
const versions = Object.fromEntries([...staged].sort().map((rel) => [rel, cache[rel].source.slice(0, 8)]));
writeFileSync(VERSIONS, `${JSON.stringify(versions, null, 1)}\n`);
writeFileSync(RIGS, `${JSON.stringify(rigs, null, 2)}\n`);
run("npx", ["biome", "format", "--write", RIGS, VERSIONS]);
console.log(
  `${staged.size} files → ${WEB} · ${Object.keys(rigs).length} puppets → ${RIGS} · ` +
    `${compressed} compressed now (this month: ${count}) · ${stale.length} stale removed`,
);
