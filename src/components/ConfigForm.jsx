const TIME_SET_OPTIONS = [
  { value: 'morning_rush', label: 'Dimineata (06-10)' },
  { value: 'around_noon', label: 'Pranz (10-16)' },
  { value: 'evening_rush', label: 'Seara (16-20)' },
  { value: 'rest_hours', label: 'Orele de odihna (20-24, 00-06)' },
];

const METHOD_OPTIONS = [
  { value: 'harmonic_avg_speed', label: 'Media armonica' },
  { value: 'median_speed', label: 'Mediana' },
  { value: 'avg_speed', label: 'Media aritmetica' },
];

const YEAR_OPTIONS = Array.from({ length: 2023 - 2013 + 1 }, (_, i) => 2013 + i);

export default function ConfigForm({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit({
      timeSetTag: formData.get('timeSetTag'),
      method: formData.get('method'),
      startYear: formData.get('startYear'),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column'}}>
      <label>
        Selecteaza momentul zilei:
        <select name="timeSetTag" defaultValue="around_noon">
          {TIME_SET_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

      <label>
        Metoda de calculat viteza medie:
        <select name="method" defaultValue="median_speed">
          {METHOD_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

      <label>
        An de referinta pentru indicele de inlocuire:
        <select name="startYear" defaultValue="2013">
          {YEAR_OPTIONS.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </label>

      <button type="submit">Calculeaza</button>
    </form>
  );
}