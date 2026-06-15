import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../constants';

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ă|â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't');
}

export default function StreetSearch({ selected, onAdd, onMapLoading }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [roads, setRoads] = useState([]);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/roads`)
      .then(res => res.json())
      .then(data => setRoads(data))
      .catch(err => console.error('Failed to load roads:', err));
  }, []);

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    const seenTomTomNames = new Set();

    const matches = roads
      .filter(road =>
        road.street_name_overpass &&
        normalize(road.street_name_overpass).includes(normalize(input)) &&
        !selected.some(sel => sel.id_road === road.id_road) &&
        road.street_name_tomtom &&
        !seenTomTomNames.has(road.street_name_tomtom) &&
        seenTomTomNames.add(road.street_name_tomtom)
      )
      .sort((a, b) => a.street_name_overpass.localeCompare(b.street_name_overpass));

    setSuggestions(matches);
  }, [input, roads, selected]);

  useEffect(() => {
    const handleClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSelect = async (road) => {
    onAdd(road);
    setInput('');
    setSuggestions([]);
    onMapLoading(true);
  };

  return (
    <div>
      <input
        id="streetSearch"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Cauta o strada..."
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <div ref={suggestionsRef} style={{border: 'blue solid', position: 'absolute', backgroundColor: 'white'}}>
          {suggestions.map(road => (
            <div
              key={road.id_road}
              onClick={() => handleSelect(road)}
              style={{ cursor: 'pointer', padding: '4px 8px' }}
            >
              {road.street_name_overpass}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}