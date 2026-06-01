import type { FeatureCollection } from "geojson";
export function ensureFeatureIds(
  featureCollection: FeatureCollection
) {
  featureCollection.features.forEach(
    (feature, index) => {
      if (!feature.id) {
        feature.id = `feature_${index}`;
      }
    }
  );

  return featureCollection;
}