import { useCallback, useEffect, useRef } from "react";
import { getRandomTriad, type Triad } from "../utils/chords";

export interface BeatData {
  label: string;
  isRest: boolean;
}

export interface MeasureData {
  beats: BeatData[];
  measureIndex: number;
}

interface ExerciseCycle {
  triad: Triad;
  startMeasure: number; // absolute measure index where this cycle starts
  length: number; // total measures in this cycle
}

/**
 * Produces measure data driven by the metronome's measure count.
 *
 * Exercise cycle structure:
 *   - `restMeasures` rest measures (count-in)
 *   - For each attempt (1..attemptsPerExercise):
 *     - `measuresPerAttempt` play measures (same chord, all 3 inversions per measure)
 *     - 1 rest measure between attempts (not after the last)
 *   - New random chord → repeat
 */
export function useExercise(
  isPlaying: boolean,
  restMeasures: number,
  measuresPerAttempt: number,
  attemptsPerExercise: number,
  beatsPerMeasure: number
) {
  const cycleCache = useRef(new Map<number, ExerciseCycle>());

  // Clear cache on start so each session gets fresh chords.
  // Cache is kept on stop so the paused display retains its chords.
  useEffect(() => {
    if (isPlaying) {
      cycleCache.current.clear();
    }
  }, [isPlaying]);

  const getCycleLength = useCallback(() => {
    const playMeasures = attemptsPerExercise * measuresPerAttempt;
    const restBetween = attemptsPerExercise > 1 ? attemptsPerExercise - 1 : 0;
    return restMeasures + playMeasures + restBetween;
  }, [restMeasures, measuresPerAttempt, attemptsPerExercise]);

  const getCycleForMeasure = useCallback(
    (measureIndex: number): ExerciseCycle => {
      const cycleLen = getCycleLength();
      const cycleIndex = Math.floor(measureIndex / cycleLen);

      if (cycleCache.current.has(cycleIndex)) {
        return cycleCache.current.get(cycleIndex)!;
      }

      // Keep cache bounded
      if (cycleCache.current.size > 50) {
        const firstKey = cycleCache.current.keys().next().value;
        if (firstKey !== undefined) cycleCache.current.delete(firstKey);
      }

      const cycle: ExerciseCycle = {
        triad: getRandomTriad("major"),
        startMeasure: cycleIndex * cycleLen,
        length: cycleLen,
      };
      cycleCache.current.set(cycleIndex, cycle);
      return cycle;
    },
    [getCycleLength]
  );

  const getMeasureData = useCallback(
    (measureIndex: number): MeasureData => {
      const cycle = getCycleForMeasure(measureIndex);
      const posInCycle = measureIndex - cycle.startMeasure;

      // Rest measures at start of cycle
      if (posInCycle < restMeasures) {
        return {
          measureIndex,
          beats: makeRestBeats(beatsPerMeasure),
        };
      }

      // Play + rest-between-attempts
      let pos = posInCycle - restMeasures;
      for (let attempt = 0; attempt < attemptsPerExercise; attempt++) {
        // Play measures for this attempt
        if (pos < measuresPerAttempt) {
          return {
            measureIndex,
            beats: makePlayBeats(cycle.triad, beatsPerMeasure),
          };
        }
        pos -= measuresPerAttempt;

        // Rest between attempts
        if (attempt < attemptsPerExercise - 1) {
          if (pos < 1) {
            return {
              measureIndex,
              beats: makeRestBeats(beatsPerMeasure),
            };
          }
          pos -= 1;
        }
      }

      // Fallback (shouldn't happen)
      return {
        measureIndex,
        beats: makeRestBeats(beatsPerMeasure),
      };
    },
    [
      getCycleForMeasure,
      restMeasures,
      measuresPerAttempt,
      attemptsPerExercise,
      beatsPerMeasure,
    ]
  );

  return { getMeasureData };
}

function makeRestBeats(beatsPerMeasure: number): BeatData[] {
  return Array.from({ length: beatsPerMeasure }, () => ({
    label: "",
    isRest: true,
  }));
}

function makePlayBeats(triad: Triad, beatsPerMeasure: number): BeatData[] {
  return Array.from({ length: beatsPerMeasure }, (_, i) => {
    if (i < 3) {
      return { label: triad.inversions[i], isRest: false };
    }
    return { label: "", isRest: true };
  });
}
