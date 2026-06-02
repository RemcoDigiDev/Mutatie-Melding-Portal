import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import FeatureLayer from "../map/FeatureLayer";
import DrawControl from "../drawing/DrawControl";
import FeatureForm from "../../components/forms/FeatureForm";

import type { GISFeature } from "../../types/feature";
import type { DrawingMode } from "../../types/drawing";

import { reverseGeocode } from "../../utils/reverseGeocode";
import { useGISStore } from "../../store/useGISStore";

/* ---------------- MAP CLICK ---------------- */

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handler);

    return () => {
      map.off("click", handler);
    };
  }, [map, onMapClick]);

  return null;
}

/* ---------------- PROPS ---------------- */

type Props = {
  features: GISFeature[];
  addFeature: (f: GISFeature) => void;
  updateFeature: (f: GISFeature) => void;
  deleteFeature: (id: string) => void;

  drawingMode: DrawingMode;
  setDrawingMode: React.Dispatch<React.SetStateAction<DrawingMode>>;

  onMapClick: (lat: number, lng: number) => void;
};

/* ---------------- COMPONENT ---------------- */

export default function MapLogic({
  features,
  addFeature,
  updateFeature,
  deleteFeature,
  drawingMode,
  setDrawingMode,
  onMapClick,
}: Props) {
  const selectedFeatureId = useGISStore((s) => s.selectedFeatureId);
  const setSelectedFeatureId = useGISStore((s) => s.setSelectedFeatureId);

  const [isFormOpen, setIsFormOpen] = useState(false);

  // Important fallback:
  // after addFeature(), React may not immediately update the features prop.
  // This keeps the newly created feature available for FeatureForm.
  const [localSelectedFeature, setLocalSelectedFeature] =
    useState<GISFeature | null>(null);

  /* ---------------- GEOMETRY CENTER ---------------- */

  function getGeometryCenter(feature: GISFeature): [number, number] {
    const geom = feature.geometry;

    if (geom.type === "Point") {
      return geom.coordinates as [number, number];
    }

    if (geom.type === "LineString") {
      const coords = geom.coordinates as [number, number][];
      const mid = Math.floor(coords.length / 2);
      return coords[mid];
    }

    if (geom.type === "Polygon") {
      const coords = geom.coordinates[0] as [number, number][];

      let lngSum = 0;
      let latSum = 0;

      coords.forEach(([lng, lat]) => {
        lngSum += lng;
        latSum += lat;
      });

      return [lngSum / coords.length, latSum / coords.length];
    }

    return [0, 0];
  }

  /* ---------------- CREATE FEATURE ---------------- */

  const handleCreate = async (feature: GISFeature) => {
    let detectedAddress = "Adres niet gevonden";
    let postcode = "";
    let buurt = "";
    let wijk = "";
    let gemeente = "";

    const [lng, lat] = getGeometryCenter(feature);

    let location: Awaited<ReturnType<typeof reverseGeocode>> | null = null;

    try {
      location = await reverseGeocode(lat, lng);
    } catch (error) {
      console.error("Reverse geocode failed:", error);
    }

    detectedAddress = location?.address ?? "Adres niet gevonden";
    postcode = location?.postcode ?? "";
    buurt = location?.buurt ?? "";
    wijk = location?.wijk ?? "";
    gemeente = location?.gemeente ?? "";

    const today = new Date().toLocaleDateString("nl-NL");

    const updatedFeature: GISFeature = {
      ...feature,
      properties: {
        ...feature.properties,

        address: detectedAddress,
        date: today,

        ui: {
          title: "",
          description: "",
          status: "Nieuw",
          priority: "Medium",
          category: "Melding",

          address: detectedAddress,
          date: today,
          user: "Digireg1",

          postcode,
          buurt,
          wijk,
          gemeente,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    addFeature(updatedFeature);
    setSelectedFeatureId(updatedFeature.id);
    setLocalSelectedFeature(updatedFeature);
    setIsFormOpen(true);
    setDrawingMode(null);
  };

  /* ---------------- SELECTED FEATURE ---------------- */

  const selectedFeature =
    features.find((f) => f.id === selectedFeatureId) ?? localSelectedFeature;

  /* ---------------- RENDER ---------------- */

  return (
    <>
      <FeatureLayer
        features={features}
        onFeatureClick={(feature) => {
          if (feature.layerId === "neighborhoods") {
            console.log("Neighborhood clicked:", feature.properties.name);
            setIsFormOpen(false);
            return;
          }

          setSelectedFeatureId(feature.id);
          setLocalSelectedFeature(feature);
          setIsFormOpen(true);
        }}
      />

      {drawingMode && (
        <DrawControl drawingMode={drawingMode} onCreate={handleCreate} />
      )}

      <FeatureForm
        feature={selectedFeature}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={(updated) => {
          updateFeature(updated);
          setSelectedFeatureId(updated.id);
          setLocalSelectedFeature(updated);
        }}
        onDelete={(id) => {
          deleteFeature(id);
          setSelectedFeatureId(null);
          setLocalSelectedFeature(null);
          setIsFormOpen(false);
        }}
      />

      <MapClickHandler onMapClick={onMapClick} />
    </>
  );
}
