// Web copies of the horrors: petrol keyed out, 640px, WebP with alpha.
// Needs ffmpeg and cwebp on PATH. Usage: node tools/art/web_horrors.mjs
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const SOURCE = "assets/horrors";
const TARGET = "assets/web/horrors";
const PETROL = "0x123f45";
const SIMILARITY = "0.08";

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
  if (result.status !== 0) throw new Error(`${cmd} failed: ${result.stderr}`);
}

mkdirSync(TARGET, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), "grimfold-art-"));
const files = readdirSync(SOURCE).filter((f) => f.endsWith(".png"));
for (const file of files) {
  const id = basename(file, ".png");
  const keyed = join(scratch, `${id}.png`);
  run("ffmpeg", [
    "-loglevel", "error", "-y", "-i", join(SOURCE, file),
    "-vf", `colorkey=${PETROL}:${SIMILARITY}:0.06,scale=640:-1`,
    keyed,
  ]);
  run("cwebp", ["-quiet", "-q", "82", "-alpha_q", "90", keyed, "-o", join(TARGET, `${id}.webp`)]);
}
rmSync(scratch, { recursive: true });
console.log(`${files.length} horrors → ${TARGET}`);
