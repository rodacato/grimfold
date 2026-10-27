import { type ReactNode, useState } from "react";
import { bayArt } from "../content/bay/art";
import versions from "./art-versions.json";

/** The published URL of a file in assets/web, versioned so a redrawn file is never served from an old cache. */
export function artUrl(rel: string): string {
  const version = (versions as Record<string, string>)[rel];
  return `${import.meta.env.BASE_URL}${rel}${version ? `?v=${version}` : ""}`;
}

/** Remembers which source failed, so a new source gets its own chance. */
function useMissing(src: string | null) {
  const [failed, setFailed] = useState<string | null>(null);
  return [src !== null && failed === src, () => setFailed(src)] as const;
}

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
  const src = bayArt.loot(id);
  const [missing, miss] = useMissing(src);
  if (!src || missing) return fallback;
  return (
    <img
      className={`loot-icon ${big ? "big" : ""}`}
      src={artUrl(src)}
      alt=""
      loading="lazy"
      decoding="async"
      onError={miss}
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
  const [missing, miss] = useMissing(src);
  if (!src || missing) {
    return (
      <div className={`${className} silhouette`} role="img" aria-label={alt}>
        {alt}
      </div>
    );
  }
  return (
    <img className={className} src={artUrl(src)} alt={alt} loading="lazy" decoding="async" onError={miss} />
  );
}
