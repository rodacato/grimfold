import { type ReactNode, useState } from "react";
import { bayArt } from "../content/bay/art";

/** A Botín's picture beside its name; one without art yet shows only the name. */
export function LootIcon({
  id,
  big = false,
  fallback = null,
}: {
  id: string;
  big?: boolean;
  fallback?: ReactNode;
}) {
  const [missing, setMissing] = useState(false);
  if (missing) return fallback;
  return (
    <img
      className={`loot-icon ${big ? "big" : ""}`}
      src={`${import.meta.env.BASE_URL}${bayArt.loot(id)}`}
      alt=""
      onError={() => setMissing(true)}
    />
  );
}

interface Props {
  src: string | null;
  alt: string;
  className?: string;
}

/** Codex art when the file exists; otherwise a paper silhouette, so art never blocks a screen. */
export function Art({ src, alt, className = "art" }: Props) {
  const [missing, setMissing] = useState(false);
  if (!src || missing) {
    return (
      <div className={`${className} silhouette`} role="img" aria-label={alt}>
        {alt}
      </div>
    );
  }
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}${src}`}
      alt={alt}
      onError={() => setMissing(true)}
    />
  );
}
