import { bayArt } from "../content/bay/art";
import type { Creature } from "../domain/content";
import { t } from "../i18n/t";
import { Art } from "./Art";
import { useGame } from "./game";
import { Puppet } from "./Puppet";

/** A creature in the water: its puppet once it has one, its still until then. */
export function Horror({ c }: { c: Creature }) {
  const { game } = useGame();
  const name = t(`creature.${c.id}`);
  const className = `creature ${c.shadow}`;
  const id = (game.campaign.scars > 0 && bayArt.learned[c.id]) || c.id;
  const rig = bayArt.puppet(id);
  if (!rig) return <Art src={bayArt.creature(c.id)} alt={name} className={className} />;
  return (
    <div className={className}>
      <Puppet
        name={name}
        dir={`horrors/${id}`}
        size={rig.size}
        pieces={rig.pieces}
        width="100%"
        className="horror"
      />
    </div>
  );
}
