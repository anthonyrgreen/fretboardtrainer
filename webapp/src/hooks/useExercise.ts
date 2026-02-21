import { useEffect, useRef, useState } from "react";

const ALL_NOTES = ["A", "B", "C", "D", "E", "F", "G"];
const INVERSIONS = ["Root", "1st", "2nd"] as const;
const NOTES_PER_EXERCISE = 3;

export type Inversion = (typeof INVERSIONS)[number];

export type ExercisePhase = "rest" | "play";

export interface ExerciseState {
  phase: ExercisePhase;
  notes: string[];
  currentInversion: Inversion;
  currentAttempt: number; // 1-indexed for display
  attemptsPerExercise: number;
}

function pickRandomNotes(count: number): string[] {
  const shuffled = [...ALL_NOTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Drives the exercise state machine based on measure count from the metronome.
 *
 * Exercise structure per cycle:
 *   - Rest: `restMeasures` measures
 *   - For each attempt (1..attemptsPerExercise):
 *     - For each inversion (Root, 1st, 2nd):
 *       - Play: `measuresPerAttempt` measures
 *     - Rest: 1 measure (between attempts, not after the last)
 *   - Then loop with new notes
 */
export function useExercise(
  currentMeasure: number,
  isPlaying: boolean,
  restMeasures: number,
  measuresPerAttempt: number,
  attemptsPerExercise: number
): ExerciseState {
  const [state, setState] = useState<ExerciseState>({
    phase: "rest",
    notes: pickRandomNotes(NOTES_PER_EXERCISE),
    currentInversion: "Root",
    currentAttempt: 1,
    attemptsPerExercise,
  });

  const prevMeasureRef = useRef(-1);

  // Reset on stop
  useEffect(() => {
    if (!isPlaying) {
      prevMeasureRef.current = -1;
      setState({
        phase: "rest",
        notes: pickRandomNotes(NOTES_PER_EXERCISE),
        currentInversion: "Root",
        currentAttempt: 1,
        attemptsPerExercise,
      });
    }
  }, [isPlaying, attemptsPerExercise]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentMeasure === prevMeasureRef.current) return;
    prevMeasureRef.current = currentMeasure;

    setState((prev) => {
      return computeState(
        currentMeasure,
        restMeasures,
        measuresPerAttempt,
        attemptsPerExercise,
        prev.notes
      );
    });
  }, [
    currentMeasure,
    isPlaying,
    restMeasures,
    measuresPerAttempt,
    attemptsPerExercise,
  ]);

  return state;
}

function computeState(
  absoluteMeasure: number,
  restMeasures: number,
  measuresPerAttempt: number,
  attemptsPerExercise: number,
  currentNotes: string[]
): ExerciseState {
  // One full exercise cycle length:
  // restMeasures (initial rest)
  // + attemptsPerExercise * (3 inversions * measuresPerAttempt)
  // + (attemptsPerExercise - 1) * 1 (rest between attempts)
  const playMeasuresPerAttempt = INVERSIONS.length * measuresPerAttempt;
  const restBetweenAttempts = attemptsPerExercise > 1 ? attemptsPerExercise - 1 : 0;
  const cycleLength =
    restMeasures +
    attemptsPerExercise * playMeasuresPerAttempt +
    restBetweenAttempts;

  const posInCycle = absoluteMeasure % cycleLength;
  const cycleIndex = Math.floor(absoluteMeasure / cycleLength);

  // Determine notes — new random set each cycle
  // Use a seeded approach: generate based on cycle index
  const notes =
    cycleIndex === 0 && absoluteMeasure < cycleLength
      ? currentNotes
      : pickNotesForCycle(cycleIndex);

  // Initial rest phase
  if (posInCycle < restMeasures) {
    return {
      phase: "rest",
      notes,
      currentInversion: "Root",
      currentAttempt: 1,
      attemptsPerExercise,
    };
  }

  // Play + rest-between-attempts phase
  let pos = posInCycle - restMeasures;

  for (let attempt = 0; attempt < attemptsPerExercise; attempt++) {
    // Play phase for this attempt
    if (pos < playMeasuresPerAttempt) {
      const inversionIdx = Math.floor(pos / measuresPerAttempt);
      return {
        phase: "play",
        notes,
        currentInversion: INVERSIONS[inversionIdx],
        currentAttempt: attempt + 1,
        attemptsPerExercise,
      };
    }
    pos -= playMeasuresPerAttempt;

    // Rest between attempts (except after last)
    if (attempt < attemptsPerExercise - 1) {
      if (pos < 1) {
        return {
          phase: "rest",
          notes,
          currentInversion: INVERSIONS[0],
          currentAttempt: attempt + 2,
          attemptsPerExercise,
        };
      }
      pos -= 1;
    }
  }

  // Shouldn't reach here, but fallback
  return {
    phase: "rest",
    notes,
    currentInversion: "Root",
    currentAttempt: 1,
    attemptsPerExercise,
  };
}

// Simple way to get different notes per cycle
const cycleNotesCache = new Map<number, string[]>();

function pickNotesForCycle(cycleIndex: number): string[] {
  if (!cycleNotesCache.has(cycleIndex)) {
    // Keep cache bounded
    if (cycleNotesCache.size > 100) {
      const firstKey = cycleNotesCache.keys().next().value;
      if (firstKey !== undefined) cycleNotesCache.delete(firstKey);
    }
    cycleNotesCache.set(cycleIndex, pickRandomNotes(NOTES_PER_EXERCISE));
  }
  return cycleNotesCache.get(cycleIndex)!;
}
