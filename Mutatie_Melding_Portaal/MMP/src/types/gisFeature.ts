export type FeatureID = string;

export interface GISFeature<
  P = Record<string, any>
> {
  id: FeatureID;

  type: "Feature";

  properties: P;

  geometry: any;
}