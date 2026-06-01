import type { GISFeature } from "../types/feature";
import { ensureFeatureIds } from "./ensureFeatureIds";

export async function loadNeighborhoodFeatures(): Promise<GISFeature[]> {
  const response = await fetch("/data/neighborhoods.geojson");

  if (!response.ok) {
    throw new Error("Failed to load neighborhoods GeoJSON");
  }

  const geojson = await response.json();
  const withIds = ensureFeatureIds(geojson);

  const now = new Date().toISOString();

  return withIds.features.map((feature: any) => ({
    ...feature,
    type: "Feature",
    layerId: "neighborhoods",
    geometryType: feature.geometry.type,
    properties: feature.properties ?? {},
    createdAt: now,
    updatedAt: now,
  }));
}