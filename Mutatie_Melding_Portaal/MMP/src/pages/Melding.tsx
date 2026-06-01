import { useEffect, useState } from "react";
import MapView from "../components/map/MapView";
import Sidebar from "../components/ui/Sidebar";

import Dark_Basemap from "../assets/Dark_Basemap.png";
import OSM_Basemap from "../assets/OSM_Basemap.png";
import PDOK_Basemap from "../assets/PDOK_Basemap.png";
import Satelite_Basemap from "../assets/Satelite_Basemap.png";
import Light_Basemap from "../assets/Light_Basemap.png";
import Grey_Basemap from "../assets/Grey_Basemap.png";
import type { DrawingMode } from "../types/drawing";
import type { LayerState } from "../types/layers";

export type BAGLayer = {
  pand: boolean;
  verblijfsobject: boolean;
  ligplaats: boolean;
  opacity: number;
};

type BasemapType = "pdok" | "osm" | "aerial" | "dark" | "light" | "grey";

/* ---------------- DRAWING MODE ---------------- */

export default function Melding() {
  /* ---------------- BASEMAP PANEL ---------------- */
  const [basemapOpen, setBasemapOpen] = useState(false);

  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);

  const [gemeenteMask, setGemeenteMask] = useState<any>(null);

  /* ---------------- PLACEHOLDER MAP CLICK ---------------- */
  // Temporary handler so MapView can still receive onMapClick.
  // We can later use this for coordinate display, reverse geocoding, etc.
  const handleMapClick = (lat: number, lng: number) => {
    console.log("Map clicked:", lat, lng);
  };

  /* ---------------- BASEMAP OPTIONS ---------------- */
  const basemaps = [
    { id: "pdok", name: "PDOK", thumbnail: PDOK_Basemap },
    {
      id: "osm",
      name: "OpenStreetMap",
      thumbnail: OSM_Basemap,
    },
    {
      id: "aerial",
      name: "Luchtfoto",
      thumbnail: Satelite_Basemap,
    },
    {
      id: "dark",
      name: "Dark",
      thumbnail: Dark_Basemap,
    },
    {
      id: "light",
      name: "Light",
      thumbnail: Light_Basemap,
    },
    {
      id: "grey",
      name: "Grey",
      thumbnail: Grey_Basemap,
    },
  ];

  /* ---------------- LAYERS ---------------- */
  const [layers, setLayers] = useState<LayerState>({
    bag: {
      visible: false,
      pand: true,
      verblijfsobject: true,
      ligplaats: true,
      opacity: 0.7,
    },

    bgt: {
      visible: false,
      opacity: 0.8,
    },

    gemeenteMask: {
      visible: true,
    },
  });

  /* ---------------- ACTIVE BASEMAP ---------------- */
  const [basemap, setBasemap] = useState<BasemapType>("pdok");

  /* ---------------- PERSIST LAYER SETTINGS ---------------- */
  useEffect(() => {
    localStorage.setItem("bag_pand", String(layers.bag.pand));
    localStorage.setItem(
      "bag_verblijfsobject",
      String(layers.bag.verblijfsobject),
    );
    localStorage.setItem("bag_ligplaats", String(layers.bag.ligplaats));
    localStorage.setItem("bag_opacity", String(layers.bag.opacity));

    localStorage.setItem("bgt_visible", String(layers.bgt.visible));
    localStorage.setItem("bgt_opacity", String(layers.bgt.opacity));

    localStorage.setItem(
      "gemeenteMask_visible",
      String(layers.gemeenteMask.visible),
    );
  }, [layers]);

  useEffect(() => {
    fetch("/data/masks/zuidplasMask.geojson")
      .then((res) => res.json())
      .then((data) => {
        const normalized = normalizeGeoJSON(data);
        setGemeenteMask(normalized);
      })
      .catch((err) => console.error(err));
  }, []);

  function normalizeGeoJSON(data: any) {
    return {
      ...data,
      features: data.features.map((f: any) => {
        const fixCoords = (coords: any): any => {
          if (typeof coords[0] === "number") return coords;
          return coords.map(fixCoords);
        };

        return {
          ...f,
          geometry: {
            ...f.geometry,
            coordinates: fixCoords(f.geometry.coordinates),
          },
        };
      }),
    };
  }
  /* ---------------- PAGE LAYOUT ---------------- */
  return (
    <div className="h-screen w-screen relative">
      {/* ---------------- MAP ---------------- */}
      <MapView
        onMapClick={handleMapClick}
        basemap={basemap}
        layers={layers}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        gemeenteMask={gemeenteMask}
      />

      {/* ---------------- SIDEBAR ---------------- */}
      <div className="absolute top-0 left-0 h-full z-[1000]">
        <Sidebar
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
          setBasemapOpen={setBasemapOpen}
          layers={layers}
          setLayers={setLayers}
        />
      </div>

      {/* ---------------- BASEMAP PANEL ---------------- */}
      {basemapOpen && (
        <div className="absolute left-16 top-20 z-[1200] bg-white shadow-2xl rounded-xl p-4 w-72 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Basemaps</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {basemaps.map((map) => (
              <button
                key={map.id}
                onClick={() => {
                  setBasemap(map.id as BasemapType);
                  setBasemapOpen(false);
                }}
                className={`rounded-xl overflow-hidden border transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  basemap === map.id
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={map.thumbnail}
                  className="w-full h-24 object-cover"
                  alt={map.name}
                />

                <div className="p-2 text-sm font-medium bg-white">
                  {map.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
