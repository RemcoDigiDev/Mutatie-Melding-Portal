import { create } from "zustand";

import type { LayerId } from "../types/layers";



export type ToolMode =
  | "pan"
  | "select"
  | "draw-point"
  | "draw-polygon";

interface LayerConfig {
  id: LayerId;
  visible: boolean;
  opacity: number;
  selectable: boolean;
}


interface GISStore {
  activeTool: ToolMode;

  selectedFeatureId: string | null;

  setSelectedFeatureId: (id: string | null) => void;

  layers: Record<LayerId, LayerConfig>;

  setActiveTool: (tool: ToolMode) => void;

  toggleLayer: (layerId: LayerId) => void;

  setLayerVisibility: (id: LayerId, visible: boolean) => void;
}



export const useGISStore = create<GISStore>((set) => ({
  activeTool: "pan",

selectedFeatureId: null,

setSelectedFeatureId: (id) =>
  set({
    selectedFeatureId: id,
  }),

  layers: {
  bag: {
    id: "bag",
    visible: true,
    opacity: 1,
    selectable: true,
  },
  bgt: {
    id: "bgt",
    visible: true,
    opacity: 1,
    selectable: true,
  },
  neighborhoods: {
    id: "neighborhoods",
    visible: true,
    opacity: 1,
    selectable: true,
  },
  drawings: {
    id: "drawings",
    visible: true,
    opacity: 1,
    selectable: true,
  },
  mask: {
    id: "mask",
    visible: true,
    opacity: 0.3,
    selectable: false,
  },
},
setLayerVisibility: (id, visible) =>
  set((state) => ({
    layers: {
      ...state.layers,
      [id]: {
        ...state.layers[id],
        visible,
      },
    },
  })),
  
  setActiveTool: (tool) =>
    set({
      activeTool: tool,
    }),

  toggleLayer: (id) =>
  set((state) => ({
    layers: {
      ...state.layers,
      [id]: {
        ...state.layers[id],
        visible: !state.layers[id].visible,
      },
    },
  })),
}));