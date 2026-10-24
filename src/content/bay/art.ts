import type { EventId, IslandId, WaterType, WreckId } from "../../domain/content";

/** Paths inside assets/; a missing file falls back to a paper silhouette. */
export const bayArt = {
  creature: (id: string) => `web/horrors/${id}.webp`,
  person: (id: string) => `redo/${id}.png`,
  town: ["town/pueblo-muelle.png", "town/pueblo-centro.png", "town/pueblo-loma.png"],
  title: "locations/pueblo-faro.png",
  water: {
    rio: "locations/rio-estero.png",
    lago: "locations/lago-campanario.png",
    mar: "locations/mar-abierto.png",
    profundo: "locations/mar-profundo.png",
  } satisfies Record<WaterType, string>,
  wreck: {
    cofre: "locations/naufragio-cementerio.png",
    bodega: "locations/naufragio-ruelas.png",
  } satisfies Record<WreckId, string>,
  island: {
    fogata: "locations/isla-fogata.png",
    observatorio: "locations/isla-observatorio.png",
  } satisfies Record<IslandId, string>,
  event: {
    boya: "locations/evento-boya.png",
    nombre: null,
    sal: "locations/evento-sal.png",
    sirena: null,
  } satisfies Record<EventId, string | null>,
  lighthouse: "locations/faro-exterior.png",
  lamp: "locations/faro-lampara.png",
  farolero: "horrors/farolero.png",
  boat: "objects/bote.png",
  arponeraFromSea: "characters/arponera-del-mar.png",
  cardBack: (shadow: string) => `redo/dorso-${shadow}.png`,
};
