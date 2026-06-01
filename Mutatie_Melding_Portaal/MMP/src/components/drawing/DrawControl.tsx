import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

import type { GISFeature } from "../../types/feature";

import { createFeature } from "../../features/createFeature";

interface DrawControlProps {
  drawingMode: "point" | "line" | "polygon" | null;
  onCreate: (feature: GISFeature) => void;
}

export default function DrawControl({
  drawingMode,
  onCreate,
}: DrawControlProps): null {
  const map = useMap();

  useEffect(() => {
    if (!map || !drawingMode) return;

    let drawControl: L.Control | undefined;
    let drawnItems: L.FeatureGroup | undefined;

    try {
      // Layer group that temporarily holds the newly drawn geometry
      drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Create the Leaflet Draw control
      drawControl = new L.Control.Draw({
        position: "topright",
        draw: {
          // Type definitions expect either:
          // - false  -> disabled
          // - {}     -> enabled with default options
          marker: drawingMode === "point" ? {} : false,
          polyline: drawingMode === "line" ? {} : false,
          polygon: drawingMode === "polygon" ? {} : false,

          // Disabled drawing tools
          rectangle: false,
          circle: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          edit: false,
          remove: false,
        },
      });

      map.addControl(drawControl);
    } catch (err) {
      console.error("Draw init failed:", err);
      return;
    }

    // Fired when the user finishes drawing
    const handleCreated = (e: any) => {
      try {
        const layer = e.layer;
        drawnItems?.addLayer(layer);

        const geoJson = layer.toGeoJSON();
        const geometry = geoJson.geometry;

        const feature = createFeature(geometry, "drawings");

        onCreate(feature);
      } catch (err) {
        console.error("Draw creation failed:", err);
      }
    };

    // Listen for completed drawings
    map.on(L.Draw.Event.CREATED, handleCreated);

    // Cleanup when drawing mode changes or component unmounts
    return () => {
      try {
        map.off(L.Draw.Event.CREATED, handleCreated);

        if (drawControl) {
          map.removeControl(drawControl);
        }

        if (drawnItems) {
          map.removeLayer(drawnItems);
        }
      } catch (err) {
        console.error("Draw cleanup failed:", err);
      }
    };
  }, [map, drawingMode, onCreate]);

  // This component only adds behavior to the map and renders no UI
  return null;
}
