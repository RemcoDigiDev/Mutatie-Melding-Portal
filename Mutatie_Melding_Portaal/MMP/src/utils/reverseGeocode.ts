export type ReverseGeocodeResult = {
  address: string;
  postcode: string;
  buurt: string;
  wijk: string;
  gemeente: string;
};

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const url =
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse` +
      `?lat=${lat}&lon=${lng}&rows=1`;

    const response = await fetch(url);
    const data = await response.json();

    const doc = data.response?.docs?.[0];

    if (!doc) {
      return {
        address: "Adres niet gevonden",
        postcode: "",
        buurt: "",
        wijk: "",
        gemeente: "",
      };
    }

    return {
      address: doc.weergavenaam || "Adres niet gevonden",
      postcode: doc.postcode || "",
      buurt: doc.buurtnaam || "",
      wijk: doc.wijknaam || "",
      gemeente: doc.gemeentenaam || "",
    };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);

    return {
      address: "Adres kon niet worden opgehaald",
      postcode: "",
      buurt: "",
      wijk: "",
      gemeente: "",
    };
  }
}