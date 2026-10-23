import type { ReactNode } from "react";
import { t } from "../i18n/t";
import { useGame } from "./game";

interface BtnProps {
  kind?: "primary" | "secondary" | "danger";
  sub?: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function Btn({ kind = "secondary", sub, children, ...rest }: BtnProps) {
  return (
    <button type="button" className={`btn ${kind}`} {...rest}>
      {children}
      {sub && <small>{sub}</small>}
    </button>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  const { game } = useGame();
  return (
    <main className="screen">
      {game.notes.length > 0 && (
        <ul className="notes" aria-live="polite">
          {game.notes.map((n, i) => (
            <li key={`${n.key}-${i}`} className={n.bad ? "bad" : ""}>
              {t(n.key, n.params)}
            </li>
          ))}
        </ul>
      )}
      {children}
    </main>
  );
}

const PIPS: Record<number, [number, number][]> = {
  1: [[25, 25]],
  2: [
    [15, 15],
    [35, 35],
  ],
  3: [
    [14, 14],
    [25, 25],
    [36, 36],
  ],
  4: [
    [15, 15],
    [35, 15],
    [15, 35],
    [35, 35],
  ],
  5: [
    [15, 15],
    [35, 15],
    [25, 25],
    [15, 35],
    [35, 35],
  ],
  6: [
    [15, 13],
    [35, 13],
    [15, 25],
    [35, 25],
    [15, 37],
    [35, 37],
  ],
};

export function Die({ n }: { n: number }) {
  return (
    <svg className="die" viewBox="0 0 50 50" role="img" aria-label={String(n)}>
      <path d="M4 6L44 3L47 44L6 47Z" fill="var(--cream)" stroke="var(--ink)" strokeWidth="2.4" />
      {PIPS[n]?.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.2" fill="var(--ink)" />
      ))}
    </svg>
  );
}

/** `rollKey` restarts the drop animation on every new roll, even when the faces repeat. */
export function Roll({
  dice,
  rollKey,
  total,
  children,
}: {
  dice: number[];
  rollKey?: number;
  total?: number;
  children?: ReactNode;
}) {
  return (
    <div className="roll" key={rollKey}>
      {dice.map((d, i) => (
        <Die key={i} n={d} />
      ))}
      <div className="result">
        {total !== undefined && <b>{total}</b>}
        {children}
      </div>
    </div>
  );
}

export function Waves() {
  return (
    <svg className="waves" viewBox="0 0 390 60" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 0H390V30C360 44 330 22 300 34C270 46 240 24 210 36C180 48 150 26 120 38C90 50 60 28 30 40C15 46 6 40 0 38Z"
        fill="var(--mist)"
        opacity=".9"
      />
      <path
        d="M0 0H390V16C350 26 320 10 290 20C250 30 220 12 190 22C150 32 120 14 90 24C60 34 30 18 0 26Z"
        fill="#6f8f78"
      />
    </svg>
  );
}
