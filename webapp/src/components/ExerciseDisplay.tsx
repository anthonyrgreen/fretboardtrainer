import type { ExerciseState } from "../hooks/useExercise";
import "./ExerciseDisplay.css";

interface ExerciseDisplayProps {
  exercise: ExerciseState;
  isPlaying: boolean;
}

export function ExerciseDisplay({ exercise, isPlaying }: ExerciseDisplayProps) {
  if (!isPlaying) {
    return (
      <div className="exercise-display idle">
        <div className="notes-display">Press Start</div>
      </div>
    );
  }

  if (exercise.phase === "rest") {
    return (
      <div className="exercise-display resting">
        <div className="notes-display">{exercise.notes.join("  ")}</div>
        <div className="phase-label rest-label">Rest</div>
      </div>
    );
  }

  return (
    <div className="exercise-display playing">
      <div className="notes-display">{exercise.notes.join("  ")}</div>
      <div className="inversion-label">{exercise.currentInversion} Position</div>
      <div className="attempt-label">
        Attempt {exercise.currentAttempt} / {exercise.attemptsPerExercise}
      </div>
    </div>
  );
}
