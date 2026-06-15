import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_URL, OVERPASS_URL, overpassQuery } from './constants';

function RoadLayers({ selected }) {
  const map = useMap();
  const layersRef = useRef({});

  useEffect(() => {
    const currentIds = new Set(selected.map(r => r.id_road));

    Object.entries(layersRef.current).forEach(([id, layer]) => {
      if (!currentIds.has(id)) {
        map.removeLayer(layer);
        delete layersRef.current[id];
      }
    });

    selected.forEach(async (road) => {
      if (layersRef.current[road.id_road]) return;

      try {
        const resOverpass = await fetch(OVERPASS_URL, {
          method: 'POST',
          body: overpassQuery(road.street_name_overpass),
        });
        const data = await resOverpass.json();

        const resServer = await fetch(`${API_URL}/api/map`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const { coords } = await resServer.json();
        const geometries = coords.features.map(f => f.geometry);
        const layer = L.geoJSON(geometries, { color: 'red' }).addTo(map);
        layersRef.current[road.id_road] = layer;
      } catch (err) {
        console.error('Error fetching road geometry:', err.message);
      }
    });
  }, [selected, map]);

  return null;
}

export default function Map({ selected = [] }) {
  return (
    <MapContainer
      center={[44.4268, 26.1025]}
      zoom={12}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <RoadLayers selected={selected} />
    </MapContainer>
  );
}