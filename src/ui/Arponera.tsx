import { bayArt } from "../content/bay/art";
import type { Mutation } from "../domain/state";
import { t } from "../i18n/t";
import { Art } from "./Art";
import { type Piece, Puppet } from "./Puppet";

/** Cut from characters/arponera/sheet.png and fitted on characters/arponera.png. */
const BODY: Piece = { id: "cuerpo", x: 314, y: 382, w: 500, pivot: null };
const SKIRT: Piece = { id: "faldon", x: 744, y: 962, w: 200, pivot: [0.05, 0.3] };
const HARPOON: Piece = { id: "brazo-arpon", x: 244, y: 84, w: 206, pivot: [0.8, 0.31] };
const HEAD: Piece = { id: "cabeza", x: 338, y: 140, w: 348, pivot: [0.45, 0.95] };
/** Its pivot is the head's, so the patch nods with the cheek it sits on. */
const EYES: Piece = { id: "ojos-bruma", x: 470, y: 290, w: 66, pivot: [0.37, 1.09] };
const TENTACLE: Piece = { id: "brazo-ventosas", x: 676, y: 640, w: 137, pivot: [0.5, 0.02] };

function pieces(mutations: Mutation[]): Piece[] {
  const arm = mutations.includes("brazo");
  return [
    ...(arm ? [TENTACLE, { ...BODY, file: "cuerpo-sin-mano" }] : [BODY]),
    SKIRT,
    HARPOON,
    HEAD,
    ...(mutations.includes("ojos") ? [EYES] : []),
  ];
}

export function ArponeraPuppet({
  mutations,
  fromSea = false,
  width = 140,
}: {
  mutations: Mutation[];
  fromSea?: boolean;
  width?: number;
}) {
  const name = t(fromSea ? "arponera.fromSea" : "arponera.name");
  if (fromSea)
    return (
      <div className="puppet arponera" style={{ width, aspectRatio: "1024 / 1536" }}>
        <Art src={bayArt.arponeraFromSea} alt={name} className="art whole" />
      </div>
    );
  return (
    <Puppet
      name={name}
      dir="characters/arponera"
      size={[1024, 1536]}
      pieces={pieces(mutations)}
      width={width}
      className="arponera"
    />
  );
}
