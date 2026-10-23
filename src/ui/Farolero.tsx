import { useState } from "react";
import { t } from "../i18n/t";
import { Art } from "./Art";

const WIDTH = 783;
const HEIGHT = 620;
const SCALE = 1.14;

/** Cut from horrors/farolero/sheet.png; pivots are fractions of each piece. */
const PIECES: { id: string; x: number; y: number; w: number; pivot: [number, number] | null }[] = [
  { id: "senuelo", x: 4, y: 2, w: 271, pivot: [0.93, 0.98] },
  { id: "aleta-dorsal", x: 224, y: 0, w: 331, pivot: [0.15, 0.95] },
  { id: "cola", x: 546, y: 200, w: 209, pivot: [0.06, 0.5] },
  { id: "cuerpo", x: 82, y: 134, w: 500, pivot: null },
  { id: "mandibula", x: 56, y: 386, w: 329, pivot: [0.94, 0.35] },
  { id: "aleta-lateral", x: 308, y: 340, w: 253, pivot: [0.08, 0.14] },
];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function FaroleroPuppet({ width = 300 }: { width?: number }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <Art src={null} alt={t("farolero.name")} className="art" />;
  return (
    <div className="puppet" style={{ width }} role="img" aria-label={t("farolero.name")}>
      <i className="glow" />
      {PIECES.map((p) => (
        <img
          key={p.id}
          className={`piece ${p.id}`}
          src={`${import.meta.env.BASE_URL}horrors/farolero/${p.id}.png`}
          alt=""
          onError={() => setMissing(true)}
          style={{
            left: pct(p.x, WIDTH),
            top: pct(p.y, HEIGHT),
            width: pct(p.w * SCALE, WIDTH),
            transformOrigin: p.pivot ? `${p.pivot[0] * 100}% ${p.pivot[1] * 100}%` : undefined,
          }}
        />
      ))}
    </div>
  );
}
