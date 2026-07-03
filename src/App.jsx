import { useState } from 'react';
import Map from './Map';
import StreetSearch from './components/StreetSearch';
import SelectedStreets from './components/SelectedStreets';
import ConfigForm from './components/ConfigForm';
import { API_URL } from './constants';

export default function App() {
  const [selected, setSelected] = useState([]); // [{ street_name_tomtom, roads: [...] }]
  const [mapLoading, setMapLoading] = useState(false);

  const handleAdd = (streetNameTomtom, allMatchingRoads) => {
    if (!selected.some(s => s.street_name_tomtom === streetNameTomtom)) {
      setSelected(prev => [...prev, { street_name_tomtom: streetNameTomtom, roads: allMatchingRoads }]);
    }
  };

  const handleRemove = (streetNameTomtom) => {
    setSelected(prev => prev.filter(s => s.street_name_tomtom !== streetNameTomtom));
  };

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setResult(null);
    try {
      const streetList = selected.flatMap(group => group.roads.map(r => r.id_road));

      const res = await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetList,
          ...formData,
        }),
      });
      const data = await res.json();
      setResult(data.congestie);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '30%', overflowY: 'auto', padding: '1rem' }}>
        {mapLoading && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}
        <h1>Configurația străzilor</h1>
        <ConfigForm onSubmit={handleSubmit} />
        <StreetSearch selected={selected} onAdd={handleAdd} onMapLoading={setMapLoading} />
        <SelectedStreets selected={selected} onRemove={handleRemove} />
        {loading && <p>Se calculeaza...</p>}
        {result !== null && (
          <p style={{fontSize: '24px'}}>Nivelul congestiei este de <b>{(result * 100).toFixed(2)}%</b></p>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <Map selected={selected} onLoadingChange={setMapLoading} />
      </div>
    </div>
  );
}