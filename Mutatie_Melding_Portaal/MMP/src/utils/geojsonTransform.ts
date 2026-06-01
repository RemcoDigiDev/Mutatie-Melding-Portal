import { rdToWgs84 } from "./projection";

function convertCoords(coords: any): any {
  if (!Array.isArray(coords)) return coords;

  // [x, y] coordinate
  if (
    typeof coords[0] === "number" &&
    typeof coords[1] === "number"
  ) {
    return rdToWgs84(coords);
  }

  // recurse for polygons / multipolygons
  return coords.map(convertCoords);
}

export function convertGeoJSONCoords(geojson: any) {
  return {
    ...geojson,
    features: geojson.features.map((feature: any) => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: convertCoords(feature.geometry.coordinates),
      },
    })),
  };
}

export function ensureFeatureIds(geojson: any) {
  return {
    ...geojson,
    features: geojson.features.map((feature: any, index: number) => ({
      ...feature,
      id:
        feature.id ??
        feature.properties?.id ??
        `feature_${index}`,
    })),
  };
}