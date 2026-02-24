import { useState } from "react";
import { Settings, type SettingsValues } from "./components/Settings";
import { ScrollingStaff } from "./components/ScrollingStaff";
import { useMetronome } from "./hooks/useMetronome";
import { useExercise } from "./hooks/useExercise";
import { Guide } from "./components/Guide";
import { TriadShapes } from "./components/TriadShapes";
import "./App.css";

const DEFAULT_SETTINGS: SettingsValues = {
  bpm: 80,
  beatPattern: ["root", "1st", "2nd", "rest"],
  measuresPerChord: 4,
};

function App() {
  const [settings, setSettings] = useState<SettingsValues>(DEFAULT_SETTINGS);
  const [muted, setMuted] = useState(false);

  const beatsPerMeasure = settings.beatPattern.length;
  const metronome = useMetronome(settings.bpm, beatsPerMeasure, muted);

  const exercise = useExercise(
    settings.measuresPerChord,
    settings.beatPattern
  );

  const handleStart = () => {
    exercise.clearCache();
    metronome.start();
  };

  const handleSettingsChange = (newSettings: SettingsValues) => {
    const structureChanged =
      newSettings.beatPattern.length !== settings.beatPattern.length ||
      newSettings.beatPattern.some((s, i) => s !== settings.beatPattern[i]) ||
      newSettings.measuresPerChord !== settings.measuresPerChord;

    setSettings(newSettings);

    if (structureChanged && metronome.playState !== "idle") {
      exercise.clearCache();
      metronome.reset();
    }
  };

  return (
    <div className="app">
      <h1 className="title">Triad trainer</h1>

      <ScrollingStaff
        bpm={settings.bpm}
        beatsPerMeasure={beatsPerMeasure}
        currentBeat={metronome.currentBeat}
        currentMeasure={metronome.currentMeasure}
        playState={metronome.playState}
        getMeasureData={exercise.getMeasureData}
      />

      <div className="controls">
        {metronome.playState === "idle" && (
          <>
            <button className="start-btn" onClick={handleStart}>Start</button>
            <button className="start-btn secondary" onClick={metronome.reset}>Reset</button>
          </>
        )}
        {metronome.playState === "playing" && (
          <>
            <button className="start-btn" onClick={metronome.pause}>Pause</button>
            <button className="start-btn secondary" onClick={metronome.reset}>Stop</button>
          </>
        )}
        {metronome.playState === "paused" && (
          <>
            <button className="start-btn" onClick={metronome.resume}>Resume</button>
            <button className="start-btn secondary" onClick={metronome.reset}>Reset</button>
          </>
        )}
      </div>

      <Settings
        values={settings}
        onChange={handleSettingsChange}
        disableStructure={metronome.playState === "playing"}
      />

      <button
        className="mute-btn"
        onClick={() => setMuted((m) => !m)}
      >
        {muted ? "Unmute" : "Mute"}
      </button>

      <Guide />
      <TriadShapes />
    </div>
  );
}

export default App;
