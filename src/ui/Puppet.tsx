import { useState } from "react";
import { Art } from "./Art";

export interface Piece {
  id: string;
  /** Where the piece's top-left sits, and its drawn width, in the base image's pixels. */
  x: number;
  y: number;
  w: number;
  /** Needed only on a piece that others follow, to place its pivot on the canvas. */
  h?: number;
  /** Fractions of the piece; null for a piece that does not move. */
  pivot: [number, number] | null;
  /** With its extension; defaults to `<id>.png`. */
  file?: string;
  /** Generic idle motion, for puppets whose pieces have no animation of their own: degrees, seconds. */
  sway?: number;
  beat?: number;
  /** Pieces whose motion this one inherits, outermost first: a tail follows the segments before it. */
  follows?: string[];
}

interface Props {
  name: string;
  dir: string;
  size: [number, number];
  pieces: Piece[];
  width: number | string;
  className?: string;
  children?: React.ReactNode;
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const motion = (p: Piece) =>
  (p.sway ? { "--sway": `${p.sway}deg`, "--beat": `${p.beat}s` } : {}) as React.CSSProperties;

export function Puppet({ name, dir, size: [w, h], pieces, width, className = "", children }: Props) {
  const [missing, setMissing] = useState(false);
  if (missing) return <Art src={null} alt={name} className="art" />;
  const byId = new Map(pieces.map((p) => [p.id, p]));

  // Full-canvas wrappers turning around an ancestor's pivot keep every piece a sibling, so stacking holds.
  const joint = (id: string, inner: React.ReactNode, key?: string) => {
    const a = byId.get(id) as Piece;
    const [fx, fy] = a.pivot ?? [0.5, 0.5];
    const origin = `${pct(a.x + fx * a.w, w)} ${pct(a.y + fy * (a.h ?? 0), h)}`;
    return (
      <div key={key} className="joint" style={{ ...motion(a), transformOrigin: origin }}>
        {inner}
      </div>
    );
  };

  return (
    <div
      className={`puppet ${className}`}
      style={{ width, aspectRatio: `${w} / ${h}` }}
      role="img"
      aria-label={name}
    >
      {children}
      {pieces.map((p) => {
        const img = (
          <img
            key={p.id}
            className={`piece ${p.id}`}
            src={`${import.meta.env.BASE_URL}${dir}/${p.file ?? `${p.id}.png`}`}
            alt=""
            onError={() => setMissing(true)}
            style={{
              left: pct(p.x, w),
              top: pct(p.y, h),
              width: pct(p.w, w),
              transformOrigin: p.pivot ? `${p.pivot[0] * 100}% ${p.pivot[1] * 100}%` : undefined,
              ...motion(p),
            }}
          />
        );
        const [outer, ...rest] = p.follows ?? [];
        if (!outer) return img;
        const inner = rest.reduceRight<React.ReactNode>((child, id) => joint(id, child), img);
        return joint(outer, inner, p.id);
      })}
    </div>
  );
}
