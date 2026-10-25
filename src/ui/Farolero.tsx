import { t } from "../i18n/t";
import { type Piece, Puppet } from "./Puppet";

const SCALE = 1.14;

/** Cut from assets/raw/horrors/farolero/sheet.png. */
const PIECES: Piece[] = [
  { id: "senuelo", x: 4, y: 2, w: 271 * SCALE, pivot: [0.93, 0.98] },
  { id: "aleta-dorsal", x: 224, y: 0, w: 331 * SCALE, pivot: [0.15, 0.95] },
  { id: "cola", x: 546, y: 200, w: 209 * SCALE, pivot: [0.06, 0.5] },
  { id: "cuerpo", x: 82, y: 134, w: 500 * SCALE, pivot: null },
  { id: "mandibula", x: 56, y: 386, w: 329 * SCALE, pivot: [0.94, 0.35] },
  { id: "aleta-lateral", x: 308, y: 340, w: 253 * SCALE, pivot: [0.08, 0.14] },
];

export function FaroleroPuppet({ width = 300 }: { width?: number }) {
  return (
    <Puppet
      name={t("farolero.name")}
      dir="horrors/farolero"
      size={[783, 620]}
      pieces={PIECES}
      width={width}
      className="farolero"
    >
      <i className="glow" />
    </Puppet>
  );
}
