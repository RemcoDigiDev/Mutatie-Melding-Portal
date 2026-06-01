import proj4 from "proj4";

// RD New (EPSG:28992)
proj4.defs(
  "EPSG:28992",
  "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 " +
    "+k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel " +
    "+towgs84=565.2369,50.0087,465.658,-0.406857,0.350732,-1.870347,4.0812 +units=m +no_defs"
);

export function rdToWgs84([x, y]: number[]) {
  return proj4("EPSG:28992", "EPSG:4326", [x, y]);
}