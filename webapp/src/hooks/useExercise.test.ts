import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useExercise } from "./useExercise";
import type { BeatSlot } from "../components/Settings";

let callCount = 0;
const triads = [
  { root: "C", quality: "major" as const, inversions: ["C", "C/E", "C/G"] as [string, string, string] },
  { root: "D", quality: "major" as const, inversions: ["D", "D/F#", "D/A"] as [string, string, string] },
  { root: "E", quality: "major" as const, inversions: ["E", "E/G#", "E/B"] as [string, string, string] },
];

vi.mock("../utils/chords", () => ({
  getRandomTriad: vi.fn(() => triads[callCount++ % triads.length]),
}));

beforeEach(() => {
  callCount = 0;
});

const defaultPattern: BeatSlot[] = ["root", "1st", "2nd", "rest"];

describe("useExercise", () => {
  it("returns correct number of beats per measure", () => {
    const { result } = renderHook(() => useExercise(4, defaultPattern));
    const data = result.current.getMeasureData(0);
    expect(data.beats).toHaveLength(4);
  });

  it("works with different pattern lengths", () => {
    const pattern: BeatSlot[] = ["root", "1st", "2nd", "rest", "rest", "rest"];
    const { result } = renderHook(() => useExercise(4, pattern));
    const data = result.current.getMeasureData(0);
    expect(data.beats).toHaveLength(6);
  });

  it("default pattern produces root, 1st, 2nd, rest", () => {
    const { result } = renderHook(() => useExercise(4, defaultPattern));
    const data = result.current.getMeasureData(0);

    expect(data.beats[0].isRest).toBe(false);
    expect(data.beats[1].isRest).toBe(false);
    expect(data.beats[2].isRest).toBe(false);
    expect(data.beats[3].isRest).toBe(true);
  });

  it("all-chord pattern has no rests", () => {
    const pattern: BeatSlot[] = ["root", "1st", "2nd"];
    const { result } = renderHook(() => useExercise(4, pattern));
    const data = result.current.getMeasureData(0);

    expect(data.beats).toHaveLength(3);
    expect(data.beats.every((b) => !b.isRest)).toBe(true);
  });

  it("beats have the triad inversions as labels", () => {
    const { result } = renderHook(() => useExercise(4, defaultPattern));
    const data = result.current.getMeasureData(0);

    expect(data.beats[0].label).toBe("C");
    expect(data.beats[1].label).toBe("C/E");
    expect(data.beats[2].label).toBe("C/G");
  });

  it("returns correct measureIndex", () => {
    const { result } = renderHook(() => useExercise(4, defaultPattern));
    const data = result.current.getMeasureData(7);
    expect(data.measureIndex).toBe(7);
  });

  it("same measure index returns cached data", () => {
    const { result } = renderHook(() => useExercise(4, defaultPattern));
    const first = result.current.getMeasureData(0);
    const second = result.current.getMeasureData(0);

    expect(first.beats[0].label).toBe(second.beats[0].label);
  });

  it("measures in the same cycle share the same chord", () => {
    const { result } = renderHook(() => useExercise(4, defaultPattern));
    const m0 = result.current.getMeasureData(0);
    const m1 = result.current.getMeasureData(1);
    const m3 = result.current.getMeasureData(3);

    expect(m0.beats[0].label).toBe(m1.beats[0].label);
    expect(m0.beats[0].label).toBe(m3.beats[0].label);
  });

  it("different cycles can have different chords", () => {
    const { result } = renderHook(() => useExercise(1, defaultPattern));
    const m0 = result.current.getMeasureData(0);
    const m1 = result.current.getMeasureData(1);

    expect(m0.beats[0].label).toBe("C");
    expect(m1.beats[0].label).toBe("D");
  });

  it("clearCache causes fresh data generation", () => {
    const { result } = renderHook(() => useExercise(1, defaultPattern));
    result.current.getMeasureData(0); // consumes "C"

    result.current.clearCache();

    const after = result.current.getMeasureData(0);
    // After clearing, next call to getRandomTriad returns "D"
    expect(after.measureIndex).toBe(0);
    expect(after.beats[0].label).toBe("D");
  });

  it("rest beats have empty label", () => {
    const pattern: BeatSlot[] = ["root", "1st", "2nd", "rest", "rest"];
    const { result } = renderHook(() => useExercise(4, pattern));
    const data = result.current.getMeasureData(0);

    expect(data.beats[3].isRest).toBe(true);
    expect(data.beats[3].label).toBe("");
    expect(data.beats[4].isRest).toBe(true);
    expect(data.beats[4].label).toBe("");
  });

  it("random slot produces a valid inversion label", () => {
    const pattern: BeatSlot[] = ["random"];
    const { result } = renderHook(() => useExercise(4, pattern));
    const data = result.current.getMeasureData(0);

    expect(data.beats[0].isRest).toBe(false);
    expect(["C", "C/E", "C/G"]).toContain(data.beats[0].label);
  });

  it("all-rest pattern produces all rests", () => {
    const pattern: BeatSlot[] = ["rest", "rest"];
    const { result } = renderHook(() => useExercise(4, pattern));
    const data = result.current.getMeasureData(0);

    expect(data.beats).toHaveLength(2);
    expect(data.beats[0].isRest).toBe(true);
    expect(data.beats[0].label).toBe("");
    expect(data.beats[1].isRest).toBe(true);
    expect(data.beats[1].label).toBe("");
  });

  it("custom pattern produces correct inversions", () => {
    const pattern: BeatSlot[] = ["2nd", "root"];
    const { result } = renderHook(() => useExercise(4, pattern));
    const data = result.current.getMeasureData(0);

    expect(data.beats[0].label).toBe("C/G");
    expect(data.beats[1].label).toBe("C");
  });

  it("random beats are stable for the same measure (cached)", () => {
    const pattern: BeatSlot[] = ["random"];
    const { result } = renderHook(() => useExercise(4, pattern));
    const first = result.current.getMeasureData(0);
    const second = result.current.getMeasureData(0);

    expect(first.beats[0].label).toBe(second.beats[0].label);
  });

  it("changing beatPattern invalidates cached measure data", () => {
    let pattern: BeatSlot[] = ["root", "1st", "2nd", "rest"];
    const { result, rerender } = renderHook(
      ({ p }) => useExercise(4, p),
      { initialProps: { p: pattern } }
    );

    // Cache a measure with 4 beats
    const data4 = result.current.getMeasureData(0);
    expect(data4.beats).toHaveLength(4);

    // Change to 5-beat pattern
    pattern = ["root", "1st", "2nd", "rest", "rest"];
    rerender({ p: pattern });

    // Should return 5 beats, not stale 4-beat cache
    const data5 = result.current.getMeasureData(0);
    expect(data5.beats).toHaveLength(5);
  });
});
