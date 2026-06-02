import type { LayerId } from "./layers";

export type GeometryType = "Point" | "LineString" | "Polygon";

export type Priority = "Low" | "Medium" | "High" | "Critical";

/* ---------------- UI MODEL ---------------- */
export type FeatureUI = {
  title: string;
  description: string;
  status: "Nieuw" | "In uitvoering" | "Afgerond";
  priority: Priority;
  category: string;

  address: string;
  date: string;
  user: string;

  bag: boolean;
  bgt: boolean;
  overbouw: boolean;

  bagCategory?: string;
  bgtCategory?: string;
};

/* ---------------- CORE MODEL ---------------- */
export interface FeatureProperties {
    name?: string;
  wijk?: string;
  gemeente?: string;

  assignedUser?: string | null;
  status?: string;
  melder?: string;
  address?: string;
  date?: string;
  priority?: Priority;
  batch?: string;

ui?: {
  title: string;
  description: string;
  status: "Nieuw" | "In uitvoering" | "Afgerond";
  priority: "Low" | "Medium" | "High" | "Critical";
  category: string;

  address: string;
  date: string;
  user: string;

  postcode?: string;
  buurt?: string;
  wijk?: string;
  gemeente?: string;
};

  // ✅ THESE MUST EXIST HERE (NOT ONLY IN UI STATE)
  bag?: boolean;
  bgt?: boolean;
  overbouw?: boolean;

  bagCategory?: string;
  bgtCategory?: string;

  images?: string[];
  opmerking?: string;
}

/* ---------------- FEATURE ---------------- */
export interface GISFeature {
  type: "Feature";

  id: string;

  layerId: LayerId;

  geometryType: GeometryType;
  geometry: GeoJSON.Geometry;

  properties: FeatureProperties;

  createdAt: string;
  updatedAt: string;
}

