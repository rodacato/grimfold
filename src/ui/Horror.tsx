import { bayArt } from "../content/bay/art";
import type { Creature } from "../domain/content";
import { t } from "../i18n/t";
import { Art } from "./Art";
import { Puppet } from "./Puppet";

/** A creature in the water: its puppet once it has one, its still until then. */
export function Horror({ c, shadow = false }: { c: Creature; shadow?: boolean }) {
  const name = shadow ? t(`shadow.${c.shadow}`) : t(`creature.${c.id}`);
  const className = `creature ${c.shadow} ${shadow ? "shadow" : ""}`;
  const rig = bayArt.puppet(c.id);
  if (!rig) return <Art src={bayArt.creature(c.id)} alt={name} className={className} />;
  return (
    <div className={className}>
      <Puppet
        name={name}
        dir={`horrors/${c.id}`}
        size={rig.size}
        pieces={rig.pieces}
        width="100%"
        className="horror"
      />
    </div>
  );
}
