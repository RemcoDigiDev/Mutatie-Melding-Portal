import { useState } from "react";
import type { DrawingMode } from "../../types/drawing";
import type { LayerState } from "../../types/layers";
import { FiLayers } from "react-icons/fi";
import { FaRegMap, FaSliders } from "react-icons/fa6";
import {
  TbRulerMeasure2,
  TbTools,
  TbLayoutDashboardFilled,
  TbMapPin,
  TbMapPinCheck,
  TbLassoPolygon,
  TbClipboardCheck,
  TbPolygon,
  TbLine,
} from "react-icons/tb";
import { AiFillFolderOpen } from "react-icons/ai";
import { MdModelTraining, MdOutlineAddLocationAlt } from "react-icons/md";
import gemeente_zuidplas from "../../assets/gemeente_zuidplas.png";
import gemeente_zuidplas_favicon from "../../assets/gemeente_zuidplas_favicon.png";
import {
  IoMdArrowDropleftCircle,
  IoMdArrowDroprightCircle,
} from "react-icons/io";
import type { IconType } from "react-icons";
import { useGISStore } from "../../store/useGISStore";

function IconWrapper({
  icon: Icon,
  size = 18,
}: {
  icon: IconType;
  size?: number;
}) {
  const TypedIcon = Icon as any;
  return <TypedIcon size={size} />;
}

// Replace your SidebarProps interface with this strongly typed version.
// This will fix all TypeScript errors related to `(prev) => ...`

interface SidebarProps {
  drawingMode: DrawingMode;
  setDrawingMode: React.Dispatch<React.SetStateAction<DrawingMode>>;
  setBasemapOpen: React.Dispatch<React.SetStateAction<boolean>>;
  layers: LayerState;
  setLayers: React.Dispatch<React.SetStateAction<LayerState>>;
}

export default function Sidebar({
  drawingMode,
  setDrawingMode,
  setBasemapOpen,
  layers,
  setLayers,
}: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const gisLayers = useGISStore((s) => s.layers);
  const toggleLayer = useGISStore((s) => s.toggleLayer);
  const items = [
    {
      name: "Tools",
      icon: TbTools,
      onClick: () =>
        setActiveSection((prev) => (prev === "tools" ? "" : "tools")),
    },

    {
      name: "Layers",
      icon: FiLayers,
      onClick: () => setLayersOpen((prev) => !prev),
    },

    {
      name: "Basemap",
      icon: FaRegMap,
      onClick: () => setBasemapOpen((prev) => !prev),
    },

    {
      name: "Opacity",
      icon: FaSliders,
      onClick: () => {},
    },

    {
      name: "Measure",
      icon: TbRulerMeasure2,
      onClick: () => {},
    },
  ];

  return (
    <div
      className={`h-screen bg-white shadow-lg flex flex-col ${open ? "w-40" : "w-14"}`}
    >
      {/* HEADER */}
      {open && (
        <div className="p-3 border-b">
          <img src={gemeente_zuidplas} className="" />
        </div>
      )}

      {/* TOGGLE */}
      <button
        onClick={() => setOpen(!open)}
        className="items-center py-2 px-4 border-b hover:bg-blue-100 text-blue-600"
      >
        {open ? <IoMdArrowDropleftCircle /> : <IoMdArrowDroprightCircle />}
      </button>

      {/* ================= PROCESS ================= */}
      <button
        onClick={() => setProcessOpen(!processOpen)}
        className={`flex items-center gap-2 px-4 py-2 w-full ${
          processOpen ? "bg-blue-600 text-white" : "hover:bg-blue-100"
        }`}
      >
        <IconWrapper icon={AiFillFolderOpen} />
        {open && "Process"}
      </button>

      {processOpen && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 bg-blue-500 p-2 text-white">
            <IconWrapper icon={TbMapPin} size={16} />
            {open && "Melding"}
          </div>

          <div className="flex items-center gap-2 bg-purple-500 p-2 text-white">
            <IconWrapper icon={TbMapPinCheck} size={16} />
            {open && "QC Melding"}
          </div>

          <div className="flex items-center gap-2 bg-green-500 p-2 text-white">
            <IconWrapper icon={TbLassoPolygon} size={16} />
            {open && "Inwinnen"}
          </div>

          <div className="flex items-center gap-2 bg-red-500 p-2 text-white">
            <IconWrapper icon={TbClipboardCheck} size={16} />
            {open && "QC Inwinnen"}
          </div>

          <div className="flex items-center gap-2 bg-orange-500 p-2 text-white">
            <IconWrapper icon={MdModelTraining} size={16} />
            {open && "Inwerken"}
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      <div className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100">
        <IconWrapper icon={TbLayoutDashboardFilled} />
        {open && "Dashboard"}
      </div>

      {/* TOOLS */}
      <div className="flex-1 flex flex-col">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              onClick={item.onClick}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 cursor-pointer"
            >
              <Icon size={18} />
              {open && item.name}
            </div>
          );
        })}
      </div>

      {/* ================= LAYERS ================= */}
      {layersOpen && (
        <div className="absolute left-14 top-20 bg-white shadow-lg p-3 rounded w-56 z-50">
          <div className="font-bold mb-3">Layers</div>

          {/* ================= BAG GROUP ================= */}
          <div className="space-y-2">
            {/* BAG master toggle */}
            <button
              onClick={() =>
                setLayers((prev) => ({
                  ...prev,
                  bag: {
                    ...prev.bag,
                    visible: !prev.bag.visible,
                  },
                }))
              }
              className={`w-full text-left px-3 py-2 rounded border ${
                layers.bag.visible
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              BAG
            </button>

            {/* BAG Sublayers (only visible when BAG is enabled) */}
            {layers.bag.visible && (
              <div className="ml-4 space-y-2">
                {/* Pand */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.bag.pand}
                    onChange={() =>
                      setLayers((prev) => ({
                        ...prev,
                        bag: {
                          ...prev.bag,
                          pand: !prev.bag.pand,
                        },
                      }))
                    }
                  />
                  Pand
                </label>

                {/* Verblijfsobject */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.bag.verblijfsobject}
                    onChange={() =>
                      setLayers((prev) => ({
                        ...prev,
                        bag: {
                          ...prev.bag,
                          verblijfsobject: !prev.bag.verblijfsobject,
                        },
                      }))
                    }
                  />
                  Verblijfsobject
                </label>

                {/* Ligplaats */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.bag.ligplaats}
                    onChange={() =>
                      setLayers((prev) => ({
                        ...prev,
                        bag: {
                          ...prev.bag,
                          ligplaats: !prev.bag.ligplaats,
                        },
                      }))
                    }
                  />
                  Ligplaats
                </label>

                {/* BAG Opacity */}
                <div className="pt-2">
                  <label className="text-xs text-gray-500 block mb-1">
                    BAG Opacity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layers.bag.opacity}
                    onChange={(e) =>
                      setLayers((prev) => ({
                        ...prev,
                        bag: {
                          ...prev.bag,
                          opacity: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= BGT ================= */}
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layers.bgt.visible}
                onChange={(e) =>
                  setLayers((prev) => ({
                    ...prev,
                    bgt: {
                      ...prev.bgt,
                      visible: e.target.checked,
                    },
                  }))
                }
              />
              BGT
            </label>

            {layers.bgt.visible && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={layers.bgt.opacity}
                onChange={(e) =>
                  setLayers((prev) => ({
                    ...prev,
                    bgt: {
                      ...prev.bgt,
                      opacity: Number(e.target.value),
                    },
                  }))
                }
                className="w-full"
              />
            )}
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={gisLayers.drawings.visible}
                onChange={() => toggleLayer("drawings")}
              />
              Drawings
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={gisLayers.mask.visible}
                onChange={() => toggleLayer("mask")}
              />
              Zuidplas Masker
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={gisLayers.neighborhoods.visible}
                onChange={() => toggleLayer("neighborhoods")}
              />
              Buurten
            </label>
          </div>
        </div>
      )}

      {/* TOOLS PANEL */}
      {activeSection === "tools" && (
        <div className="absolute left-14 top-20 bg-white shadow-lg p-3 rounded w-48">
          <div className="font-bold mb-2">Tools</div>

          <button
            onClick={() => setDrawingMode("point")}
            className={`block w-full text-left p-1 rounded ${
              drawingMode === "point"
                ? "bg-blue-200 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <IconWrapper icon={MdOutlineAddLocationAlt} size={16} />
              Point
            </div>
          </button>

          <button
            onClick={() => setDrawingMode("line")}
            className={`block w-full text-left p-1 rounded ${
              drawingMode === "line"
                ? "bg-blue-200 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <IconWrapper icon={TbLine} size={16} />
              Line
            </div>
          </button>

          <button
            onClick={() => setDrawingMode("polygon")}
            className={`block w-full text-left p-1 rounded ${
              drawingMode === "polygon"
                ? "bg-blue-200 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <IconWrapper icon={TbPolygon} size={16} />
              Polygon
            </div>
          </button>
        </div>
      )}

      {/* FOOTER */}
      {!open && (
        <div className="p-2 border-t flex justify-center">
          <img src={gemeente_zuidplas_favicon} className="h-6" />
        </div>
      )}
    </div>
  );
}
