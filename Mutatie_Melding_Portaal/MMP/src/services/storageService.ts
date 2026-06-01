import type { GISFeature } from '../types/feature';

const STORAGE_KEY = 'gis_features';

export function loadFeatures(): GISFeature[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as GISFeature[];
  } catch (error) {
    console.error('Failed to load features:', error);
    return [];
  }
}

export function saveFeatures(features: GISFeature[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
}

export function addFeature(feature: GISFeature): GISFeature[] {
  const features = loadFeatures();
  const updated = [...features, feature];
  saveFeatures(updated);
  return updated;
}

export function updateFeature(updatedFeature: GISFeature): GISFeature[] {
  const features = loadFeatures();

  const updated = features.map((feature) =>
    feature.id === updatedFeature.id ? updatedFeature : feature
  );

  saveFeatures(updated);
  return updated;
}

export function deleteFeature(featureId: string): GISFeature[] {
  const features = loadFeatures();

  const updated = features.filter(
    (feature) => feature.id !== featureId
  );

  saveFeatures(updated);
  return updated;
}