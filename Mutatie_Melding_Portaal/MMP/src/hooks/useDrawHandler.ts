import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { DrawingMode } from "../types/drawing";
import type { GISFeature } from "../types/feature";
import { createDefaultFeature } from "../utils/createDefaultFeature";

type Props = {
  drawingMode: DrawingMode;
  onCreate: (feature: GISFeature) => void;
};

export function useDrawHandler({
  drawingMode,
  onCreate,
}: Props) {
  const map = useMap();
  const pointsRef = useRef<L.LatLng[]>([]);

  useEffect(() => {
    if (!drawingMode) return;

    // Reset collected points whenever a new drawing session starts
    pointsRef.current = [];

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { latlng } = e;

      /* ---------------- POINT ---------------- */
      if (drawingMode === "point") {
        const feature = createDefaultFeature(
          {
            type: "Point",
            coordinates: [latlng.lng, latlng.lat],
          },
          "Point"
        );

        onCreate(feature);
        return;
      }

      /* ---------------- LINE ---------------- */
      if (drawingMode === "line") {
        pointsRef.current.push(latlng);

        // For now: create a line after 2 clicks
        if (pointsRef.current.length >= 2) {
          const feature = createDefaultFeature(
            {
              type: "LineString",
              coordinates: pointsRef.current.map((p) => [
                p.lng,
                p.lat,
              ]),
            },
            "LineString"
          );

          onCreate(feature);
          pointsRef.current = [];
        }

        return;
      }

      /* ---------------- POLYGON ---------------- */
      if (drawingMode === "polygon") {
        pointsRef.current.push(latlng);

        // For now: create a polygon after 3 clicks
if (drawingMode === "polygon") {
  pointsRef.current.push(latlng);

  return;
}

        return;
      }
    };

   map.on("dblclick", () => {
  if (drawingMode !== "polygon") return;

  if (pointsRef.current.length < 3) return;

  const ring = pointsRef.current.map((p) => [
    p.lng,
    p.lat,
  ]);

  // close polygon
  ring.push([...ring[0]]);

  const feature = createDefaultFeature(
    {
      type: "Polygon",
      coordinates: [ring],
    },
    "Polygon"
  );

  onCreate(feature);

  pointsRef.current = [];
});

    return () => {
      map.off("click", handleClick);
      pointsRef.current = [];
    };
  }, [map, drawingMode, onCreate]);
}