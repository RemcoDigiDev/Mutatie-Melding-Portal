import type { Priority } from "../types/feature";

export function uiToGISPriority(value: string): Priority {
  switch (value) {
    case "Laag":
      return "Low";
    case "Normaal":
      return "Medium";
    case "Hoog":
      return "High";
    case "Kritisch":
      return "Critical";
    default:
      return "Medium";
  }
}

export function gisToUIPriority(value: Priority): string {
  switch (value) {
    case "Low":
      return "Laag";
    case "Medium":
      return "Normaal";
    case "High":
      return "Hoog";
    case "Critical":
      return "Kritisch";
  }
}

export async function getAddressFromCoords(lat: number, lng: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );

  const data = await res.json();

  return {
    street: data.address?.road ?? "",
    postalCode: data.address?.postcode ?? "",
    city: data.address?.city ?? data.address?.town ?? data.address?.village ?? "",
  };
}