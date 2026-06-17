import { useState } from 'react';
import Map from './Map';
import StreetSearch from './components/StreetSearch';
import SelectedStreets from './components/SelectedStreets';
import ConfigForm from './components/ConfigForm';
import { API_URL } from './constants';

export default function App() {
  const [selected, setSelected] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);  

  const handleAdd = (road) => {
    if (!selected.some(s => s.id_road === road.id_road)) {
      setSelected(prev => [...prev, road]);
    }
  };
  const handleRemove = (road) => {
    setSelected(prev => prev.filter(s => s.id_road !== road.id_road));
  };

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetList: selected.map(s => s.id_road),
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
        <h1>Configuratia strazilor</h1>
        <ConfigForm onSubmit={handleSubmit} />
        <StreetSearch selected={selected} onAdd={handleAdd} onMapLoading={setMapLoading} />
        <SelectedStreets selected={selected} onRemove={handleRemove} />
        {loading && <p>Se calculeaza...</p>}
        {result !== null && (
          <p>Nivelul congestiei este de {(result * 100).toFixed(2)}%</p>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <Map selected={selected} onLoadingChange={setMapLoading} />
      </div>
    </div>
  );
}