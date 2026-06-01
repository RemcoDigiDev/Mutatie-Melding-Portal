import { useEffect, useState } from "react";
import type { GISFeature } from "../types/feature";
import {
  loadFeatures,
  addFeature as storageAddFeature,
  updateFeature as storageUpdateFeature,
  deleteFeature as storageDeleteFeature,
} from "../services/storageService";

export function useFeatureStorage() {
  const [features, setFeatures] = useState<GISFeature[]>([]);

  /* ---------------- LOAD INIT ---------------- */
  useEffect(() => {
    setFeatures(loadFeatures());
  }, []);

  /* ---------------- ADD ---------------- */
  function addFeature(feature: GISFeature) {
    const updated = storageAddFeature(feature);
    setFeatures(updated);
  }

  /* ---------------- UPDATE ---------------- */
  function updateFeature(feature: GISFeature) {
    const updated = storageUpdateFeature(feature);
    setFeatures(updated);
  }

  /* ---------------- DELETE ---------------- */
  function deleteFeature(featureId: string) {
    const updated = storageDeleteFeature(featureId);
    setFeatures(updated);
  }

  /* ---------------- OPTIONAL: LOCAL PATCH (no storage) ---------------- */
  function patchFeature(feature: GISFeature) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === feature.id ? feature : f))
    );
  }

  /* ---------------- CLEAR ---------------- */
  function clearAllFeatures() {
    localStorage.removeItem("gis_features");
    setFeatures([]);
  }

  return {
    features,
    addFeature,
    updateFeature,
    deleteFeature,
    clearAllFeatures,

    // optional but useful for debugging / future UI edits
    patchFeature,
  };
}