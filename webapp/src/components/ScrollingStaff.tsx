import { useEffect, useRef, useState } from "react";
import type { MeasureData } from "../hooks/useExercise";
import "./ScrollingStaff.css";

const PIXELS_PER_BEAT = 80;
const NOW_POST_X = 60;

interface ScrollingStaffProps {
  bpm: number;
  beatsPerMeasure: number;
  currentBeat: number;
  isPlaying: boolean;
  getMeasureData: (measureIndex: number) => MeasureData;
}

export function ScrollingStaff({
  bpm,
  beatsPerMeasure,
  currentBeat,
  isPlaying,
  getMeasureData,
}: ScrollingStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const pixelsPerMeasure = PIXELS_PER_BEAT * beatsPerMeasure;
  const msPerBeat = 60000 / bpm;
  const pixelsPerMs = PIXELS_PER_BEAT / msPerBeat;

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      setScrollOffset(0);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current;
      setScrollOffset(elapsed * pixelsPerMs);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, pixelsPerMs]);

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

  const isOnBeat = isPlaying && currentBeat >= 0;

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
              <div className="measure-separator" />

              {/* Beats */}
              {measure.beats.map((beat, beatIdx) => {
                const beatX = beatIdx * PIXELS_PER_BEAT;
                return (
                  <div
                    key={beatIdx}
                    className="beat-group"
                    style={{ left: beatX }}
                  >
                    <div className="beat-tick" />
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

      {/* Idle overlay */}
      {!isPlaying && (
        <div className="staff-idle">Press Start</div>
      )}
    </div>
  );
}

function RestSymbol() {
  return (
    <svg
      className="rest-svg"
      viewBox="0 0 20 40"
      width="14"
      height="28"
      fill="currentColor"
    >
      {/* Quarter rest approximation */}
      <path d="M12 0 L8 10 L14 18 L6 28 L10 40 L12 38 L8 30 L16 20 L8 12 L14 2 Z" />
    </svg>
  );
}
