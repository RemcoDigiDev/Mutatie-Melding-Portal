import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import FeatureLayer from "../map/FeatureLayer";
import DrawControl from "../drawing/DrawControl";
import FeatureForm from "../../components/forms/FeatureForm";

import type { GISFeature } from "../../types/feature";
import type { DrawingMode } from "../../types/drawing";
import { useDrawHandler } from "../../hooks/useDrawHandler";

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

  /* ---------------- DRAW HANDLER (IMPORTANT: INSIDE COMPONENT) ---------------- */

  const handleCreate = async (feature: GISFeature) => {
    let detectedAddress = "Adres niet gevonden";
    let postcode = "";
    let buurt = "";
    let wijk = "";
    let gemeente = "";

    const [lng, lat] = getGeometryCenter(feature);

    const location = await reverseGeocode(lat, lng);

    detectedAddress = location.address;
    postcode = location.postcode;
    buurt = location.buurt;
    wijk = location.wijk;
    gemeente = location.gemeente;

    const updatedFeature: GISFeature = {
      ...feature,
      properties: {
        ...feature.properties,
        address: detectedAddress,
        ui: {
          ...(feature.properties.ui ?? {
            title: "",
            description: "",
            status: "Nieuw",
            priority: "Medium",
            category: "Melding",
            user: "Digireg1",
          }),
          address: detectedAddress,
          postcode,
          buurt,
          wijk,
          gemeente,
          date: new Date().toLocaleDateString("nl-NL"),
          user: "Digireg1",
        },
      },
    };

    addFeature(updatedFeature);
    setSelectedFeatureId(updatedFeature.id as string);
    setIsFormOpen(true);
    setDrawingMode(null);
  };

  useDrawHandler({
    drawingMode,
    onCreate: handleCreate,
  });

  function getGeometryCenter(feature: GISFeature): [number, number] {
    const geom = feature.geometry;

    // POINT
    if (geom.type === "Point") {
      return geom.coordinates as [number, number];
    }

    // LINESTRING → midpoint
    if (geom.type === "LineString") {
      const coords = geom.coordinates as [number, number][];
      const mid = Math.floor(coords.length / 2);
      return coords[mid];
    }

    // POLYGON → centroid approximation (simple average)
    if (geom.type === "Polygon") {
      const coords = geom.coordinates[0] as [number, number][];

      let latSum = 0;
      let lngSum = 0;

      coords.forEach(([lng, lat]) => {
        lngSum += lng;
        latSum += lat;
      });

      return [lngSum / coords.length, latSum / coords.length];
    }

    // fallback
    return [0, 0];
  }
  const selectedFeature =
    features.find((f) => f.id === selectedFeatureId) ?? null;

  return (
    <>
      <FeatureLayer
        features={features}
        onFeatureClick={(feature) => {
          setSelectedFeatureId(feature.id as string);

          if (feature.layerId === "drawings") {
            setIsFormOpen(true);
          }

          if (feature.layerId === "neighborhoods") {
            console.log(
              "Clicked neighborhood:",
              (feature.properties as any).name,
            );
            setIsFormOpen(false);
          }
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
          setSelectedFeatureId(updated.id as string);
        }}
        onDelete={(id) => {
          deleteFeature(id);
          setSelectedFeatureId(null);
          setIsFormOpen(false);
        }}
      />

      <MapClickHandler onMapClick={onMapClick} />
    </>
  );
}
