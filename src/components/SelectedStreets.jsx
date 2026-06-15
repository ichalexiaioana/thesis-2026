export default function SelectedStreets({ selected, onRemove }) {
  if (selected.length === 0) return null;

  return (
    <div style={{border: 'red solid', display: 'flex'}}>
      {selected.map(road => (
        <div key={road.id_road} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span>{road.street_name_overpass}</span>
          <button onClick={() => onRemove(road)}>x</button>
        </div>
      ))}
    </div>
  );
}