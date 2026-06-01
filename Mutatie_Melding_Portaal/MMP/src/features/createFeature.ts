import type { GISFeature } from "../types/feature";
import type { LayerId } from "../types/layers";

export function createFeature(
  geometry: GeoJSON.Geometry,
  layerId: LayerId,
  properties: Record<string, any> = {},
): GISFeature {
  const now = new Date().toISOString();

  return {
    type: "Feature",
    id: crypto.randomUUID(),
    layerId,
    geometry,
    geometryType: geometry.type as GISFeature["geometryType"],
    properties,
    createdAt: now,
    updatedAt: now,
  };
}