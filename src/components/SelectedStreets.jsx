export default function SelectedStreets({ selected, onRemove }) {
  if (selected.length === 0) return null;

  return (
    <div className="selected-streets">
      <div className="selected-streets-header">
        Străzi selectate
      </div>

      <div className="selected-streets-list">
        {selected.map(group => (
          <div
            key={group.street_name_tomtom}
            className="street-chip"
          >
            <span className="street-chip-name">
              {group.street_name_tomtom}
            </span>

            <button
              type="button"
              className="street-chip-remove"
              onClick={() => onRemove(group.street_name_tomtom)}
              aria-label={`Elimină ${group.street_name_tomtom}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}