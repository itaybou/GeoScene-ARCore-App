import { fetchJson } from './../api';

const API_ADDRESS = 'https://nominatim.openstreetmap.org/search.php';

export interface LocationSearchResult {
  index: number;
  lat: number;
  lon: number;
  icon: string;
  display_name: string;
}

export const searchPlacesByName = async (
  searchTerm: string,
): Promise<LocationSearchResult[]> => {
  try {
    const json = await fetchJson(
      API_ADDRESS +
        `?format=json&addressdetails=1&limit=5&q=${searchTerm}&accept-language=en-US`, // change between heb, en
    );

    return json.map((place, index) => ({
      index,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      icon: place.icon,
      display_name: place.display_name,
    }));
  } catch (ex) {
    return [];
  }
};
