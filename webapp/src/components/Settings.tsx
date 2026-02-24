import "./Settings.css";

export type BeatSlot = "root" | "1st" | "2nd" | "random" | "rest";

const SLOT_CYCLE: BeatSlot[] = ["root", "1st", "2nd", "random", "rest"];

const SLOT_LABELS: Record<BeatSlot, string> = {
  root: "Root",
  "1st": "1st",
  "2nd": "2nd",
  random: "Rnd",
  rest: "Rest",
};

export interface SettingsValues {
  bpm: number;
  beatPattern: BeatSlot[];
  measuresPerChord: number;
}

interface SettingsProps {
  values: SettingsValues;
  onChange: (values: SettingsValues) => void;
  disableStructure: boolean;
}

export function Settings({ values, onChange, disableStructure }: SettingsProps) {
  const update = (key: keyof SettingsValues, value: number) => {
    onChange({ ...values, [key]: value });
  };

  const cycleSlot = (index: number) => {
    if (disableStructure) return;
    const current = values.beatPattern[index];
    const nextIdx = (SLOT_CYCLE.indexOf(current) + 1) % SLOT_CYCLE.length;
    const newPattern = [...values.beatPattern];
    newPattern[index] = SLOT_CYCLE[nextIdx];
    onChange({ ...values, beatPattern: newPattern });
  };

  const addBeat = () => {
    if (disableStructure || values.beatPattern.length >= 8) return;
    onChange({ ...values, beatPattern: [...values.beatPattern, "rest"] });
  };

  const removeBeat = () => {
    if (disableStructure || values.beatPattern.length <= 1) return;
    onChange({ ...values, beatPattern: values.beatPattern.slice(0, -1) });
  };

  return (
    <div className="settings">
      <div className="setting-row">
        <label htmlFor="bpm">BPM</label>
        <input
          id="bpm"
          type="range"
          min={10}
          max={120}
          value={values.bpm}
          onChange={(e) => update("bpm", Number(e.target.value))}
          disabled={false}
        />
        <span className="setting-value">{values.bpm}</span>
      </div>

      <div className="setting-row">
        <label htmlFor="measures">Measures / Pattern</label>
        <input
          id="measures"
          type="range"
          min={1}
          max={10}
          value={values.measuresPerChord}
          onChange={(e) => update("measuresPerChord", Number(e.target.value))}
          disabled={disableStructure}
        />
        <span className="setting-value">{values.measuresPerChord}</span>
      </div>

      <div className="pattern-section">
        <label className="pattern-label">Measure pattern</label>
        <div className="pattern-row">
          <div className="pattern-slots">
            {values.beatPattern.map((slot, i) => (
              <button
                key={i}
                className={`pattern-slot ${slot}${disableStructure ? " disabled" : ""}`}
                onClick={() => cycleSlot(i)}
                disabled={disableStructure}
                title={`Click to cycle: Root → 1st → 2nd → Random → Rest`}
              >
                {SLOT_LABELS[slot]}
              </button>
            ))}
          </div>
          <div className="pattern-buttons">
            <button
              className="pattern-btn"
              onClick={addBeat}
              disabled={disableStructure || values.beatPattern.length >= 8}
              title="Add beat"
            >
              +
            </button>
            <button
              className="pattern-btn"
              onClick={removeBeat}
              disabled={disableStructure || values.beatPattern.length <= 1}
              title="Remove beat"
            >
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
