import "./Settings.css";

export interface SettingsValues {
  bpm: number;
  beatsPerMeasure: number;
  measuresPerAttempt: number;
  attemptsPerExercise: number;
  restMeasures: number;
}

interface SettingsProps {
  values: SettingsValues;
  onChange: (values: SettingsValues) => void;
  disabled: boolean;
}

export function Settings({ values, onChange, disabled }: SettingsProps) {
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
          min={40}
          max={200}
          value={values.bpm}
          onChange={(e) => update("bpm", Number(e.target.value))}
          disabled={disabled}
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
          disabled={disabled}
        />
        <span className="setting-value">{values.beatsPerMeasure}</span>
      </div>

      <div className="setting-row">
        <label htmlFor="measures">Measures / Inversion</label>
        <input
          id="measures"
          type="range"
          min={1}
          max={8}
          value={values.measuresPerAttempt}
          onChange={(e) => update("measuresPerAttempt", Number(e.target.value))}
          disabled={disabled}
        />
        <span className="setting-value">{values.measuresPerAttempt}</span>
      </div>

      <div className="setting-row">
        <label htmlFor="attempts">Attempts / Exercise</label>
        <input
          id="attempts"
          type="range"
          min={1}
          max={5}
          value={values.attemptsPerExercise}
          onChange={(e) => update("attemptsPerExercise", Number(e.target.value))}
          disabled={disabled}
        />
        <span className="setting-value">{values.attemptsPerExercise}</span>
      </div>

      <div className="setting-row">
        <label htmlFor="rest">Rest Measures</label>
        <input
          id="rest"
          type="range"
          min={0}
          max={4}
          value={values.restMeasures}
          onChange={(e) => update("restMeasures", Number(e.target.value))}
          disabled={disabled}
        />
        <span className="setting-value">{values.restMeasures}</span>
      </div>
    </div>
  );
}
