import { useCallback, useEffect, useRef, useState } from "react";
import { playClick, resumeAudioContext } from "../utils/audio";

export interface MetronomeState {
  currentBeat: number; // 0-indexed within measure
  currentMeasure: number; // absolute measure count since start, resets on stop
  isPlaying: boolean;
}

export interface MetronomeControls {
  start: () => void;
  stop: () => void;
}

export function useMetronome(
  bpm: number,
  beatsPerMeasure: number
): MetronomeState & MetronomeControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [currentMeasure, setCurrentMeasure] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatRef = useRef(-1);
  const measureRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);

  bpmRef.current = bpm;
  beatsPerMeasureRef.current = beatsPerMeasure;

  const tick = useCallback(() => {
    const now = performance.now();
    if (now >= nextBeatTimeRef.current) {
      const beat = beatRef.current + 1;
      const bpMeasure = beatsPerMeasureRef.current;

      if (beat >= bpMeasure) {
        beatRef.current = 0;
        measureRef.current += 1;
      } else {
        beatRef.current = beat;
      }

      const isAccent = beatRef.current === 0;
      playClick(isAccent);

      setCurrentBeat(beatRef.current);
      setCurrentMeasure(measureRef.current);

      const msPerBeat = 60000 / bpmRef.current;
      nextBeatTimeRef.current += msPerBeat;

      // If we've drifted too far, resync
      if (nextBeatTimeRef.current < now) {
        nextBeatTimeRef.current = now + msPerBeat;
      }
    }
  }, []);

  const start = useCallback(() => {
    resumeAudioContext();
    beatRef.current = -1;
    measureRef.current = 0;
    setCurrentBeat(-1);
    setCurrentMeasure(0);

    const msPerBeat = 60000 / bpmRef.current;
    nextBeatTimeRef.current = performance.now() + msPerBeat;

    // Fire the first beat immediately
    beatRef.current = 0;
    measureRef.current = 0;
    playClick(true);
    setCurrentBeat(0);
    setCurrentMeasure(0);

    nextBeatTimeRef.current = performance.now() + msPerBeat;

    intervalRef.current = window.setInterval(tick, 10);
    setIsPlaying(true);
  }, [tick]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(-1);
    setCurrentMeasure(0);
    beatRef.current = -1;
    measureRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { currentBeat, currentMeasure, isPlaying, start, stop };
}
