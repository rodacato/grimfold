// Horrors with their petrol background keyed out, lossless, so they rise over a scene with clean edges.
// Needs ffmpeg and cwebp on PATH. Usage: node tools/art/web_art.mjs
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const SOURCE = "assets/horrors";
const TARGET = "assets/web/horrors";
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
