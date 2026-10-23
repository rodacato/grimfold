import { useState } from "react";

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
