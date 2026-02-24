import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMetronome } from "./useMetronome";

// Mock audio module
vi.mock("../utils/audio", () => ({
  playClick: vi.fn(),
  resumeAudioContext: vi.fn(),
}));

describe("useMetronome", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in idle state with beat -1 and measure 0", () => {
    const { result } = renderHook(() => useMetronome(120, 4));

    expect(result.current.playState).toBe("idle");
    expect(result.current.currentBeat).toBe(-1);
    expect(result.current.currentMeasure).toBe(0);
  });

  it("start() sets playState to playing and fires beat 0", () => {
    const { result } = renderHook(() => useMetronome(120, 4));

    act(() => {
      result.current.start();
    });

    expect(result.current.playState).toBe("playing");
    expect(result.current.currentBeat).toBe(0);
    expect(result.current.currentMeasure).toBe(0);
  });

  it("advances beats on timer ticks", () => {
    const { result } = renderHook(() => useMetronome(120, 4));

    act(() => {
      result.current.start();
    });

    expect(result.current.currentBeat).toBe(0);

    // At 120 BPM, each beat is 500ms. Advance past the next beat.
    act(() => {
      vi.advanceTimersByTime(510);
    });

    expect(result.current.currentBeat).toBe(1);
  });

  it("wraps beat to 0 and increments measure at beatsPerMeasure", () => {
    const { result } = renderHook(() => useMetronome(600, 4));
    // 600 BPM = 100ms per beat

    act(() => {
      result.current.start();
    });

    expect(result.current.currentBeat).toBe(0);
    expect(result.current.currentMeasure).toBe(0);

    // Advance through beats 1, 2, 3, then beat 0 of measure 1
    act(() => {
      vi.advanceTimersByTime(410);
    });

    expect(result.current.currentBeat).toBe(0);
    expect(result.current.currentMeasure).toBe(1);
  });

  it("pause() sets playState to paused and preserves beat/measure", () => {
    const { result } = renderHook(() => useMetronome(600, 4));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(210);
    });

    expect(result.current.currentBeat).toBe(2);

    act(() => {
      result.current.pause();
    });

    expect(result.current.playState).toBe("paused");
    expect(result.current.currentBeat).toBe(2);
    expect(result.current.currentMeasure).toBe(0);
  });

  it("resume() sets playState back to playing", () => {
    const { result } = renderHook(() => useMetronome(120, 4));

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.pause();
    });

    act(() => {
      result.current.resume();
    });

    expect(result.current.playState).toBe("playing");
  });

  it("reset() returns to idle state", () => {
    const { result } = renderHook(() => useMetronome(120, 4));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(510);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.playState).toBe("idle");
    expect(result.current.currentBeat).toBe(-1);
    expect(result.current.currentMeasure).toBe(0);
  });

  it("does not advance beats while paused", () => {
    const { result } = renderHook(() => useMetronome(600, 4));

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.pause();
    });

    const beatAtPause = result.current.currentBeat;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentBeat).toBe(beatAtPause);
  });

  it("cleans up interval on unmount", () => {
    const { result, unmount } = renderHook(() => useMetronome(120, 4));

    act(() => {
      result.current.start();
    });

    unmount();

    // No error should occur when timers advance after unmount
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });
});
