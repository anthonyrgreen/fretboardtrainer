import "./Metronome.css";

interface MetronomeProps {
  beatsPerMeasure: number;
  currentBeat: number; // -1 when not playing
}

export function Metronome({ beatsPerMeasure, currentBeat }: MetronomeProps) {
  return (
    <div className="metronome">
      {Array.from({ length: beatsPerMeasure }, (_, i) => (
        <div
          key={i}
          className={`beat-dot${i === currentBeat ? " active" : ""}${i === 0 ? " accent" : ""}`}
        />
      ))}
    </div>
  );
}
