import type { GISFeature } from '../types/feature';

export function createDefaultFeature(
  geometry: GeoJSON.Geometry,
  geometryType: 'Point' | 'LineString' | 'Polygon'
): GISFeature {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    geometry,
    geometryType,

    properties: {
      melder: 'Digireg1',
      address: '',
      date: new Date().toLocaleDateString('nl-NL'),
      priority: 'Medium',
      batch: '',

      bag: false,
      bgt: false,
      overbouw: false,

      bagCategory: '',
      bgtCategory: '',

      images: [],
      opmerking: '',
    },

    createdAt: now,
    updatedAt: now,
  };
}