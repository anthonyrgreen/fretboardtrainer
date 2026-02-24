import { useEffect, useRef, useState } from "react";
import type { MeasureData } from "../hooks/useExercise";
import type { PlayState } from "../hooks/useMetronome";
import "./ScrollingStaff.css";

const PIXELS_PER_BEAT = 140;
const NOW_POST_X = 60;

interface ScrollingStaffProps {
  bpm: number;
  beatsPerMeasure: number;
  currentBeat: number;
  currentMeasure: number;
  playState: PlayState;
  getMeasureData: (measureIndex: number) => MeasureData;
}

export function ScrollingStaff({
  bpm,
  beatsPerMeasure,
  currentBeat,
  currentMeasure,
  playState,
  getMeasureData,
}: ScrollingStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Refs so the rAF callback always reads fresh values
  const bpmRef = useRef(bpm);
  const currentBeatRef = useRef(currentBeat);
  const currentMeasureRef = useRef(currentMeasure);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const lastBeatTimeRef = useRef(0);

  bpmRef.current = bpm;
  beatsPerMeasureRef.current = beatsPerMeasure;

  // Track when beats change to anchor interpolation
  if (currentBeat !== currentBeatRef.current || currentMeasure !== currentMeasureRef.current) {
    lastBeatTimeRef.current = performance.now();
    currentBeatRef.current = currentBeat;
    currentMeasureRef.current = currentMeasure;
  }

  const pixelsPerMeasure = PIXELS_PER_BEAT * beatsPerMeasure;

  // Animation loop — derives scroll position from metronome beat count
  useEffect(() => {
    if (playState === "playing") {
      const animate = () => {
        const msPerBeat = 60000 / bpmRef.current;
        const globalBeat =
          currentMeasureRef.current * beatsPerMeasureRef.current +
          currentBeatRef.current;
        const timeSinceBeat = performance.now() - lastBeatTimeRef.current;
        const fraction = Math.min(timeSinceBeat / msPerBeat, 1);
        setScrollOffset((globalBeat + fraction) * PIXELS_PER_BEAT);
        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafRef.current);
    }

    if (playState === "idle") {
      setScrollOffset(0);
    }
    // "paused" — stop animating, keep current offset
  }, [playState]);

  // Determine visible measures
  const containerWidth = containerRef.current?.clientWidth ?? 800;
  const visibleLeft = scrollOffset - NOW_POST_X;
  const visibleRight = scrollOffset + containerWidth;

  const firstVisibleMeasure = Math.max(0, Math.floor(visibleLeft / pixelsPerMeasure));
  const lastVisibleMeasure = Math.ceil(visibleRight / pixelsPerMeasure);

  const measures: MeasureData[] = [];
  for (let i = firstVisibleMeasure; i <= lastVisibleMeasure; i++) {
    measures.push(getMeasureData(i));
  }

  const isActive = playState === "playing";
  const isOnBeat = isActive && currentBeat >= 0;

  return (
    <div className="staff-container" ref={containerRef}>
      {/* Fixed "now" post */}
      <div
        className={`now-post${isOnBeat ? " flash" : ""}`}
        style={{ left: NOW_POST_X }}
      />

      {/* Staff line (fixed in container, not scrolling) */}
      <div className="staff-line" />

      {/* Scrolling track */}
      <div
        className="staff-track"
        style={{ transform: `translateX(${-scrollOffset + NOW_POST_X}px)` }}
      >

        {measures.map((measure) => {
          const measureX = measure.measureIndex * pixelsPerMeasure;

          return (
            <div
              key={measure.measureIndex}
              className="measure-group"
              style={{ left: measureX }}
            >
              {/* Measure separator */}
              <div className={`measure-separator${isActive && measure.measureIndex === currentMeasure && currentBeat === 0 ? " active" : ""}`} />

              {/* Beats */}
              {measure.beats.map((beat, beatIdx) => {
                const beatX = beatIdx * PIXELS_PER_BEAT;
                const beatIsActive = isActive && measure.measureIndex === currentMeasure && beatIdx === currentBeat;
                return (
                  <div
                    key={beatIdx}
                    className="beat-group"
                    style={{ left: beatX }}
                  >
                    {beatIdx > 0 && <div className={`beat-tick${beatIsActive ? " active" : ""}`} />}
                    <div className="beat-label">
                      {beat.isRest ? (
                        <RestSymbol />
                      ) : (
                        beat.label
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

    </div>
  );
}

function RestSymbol() {
  return (
    <svg
      className="rest-svg"
      viewBox="510.4 70.9 5.6 14.5"
      width="14"
      height="28"
      fill="currentColor"
    >
      {/* Quarter rest approximation */}
      <path d="M 512.254,71.019 C 512.117,71.077 512.035,71.277 512.098,71.417 C 512.117,71.437 512.316,71.675 512.516,71.937 C 512.973,72.452 513.051,72.574 513.152,72.812 C 513.551,73.628 513.332,74.667 512.633,75.324 C 512.574,75.402 512.316,75.62 512.074,75.8 C 511.379,76.398 511.059,76.738 510.941,77.038 C 510.898,77.117 510.898,77.195 510.898,77.316 C 510.879,77.593 510.898,77.617 511.719,78.57 C 512.832,79.906 513.629,80.843 513.691,80.902 L 513.75,80.96 L 513.672,80.921 C 512.574,80.464 511.34,80.245 510.922,80.445 C 510.781,80.503 510.699,80.585 510.641,80.722 C 510.48,81.062 510.523,81.562 510.762,82.296 C 510.98,82.956 511.418,83.831 511.855,84.488 C 512.035,84.769 512.375,85.206 512.414,85.226 C 512.473,85.285 512.555,85.265 512.613,85.226 C 512.672,85.148 512.672,85.085 512.555,84.949 C 512.137,84.351 511.938,83.113 512.176,82.456 C 512.273,82.16 512.395,81.999 512.613,81.898 C 513.191,81.64 514.469,81.96 515.004,82.495 C 515.043,82.535 515.125,82.617 515.164,82.636 C 515.305,82.695 515.504,82.617 515.563,82.476 C 515.645,82.335 515.602,82.238 515.422,82.019 C 515.086,81.62 514.07,80.425 513.93,80.245 C 513.57,79.827 513.41,79.429 513.371,78.929 C 513.352,78.292 513.609,77.617 514.09,77.175 C 514.148,77.097 514.406,76.878 514.645,76.699 C 515.383,76.081 515.684,75.742 515.801,75.421 C 515.883,75.163 515.844,74.925 515.664,74.706 C 515.602,74.648 514.906,73.788 514.09,72.812 C 512.973,71.499 512.574,71.019 512.516,70.999 C 512.434,70.98 512.336,70.98 512.254,71.019 z"/>
      {/* <path d="M12 0 L8 10 L14 18 L6 28 L10 40 L12 38 L8 30 L16 20 L8 12 L14 2 Z" /> */}
    </svg>
  );
}
