export const API_URL = 'http://localhost:3000';
export const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
export const overpassQuery = (streetName) => `
  [out:json][timeout:25];
  area["name"="București"]->.searchArea;
  way["name"="${streetName}"]["highway"~"primary|secondary|tertiary"](area.searchArea);
  out body;
  >;
  out skel qt;
`;
