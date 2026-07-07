const TIME_SET_OPTIONS = [
  { value: 'morning_rush', label: 'Dimineața (06-10)' },
  { value: 'around_noon', label: 'Prânz (10-16)' },
  { value: 'evening_rush', label: 'Seara (16-20)' },
  { value: 'rest_hours', label: 'Orele de odihnă (20-24, 00-06)' },
];

const METHOD_OPTIONS = [
  { value: 'harmonic_avg_speed', label: 'Media armonică' },
  { value: 'median_speed', label: 'Mediana' },
  { value: 'avg_speed', label: 'Media aritmetică' },
];

const YEAR_OPTIONS = [
  { key: 2013, text: "2013 - 3%" },
  { key: 2019, text: "2019 - 8%" },
  { key: 2021, text: "2021 - 11%" },
  { key: 2030, text: "20?? - 15%" },
];

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
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="timeSetTag">
          Selectează momentul zilei
        </label>

        <select
          id="timeSetTag"
          name="timeSetTag"
          defaultValue="around_noon"
        >
          {TIME_SET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="method">
          Metoda de calcul a vitezei medii
        </label>

        <select
          id="method"
          name="method"
          defaultValue="median_speed"
        >
          {METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="startYear">
          An de referință pentru indicele de înlocuire
        </label>

        <select
          id="startYear"
          name="startYear"
          defaultValue="2013"
        >
          {YEAR_OPTIONS.map((year) => (
            <option key={year.key} value={year.key}>
              {year.text}
            </option>
          ))}
        </select>
      </div>

      <button className="submit-btn" type="submit">
        Calculează
      </button>
    </form>
  );
}