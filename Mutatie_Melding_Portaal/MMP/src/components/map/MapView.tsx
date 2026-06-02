import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import { GeoJSON } from "react-leaflet";

import { useFeatureStorage } from "../../hooks/useFeatureStorage";
import type { DrawingMode } from "../../types/drawing";
import type { LayerState } from "../../types/layers";

import MapLogic from "./MapLogic";
import { useGISStore } from "../../store/useGISStore";

import { useEffect, useState } from "react";
import { loadNeighborhoodFeatures } from "../../utils/loadNeighborhoodFeatures";
import type { GISFeature } from "../../types/feature";
import { Pane } from "react-leaflet";

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
      pane="maskPane"
      style={() => ({
        color: "white",
        weight: 2,
        fillColor: "white",
        fillOpacity: 1,
      })}
    />
  );
}

/* ---------------- SCALE BAR ---------------- */

function CustomScaleBar() {
  const map = useMap();
  const [scaleKm, setScaleKm] = useState(1);

  useEffect(() => {
    const update = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      const metersPerPixel =
        (156543.03392 * Math.cos((center.lat * Math.PI) / 180)) /
        Math.pow(2, zoom);

      const targetPixels = 160;
      const rawMeters = metersPerPixel * targetPixels;

      const niceMeters =
        rawMeters > 5000
          ? 10000
          : rawMeters > 2000
            ? 5000
            : rawMeters > 1000
              ? 2000
              : rawMeters > 500
                ? 1000
                : rawMeters > 200
                  ? 500
                  : rawMeters > 100
                    ? 200
                    : 100;

      setScaleKm(niceMeters / 1000);
    };

    update();
    map.on("zoomend moveend", update);

    return () => {
      map.off("zoomend moveend", update);
    };
  }, [map]);

  const segments = 5;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/80 px-3 py-2 rounded shadow text-[10px] text-black">
      <div className="flex justify-between mb-1">
        <span>Km</span>
        {Array.from({ length: segments + 1 }).map((_, i) => (
          <span key={i}>{Math.round((scaleKm / segments) * i)}</span>
        ))}
      </div>

      <div className="flex border border-black h-3 w-64">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${i % 2 === 0 ? "bg-black" : "bg-white"}`}
          />
        ))}
      </div>

      <div className="flex justify-between mt-1">
        <span>0</span>
        {Array.from({ length: segments + 1 }).map((_, i) => (
          <span key={i}>{Math.round((scaleKm / segments) * i)}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- FEATURE STYLE ---------------- */

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

  const [neighborhoodFeatures, setNeighborhoodFeatures] = useState<
    GISFeature[]
  >([]);

  useEffect(() => {
    async function loadNeighborhoods() {
      try {
        const loaded = await loadNeighborhoodFeatures();
        setNeighborhoodFeatures(loaded);
      } catch (error) {
        console.error("Failed to load neighborhoods:", error);
      }
    }

    loadNeighborhoods();
  }, []);

  const gisLayers = useGISStore((s) => s.layers);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[52.0, 4.6] as LatLngExpression}
        zoom={12}
        zoomControl={false}
        className="h-full w-full relative"
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

        <Pane name="maskPane" style={{ zIndex: 400 }}>
          <GemeenteMaskLayer geojson={gemeenteMask} />
        </Pane>

        <Pane name="featurePane" style={{ zIndex: 500 }}>
          <MapLogic
            features={[...features, ...neighborhoodFeatures]}
            addFeature={addFeature}
            updateFeature={updateFeature}
            deleteFeature={deleteFeature}
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            onMapClick={onMapClick}
          />
        </Pane>
        {/* GEMEENTE MASK */}
        {gisLayers.mask.visible && <GemeenteMaskLayer geojson={gemeenteMask} />}
        <CustomScaleBar />
      </MapContainer>
    </div>
  );
}
