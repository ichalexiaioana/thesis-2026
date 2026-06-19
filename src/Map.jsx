import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_URL, OVERPASS_URL, overpassQuery } from './constants';

function RoadLayers({ selected, onLoadingChange }) {
  const map = useMap();
  const layersRef = useRef({});

  useEffect(() => {
    const currentIds = new Set(selected.map(group => group.street_name_tomtom));

    Object.entries(layersRef.current).forEach(([id, layerGroup]) => {
      if (!currentIds.has(id)) {
        layerGroup.forEach(layer => map.removeLayer(layer));
        delete layersRef.current[id];
      }
    });

    selected.forEach(async (group) => {
      if (layersRef.current[group.street_name_tomtom]) return;
      onLoadingChange(true);

      const newLayers = [];

      try {
        for (const road of group.roads) {
          if (!road.street_name_overpass) continue;

          try {
            const res = await fetch(`${API_URL}/road-geometry/${encodeURIComponent(road.id_road)}`);
            if (!res.ok) {
              console.warn(`No cached geometry for ${road.street_name_overpass}`);
              continue;
            }
            const { coords } = await res.json();
            const geometries = coords.features.map(f => f.geometry);
            const layer = L.geoJSON(geometries, { color: 'red' }).addTo(map);
            newLayers.push(layer);
          } catch (err) {
            console.error(`Failed to load geometry for ${road.street_name_overpass}:`, err.message);
          }
        }

        layersRef.current[group.street_name_tomtom] = newLayers;
      } catch (err) {
        console.error('Error fetching road geometry:', err.message);
      } finally {
        onLoadingChange(false);
      }
    });
  }, [selected, map]);

  return null;
}

export default function Map({ selected, onLoadingChange }) {
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
      <RoadLayers selected={selected} onLoadingChange={onLoadingChange} />
    </MapContainer>
  );
}