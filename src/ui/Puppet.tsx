import { useState } from "react";
import { Art } from "./Art";

export interface Piece {
  id: string;
  /** Where the piece's top-left sits, and its drawn width, in the base image's pixels. */
  x: number;
  y: number;
  w: number;
  /** Fractions of the piece; null for a piece that does not move. */
  pivot: [number, number] | null;
  file?: string;
}

interface Props {
  name: string;
  dir: string;
  size: [number, number];
  pieces: Piece[];
  width: number;
  className?: string;
  children?: React.ReactNode;
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function Puppet({ name, dir, size: [w, h], pieces, width, className = "", children }: Props) {
  const [missing, setMissing] = useState(false);
  if (missing) return <Art src={null} alt={name} className="art" />;
  return (
    <div
      className={`puppet ${className}`}
      style={{ width, aspectRatio: `${w} / ${h}` }}
      role="img"
      aria-label={name}
    >
      {children}
      {pieces.map((p) => (
        <img
          key={p.id}
          className={`piece ${p.id}`}
          src={`${import.meta.env.BASE_URL}${dir}/${p.file ?? p.id}.png`}
          alt=""
          onError={() => setMissing(true)}
          style={{
            left: pct(p.x, w),
            top: pct(p.y, h),
            width: pct(p.w, w),
            transformOrigin: p.pivot ? `${p.pivot[0] * 100}% ${p.pivot[1] * 100}%` : undefined,
          }}
        />
      ))}
    </div>
  );
}
