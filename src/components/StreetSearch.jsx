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
    fetch(`${API_URL}/roads`)
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
        road.street_name_tomtom &&
        normalize(road.street_name_tomtom).includes(normalize(input)) &&
        !selected.some(sel => sel.street_name_tomtom === road.street_name_tomtom) &&
        !seenTomTomNames.has(road.street_name_tomtom) &&
        seenTomTomNames.add(road.street_name_tomtom)
      )
      .sort((a, b) => a.street_name_tomtom.localeCompare(b.street_name_tomtom));

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
    const allMatching = roads.filter(r => r.street_name_tomtom === road.street_name_tomtom);
    onAdd(road.street_name_tomtom, allMatching);
    setInput('');
    setSuggestions([]);
    onMapLoading(true);
  };

  return (
    <div className="street-search">
      <label htmlFor="streetSearch" className="street-search-label">
        Caută o stradă
      </label>

      <div className="street-search-wrapper">
        <input
          id="streetSearch"
          className="street-search-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ex: Calea Victoriei"
          autoComplete="off"
        />

        {suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="street-search-suggestions"
          >
            {suggestions.map(road => (
              <button
                key={road.street_name_tomtom}
                type="button"
                className="street-search-item"
                onClick={() => handleSelect(road)}
              >
                {road.street_name_tomtom}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}