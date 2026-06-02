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

selectedFeatureIds: string[];

setSelectedFeatureIds: (ids: string[]) => void;
addSelectedFeatureId: (id: string) => void;
removeSelectedFeatureId: (id: string) => void;
clearSelection: () => void;

  layers: Record<LayerId, LayerConfig>;

  setActiveTool: (tool: ToolMode) => void;

  toggleLayer: (layerId: LayerId) => void;

  setLayerVisibility: (id: LayerId, visible: boolean) => void;


  
}



export const useGISStore = create<GISStore>((set) => ({
  activeTool: "pan",

selectedFeatureIds: [],

setSelectedFeatureIds: (ids) =>
  set({
    selectedFeatureIds: ids,
    selectedFeatureId: ids[0] ?? null,
  }),

addSelectedFeatureId: (id) =>
  set((state) => {
    const ids = state.selectedFeatureIds.includes(id)
      ? state.selectedFeatureIds
      : [...state.selectedFeatureIds, id];

    return {
      selectedFeatureIds: ids,
      selectedFeatureId: id,
    };
  }),

removeSelectedFeatureId: (id) =>
  set((state) => {
    const ids = state.selectedFeatureIds.filter((x) => x !== id);

    return {
      selectedFeatureIds: ids,
      selectedFeatureId:
        state.selectedFeatureId === id
          ? ids[0] ?? null
          : state.selectedFeatureId,
    };
  }),

clearSelection: () =>
  set({
    selectedFeatureIds: [],
    selectedFeatureId: null,
  }),

selectedFeatureId: null,

setSelectedFeatureId: (id) =>
  set({
    selectedFeatureId: id,
    selectedFeatureIds: id ? [id] : [],
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