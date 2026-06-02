import type { GISFeature } from "../types/feature";
import { ensureFeatureIds } from "./ensureFeatureIds";
import { convertGeoJSONCoords } from "./geojsonTransform";

export async function loadNeighborhoodFeatures(): Promise<GISFeature[]> {
  const response = await fetch("/data/neighborhoods.geojson");

  if (!response.ok) {
    throw new Error("Failed to load neighborhoods GeoJSON");
  }

  const rawGeojson = await response.json();

  const converted = convertGeoJSONCoords(rawGeojson);
  const withIds = ensureFeatureIds(converted);

  const now = new Date().toISOString();

  return withIds.features.map((feature: any) => ({
  ...feature,
  type: "Feature",
  id: `neighborhood-${feature.properties?.OBJECTID ?? feature.id}`,
  layerId: "neighborhoods",
  geometryType: feature.geometry.type,
  properties: {
    ...feature.properties,
    name: feature.properties?.bu_naam ?? "Onbekende buurt",
    wijk: feature.properties?.wk_naam ?? "",
    gemeente: feature.properties?.gm_naam ?? "",
    assignedUser: null,
    status: "Niet toegewezen",
  },
  createdAt: now,
  updatedAt: now,
}));
}