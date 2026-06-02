// src/components/map/FeatureLayer.tsx

import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Feature as GeoJSONFeature, Geometry } from "geojson";
import type { GISFeature } from "../../types/feature";
import { useGISStore } from "../../store/useGISStore";

type Props = {
  features: GISFeature[];
  onFeatureClick?: (feature: GISFeature) => void;
};

/* ---------------- PRIORITY COLOR ---------------- */
function getPriorityColor(priority: GISPriority): string {
  switch (priority) {
    case "Low":
      return "#22c55e";
    case "Medium":
      return "#eab308";
    case "High":
      return "#f97316";
    case "Critical":
      return "#ef4444";
    default:
      return "#3b82f6";
  }
}

/* ---------------- NEIGHBORHOOD STYLING ---------------- */

function getFeatureStyle(feature: GISFeature) {
  if (feature.layerId === "neighborhoods") {
    return {
      color: "#ed3a3a",
      weight: 2,
      fillColor: "#ffffff00",
      fillOpacity: 0.15,
    };
  }

  const priority = normalizePriority(feature);
  const color = getPriorityColor(priority);

  return {
    color,
    weight: 3,
    fillColor: color,
    fillOpacity: 0.3,
  };
}

/* ---------------- PRIORITY NORMALIZER ---------------- */
/*
Supports BOTH:
- new UI format: Laag / Normaal / Hoog / Kritisch
- old GIS format: Low / Medium / High / Critical
*/
type GISPriority = "Low" | "Medium" | "High" | "Critical";
type UIPriority = "Laag" | "Normaal" | "Hoog" | "Kritisch";

type AnyPriority = GISPriority | UIPriority;

function normalizePriority(feature: GISFeature): GISPriority {
  const raw = feature.properties?.ui?.priority as AnyPriority | undefined;

  if (!raw) return "Medium";

  switch (raw) {
    // UI → GIS
    case "Laag":
      return "Low";
    case "Normaal":
      return "Medium";
    case "Hoog":
      return "High";
    case "Kritisch":
      return "Critical";

    // already GIS
    case "Low":
      return "Low";
    case "Medium":
      return "Medium";
    case "High":
      return "High";
    case "Critical":
      return "Critical";
  }

  return "Medium";
}

/* ---------------- GEO VALIDATION ---------------- */
function isValidGeometry(geometry: unknown): geometry is Geometry {
  if (!geometry || typeof geometry !== "object") return false;

  const g = geometry as {
    type?: string;
    coordinates?: unknown;
  };

  if (!g.type) return false;
  if (!Array.isArray(g.coordinates)) return false;

  return true;
}

/* ---------------- CONVERT TO GEOJSON ---------------- */
function toGeoJSONFeature(feature: GISFeature): GeoJSONFeature {
  return {
    type: "Feature",
    geometry: feature.geometry as Geometry,
    properties: feature.properties ?? {},
    id: feature.id,
  };
}

/* ---------------- FILTER VALID FEATURES ---------------- */
function getValidFeatures(features: GISFeature[]): GISFeature[] {
  return features.filter((f) => f?.geometry && isValidGeometry(f.geometry));
}

/* ---------------- COMPONENT ---------------- */
export default function FeatureLayer({ features, onFeatureClick }: Props) {
  const layers = useGISStore((s) => s.layers);
  const validFeatures = getValidFeatures(features).filter((feature) => {
    return layers[feature.layerId]?.visible ?? true;
  });

  return (
    <>
      {validFeatures.map((feature) => {
        return (
          <GeoJSON
            pane="featurePane"
            key={feature.id}
            data={toGeoJSONFeature(feature)}
            /* POINTS */
            pointToLayer={(_geoJson, latlng) => {
              const style = getFeatureStyle(feature);

              return L.circleMarker(latlng, {
                radius: 8,
                weight: style.weight,
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: 0.9,
              });
            }}
            /* LINES + POLYGONS */
            style={() => getFeatureStyle(feature)}
            eventHandlers={{
              click: () => onFeatureClick?.(feature),
            }}
          />
        );
      })}
    </>
  );
}
