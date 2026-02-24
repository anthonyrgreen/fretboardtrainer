import { useCallback, useEffect, useRef, useState } from "react";
import { playClick, resumeAudioContext } from "../utils/audio";

export type PlayState = "idle" | "playing" | "paused";

export interface MetronomeState {
  currentBeat: number;
  currentMeasure: number;
  playState: PlayState;
}

export interface MetronomeControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useMetronome(
  bpm: number,
  beatsPerMeasure: number,
  muted: boolean = false
): MetronomeState & MetronomeControls {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [currentMeasure, setCurrentMeasure] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatRef = useRef(-1);
  const measureRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const pausedAtRef = useRef(0);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  // When BPM changes mid-playback, reanchor nextBeatTime to preserve
  // the fraction of the current beat that has already elapsed.
  if (bpm !== bpmRef.current && playState === "playing") {
    const now = performance.now();
    const oldMsPerBeat = 60000 / bpmRef.current;
    const newMsPerBeat = 60000 / bpm;
    const timeUntilNextBeat = nextBeatTimeRef.current - now;
    const fraction = Math.max(0, Math.min(1, 1 - timeUntilNextBeat / oldMsPerBeat));
    nextBeatTimeRef.current = now + (1 - fraction) * newMsPerBeat;
  }

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
      if (!mutedRef.current) playClick(isAccent);

      setCurrentBeat(beatRef.current);
      setCurrentMeasure(measureRef.current);

      const msPerBeat = 60000 / bpmRef.current;
      nextBeatTimeRef.current += msPerBeat;

      if (nextBeatTimeRef.current < now) {
        nextBeatTimeRef.current = now + msPerBeat;
      }
    }
  }, []);

  const startInterval = useCallback(() => {
    intervalRef.current = window.setInterval(tick, 10);
  }, [tick]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    resumeAudioContext();
    beatRef.current = -1;
    measureRef.current = 0;
    setCurrentBeat(-1);
    setCurrentMeasure(0);

    const msPerBeat = 60000 / bpmRef.current;

    // Fire the first beat immediately
    beatRef.current = 0;
    measureRef.current = 0;
    if (!mutedRef.current) playClick(true);
    setCurrentBeat(0);
    setCurrentMeasure(0);

    nextBeatTimeRef.current = performance.now() + msPerBeat;
    startInterval();
    setPlayState("playing");
  }, [startInterval]);

  const pause = useCallback(() => {
    stopInterval();
    pausedAtRef.current = performance.now();
    setPlayState("paused");
  }, [stopInterval]);

  const resume = useCallback(() => {
    resumeAudioContext();
    // Shift the next beat time forward by the duration of the pause
    const pauseDuration = performance.now() - pausedAtRef.current;
    nextBeatTimeRef.current += pauseDuration;
    startInterval();
    setPlayState("playing");
  }, [startInterval]);

  const reset = useCallback(() => {
    stopInterval();
    setPlayState("idle");
    setCurrentBeat(-1);
    setCurrentMeasure(0);
    beatRef.current = -1;
    measureRef.current = 0;
  }, [stopInterval]);

  // iOS suspends setInterval and AudioContext when backgrounded, and
  // ctx.resume() requires a user gesture to re-unlock. Auto-pause so the
  // user can tap Resume (a real gesture) when they return.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden" && playState === "playing") {
        pause();
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [playState, pause]);

  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  return { currentBeat, currentMeasure, playState, start, pause, resume, reset };
}
