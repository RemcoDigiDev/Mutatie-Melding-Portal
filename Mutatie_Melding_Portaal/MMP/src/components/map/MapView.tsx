import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  ZoomControl,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import { GeoJSON } from "react-leaflet";

import { useFeatureStorage } from "../../hooks/useFeatureStorage";
import type { DrawingMode } from "../../types/drawing";
import type { LayerState } from "../../types/layers";

import MapLogic from "./MapLogic";
import { useGISStore } from "../../store/useGISStore";

import { useEffect } from "react";
import { loadNeighborhoodFeatures } from "../../utils/loadNeighborhoodFeatures";

/* ---------------- BASEMAPS ---------------- */

const basemapUrls = {
  pdok: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png",
  osm: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  aerial:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  dark: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  light: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  grey: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png",
};

/* ---------------- PROPS ---------------- */

type MapViewProps = {
  onMapClick: (lat: number, lng: number) => void;
  basemap: keyof typeof basemapUrls;
  drawingMode: DrawingMode;
  setDrawingMode: React.Dispatch<React.SetStateAction<DrawingMode>>;
  layers: LayerState;
  gemeenteMask: any; // 👈 THIS is the only one
};
/* ---------------- COMPONENT ---------------- */

function GemeenteMaskLayer({ geojson }: any) {
  if (!geojson?.features?.length) return null;

  return (
    <GeoJSON
      data={geojson}
      pane="overlayPane"
      style={() => ({
        color: "black",
        weight: 2,
        fillColor: "white",
        fillOpacity: 1,
      })}
    />
  );
}

export default function MapView({
  onMapClick,
  basemap,
  layers,
  drawingMode,
  setDrawingMode,
  gemeenteMask,
}: MapViewProps) {
  const { features, addFeature, updateFeature, deleteFeature } =
    useFeatureStorage();

  useEffect(() => {
    async function loadNeighborhoods() {
      try {
        const neighborhoodFeatures = await loadNeighborhoodFeatures();

        const existingIds = new Set(features.map((feature) => feature.id));

        neighborhoodFeatures.forEach((feature) => {
          if (!existingIds.has(feature.id)) {
            addFeature(feature);
          }
        });
      } catch (error) {
        console.error("Failed to load neighborhoods:", error);
      }
    }

    loadNeighborhoods();
  }, [features, addFeature]);

  const gisLayers = useGISStore((s) => s.layers);

  return (
    <MapContainer
      center={[52.0, 4.6] as LatLngExpression}
      zoom={12}
      zoomControl={false}
      className="h-full w-full"
      maxZoom={20}
      doubleClickZoom={false}
    >
      {/* BASEMAP */}
      <TileLayer
        url={basemapUrls[basemap]}
        attribution="© PDOK / OpenStreetMap"
        maxZoom={20}
      />

      {/* ---------------- BAG LAYERS ---------------- */}

      {/* Pand */}
      {layers.bag.visible && layers.bag.pand && (
        <WMSTileLayer
          url="https://service.pdok.nl/lv/bag/wms/v2_0"
          layers="pand"
          format="image/png"
          transparent={true}
          opacity={layers.bag.opacity}
          maxZoom={20}
          attribution="© PDOK BAG"
        />
      )}

      {/* Verblijfsobject */}
      {layers.bag.visible && layers.bag.verblijfsobject && (
        <WMSTileLayer
          url="https://service.pdok.nl/lv/bag/wms/v2_0"
          layers="verblijfsobject"
          format="image/png"
          transparent={true}
          opacity={layers.bag.opacity}
          maxZoom={20}
          attribution="© PDOK BAG"
        />
      )}

      {/* Ligplaats */}
      {layers.bag.visible && layers.bag.ligplaats && (
        <WMSTileLayer
          url="https://service.pdok.nl/lv/bag/wms/v2_0"
          layers="ligplaats"
          format="image/png"
          transparent={true}
          opacity={layers.bag.opacity}
          maxZoom={22}
          attribution="© PDOK BAG"
        />
      )}

      {/* ---------------- BGT ---------------- */}
      {layers.bgt.visible && (
        <TileLayer
          url="https://service.pdok.nl/lv/bgt/ogc/v1_0/tiles/WebMercatorQuad/{z}/{x}/{y}.png"
          opacity={layers.bgt.opacity}
          attribution="© PDOK BGT"
        />
      )}

      {/* ZOOM CONTROL */}
      <ZoomControl position="topright" />

      {/* GIS LOGIC */}
      <MapLogic
        features={features}
        addFeature={addFeature}
        updateFeature={updateFeature}
        deleteFeature={deleteFeature}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        onMapClick={onMapClick}
      />

      {/* GEMEENTE MASK */}
      {gisLayers.mask.visible && <GemeenteMaskLayer geojson={gemeenteMask} />}
    </MapContainer>
  );
}
