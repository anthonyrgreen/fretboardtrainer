import { useState } from "react";
import { Settings, type SettingsValues } from "./components/Settings";
import { Metronome } from "./components/Metronome";
import { ExerciseDisplay } from "./components/ExerciseDisplay";
import { useMetronome } from "./hooks/useMetronome";
import { useExercise } from "./hooks/useExercise";
import "./App.css";

const DEFAULT_SETTINGS: SettingsValues = {
  bpm: 80,
  beatsPerMeasure: 4,
  measuresPerAttempt: 2,
  attemptsPerExercise: 3,
  restMeasures: 1,
};

function App() {
  const [settings, setSettings] = useState<SettingsValues>(DEFAULT_SETTINGS);

  const metronome = useMetronome(settings.bpm, settings.beatsPerMeasure);

  const exercise = useExercise(
    metronome.currentMeasure,
    metronome.isPlaying,
    settings.restMeasures,
    settings.measuresPerAttempt,
    settings.attemptsPerExercise
  );

  const handleToggle = () => {
    if (metronome.isPlaying) {
      metronome.stop();
    } else {
      metronome.start();
    }
  };

  return (
    <div className="app">
      <h1 className="title">Gimme Three Notes</h1>

      <ExerciseDisplay exercise={exercise} isPlaying={metronome.isPlaying} />

      <Metronome
        beatsPerMeasure={settings.beatsPerMeasure}
        currentBeat={metronome.currentBeat}
      />

      <button className="start-btn" onClick={handleToggle}>
        {metronome.isPlaying ? "Stop" : "Start"}
      </button>

      <Settings
        values={settings}
        onChange={setSettings}
        disabled={metronome.isPlaying}
      />
    </div>
  );
}

export default App;
