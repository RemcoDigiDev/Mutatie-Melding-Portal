export type LayerState = {
  bag: {
    visible: boolean;
    pand: boolean;
    verblijfsobject: boolean;
    ligplaats: boolean;
    opacity: number;
  };

  bgt: {
    visible: boolean;
    opacity: number;
  };

  gemeenteMask: {
    visible: boolean;
  };
};

export type LayerId =
  | "bag"
  | "bgt"
  | "neighborhoods"
  | "drawings"
  | "mask";

  export interface LayerConfig {
  id: LayerId;
  visible: boolean;
  opacity: number;
  selectable: boolean;
}