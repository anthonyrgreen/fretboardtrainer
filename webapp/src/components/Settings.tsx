import "./Settings.css";

export interface SettingsValues {
  bpm: number;
  beatsPerMeasure: number;
  measuresPerChord: number;
}

interface SettingsProps {
  values: SettingsValues;
  onChange: (values: SettingsValues) => void;
  disableStructure: boolean; // beats/measure, measures/chord
}

export function Settings({ values, onChange, disableStructure }: SettingsProps) {
  const update = (key: keyof SettingsValues, value: number) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="settings">
      <div className="setting-row">
        <label htmlFor="bpm">BPM</label>
        <input
          id="bpm"
          type="range"
          min={10}
          max={200}
          value={values.bpm}
          onChange={(e) => update("bpm", Number(e.target.value))}
          disabled={false}
        />
        <span className="setting-value">{values.bpm}</span>
      </div>

      <div className="setting-row">
        <label htmlFor="beats">Beats / Measure</label>
        <input
          id="beats"
          type="range"
          min={2}
          max={8}
          value={values.beatsPerMeasure}
          onChange={(e) => update("beatsPerMeasure", Number(e.target.value))}
          disabled={disableStructure}
        />
        <span className="setting-value">{values.beatsPerMeasure}</span>
      </div>

      <div className="setting-row">
        <label htmlFor="measures">Measures / Chord</label>
        <input
          id="measures"
          type="range"
          min={1}
          max={16}
          value={values.measuresPerChord}
          onChange={(e) => update("measuresPerChord", Number(e.target.value))}
          disabled={disableStructure}
        />
        <span className="setting-value">{values.measuresPerChord}</span>
      </div>

    </div>
  );
}
