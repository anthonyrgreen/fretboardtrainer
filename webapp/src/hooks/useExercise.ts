import { useCallback, useRef } from "react";
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
  startMeasure: number;
  length: number;
}

/**
 * Produces measure data driven by the metronome's measure count.
 *
 * Each chord repeats for `measuresPerChord` measures, then a new
 * random chord is picked.
 */
export function useExercise(
  measuresPerChord: number,
  beatsPerMeasure: number
) {
  const cycleCache = useRef(new Map<number, ExerciseCycle>());

  const clearCache = useCallback(() => {
    cycleCache.current.clear();
  }, []);

  const getCycleForMeasure = useCallback(
    (measureIndex: number): ExerciseCycle => {
      const cycleIndex = Math.floor(measureIndex / measuresPerChord);

      if (cycleCache.current.has(cycleIndex)) {
        return cycleCache.current.get(cycleIndex)!;
      }

      if (cycleCache.current.size > 50) {
        const firstKey = cycleCache.current.keys().next().value;
        if (firstKey !== undefined) cycleCache.current.delete(firstKey);
      }

      const cycle: ExerciseCycle = {
        triad: getRandomTriad("major"),
        startMeasure: cycleIndex * measuresPerChord,
        length: measuresPerChord,
      };
      cycleCache.current.set(cycleIndex, cycle);
      return cycle;
    },
    [measuresPerChord]
  );

  const getMeasureData = useCallback(
    (measureIndex: number): MeasureData => {
      const cycle = getCycleForMeasure(measureIndex);
      return {
        measureIndex,
        beats: makePlayBeats(cycle.triad, beatsPerMeasure),
      };
    },
    [getCycleForMeasure, beatsPerMeasure]
  );

  return { getMeasureData, clearCache };
}

function makePlayBeats(triad: Triad, beatsPerMeasure: number): BeatData[] {
  return Array.from({ length: beatsPerMeasure }, (_, i) => {
    if (i < 3) {
      return { label: triad.inversions[i], isRest: false };
    }
    return { label: "", isRest: true };
  });
}
