import { bayArt, type Rig } from "../content/bay/art";
import { faroleroStage } from "../domain/derived";
import { t } from "../i18n/t";
import { useGame } from "./game";
import { Puppet } from "./Puppet";

/** How much of it shows: only the lure, a shadow, a shadow with the lure lit, or all of it. */
export type Look = "lure" | "shadow" | "lured" | "full";

/** At rest below, keeping the tower in the keeper's coat, or chasing you in profile. */
export type Pose = "farolero" | "farolero-guardian" | "farolero-persigue";

/** What you have seen of it so far, and what you call it. */
export function useFarolero(): { stage: number; name: string } {
  const { game } = useGame();
  const stage = faroleroStage(game);
  return { stage, name: t(`farolero.name.${Math.max(stage, 1)}`) };
}

export function FaroleroPuppet({
  pose,
  width = 300,
  look = "full",
}: {
  pose: Pose;
  width?: number;
  look?: Look;
}) {
  const { name } = useFarolero();
  const rig = bayArt.puppet(pose) as Rig;
  return (
    <Puppet
      name={name}
      dir={`horrors/${pose}`}
      size={rig.size}
      pieces={rig.pieces}
      width={width}
      className={`horror farolero ${look}`}
    />
  );
}
