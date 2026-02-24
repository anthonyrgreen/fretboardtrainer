import { useCallback, useRef } from "react";
import { getRandomTriad, type Triad } from "../utils/chords";
import type { BeatSlot } from "../components/Settings";

export interface BeatData {
  label: string;
  isRest: boolean;
}

export interface MeasureData {
  beats: BeatData[];
  measureIndex: number;
}

/**
 * Produces measure data driven by the metronome's measure count.
 *
 * Each chord repeats for `measuresPerChord` measures, then a new
 * random chord is picked. The `beatPattern` defines what each beat
 * in a measure does (root, 1st, 2nd, random inversion, or rest).
 */
export function useExercise(
  measuresPerChord: number,
  beatPattern: BeatSlot[]
) {
  // Cache triads per cycle (same chord for N measures)
  const cycleCache = useRef(new Map<number, Triad>());
  // Cache generated measure data (stabilizes random beats)
  const measureCache = useRef(new Map<number, MeasureData>());

  // Invalidate measure cache when beatPattern changes
  const prevPatternRef = useRef(beatPattern);
  if (
    prevPatternRef.current.length !== beatPattern.length ||
    prevPatternRef.current.some((s, i) => s !== beatPattern[i])
  ) {
    measureCache.current.clear();
    prevPatternRef.current = beatPattern;
  }

  const clearCache = useCallback(() => {
    cycleCache.current.clear();
    measureCache.current.clear();
  }, []);

  const getTriadForMeasure = useCallback(
    (measureIndex: number): Triad => {
      const cycleIndex = Math.floor(measureIndex / measuresPerChord);

      if (cycleCache.current.has(cycleIndex)) {
        return cycleCache.current.get(cycleIndex)!;
      }

      if (cycleCache.current.size > 50) {
        const firstKey = cycleCache.current.keys().next().value;
        if (firstKey !== undefined) cycleCache.current.delete(firstKey);
      }

      const triad = getRandomTriad("major");
      cycleCache.current.set(cycleIndex, triad);
      return triad;
    },
    [measuresPerChord]
  );

  const getMeasureData = useCallback(
    (measureIndex: number): MeasureData => {
      if (measureCache.current.has(measureIndex)) {
        return measureCache.current.get(measureIndex)!;
      }

      if (measureCache.current.size > 200) {
        const firstKey = measureCache.current.keys().next().value;
        if (firstKey !== undefined) measureCache.current.delete(firstKey);
      }

      const triad = getTriadForMeasure(measureIndex);
      const data: MeasureData = {
        measureIndex,
        beats: makePlayBeats(triad, beatPattern),
      };
      measureCache.current.set(measureIndex, data);
      return data;
    },
    [getTriadForMeasure, beatPattern]
  );

  return { getMeasureData, clearCache };
}

function makePlayBeats(triad: Triad, beatPattern: BeatSlot[]): BeatData[] {
  return beatPattern.map((slot) => {
    switch (slot) {
      case "root":
        return { label: triad.inversions[0], isRest: false };
      case "1st":
        return { label: triad.inversions[1], isRest: false };
      case "2nd":
        return { label: triad.inversions[2], isRest: false };
      case "random":
        return {
          label: triad.inversions[Math.floor(Math.random() * 3)],
          isRest: false,
        };
      case "rest":
        return { label: "", isRest: true };
    }
  });
}
