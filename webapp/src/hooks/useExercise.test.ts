import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useExercise } from "./useExercise";

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

describe("useExercise", () => {
  it("returns correct number of beats per measure", () => {
    const { result } = renderHook(() => useExercise(4, 4));
    const data = result.current.getMeasureData(0);
    expect(data.beats).toHaveLength(4);
  });

  it("works with different beatsPerMeasure values", () => {
    const { result } = renderHook(() => useExercise(4, 6));
    const data = result.current.getMeasureData(0);
    expect(data.beats).toHaveLength(6);
  });

  it("first 3 beats are chord labels, rest are rests (4 beats)", () => {
    const { result } = renderHook(() => useExercise(4, 4));
    const data = result.current.getMeasureData(0);

    expect(data.beats[0].isRest).toBe(false);
    expect(data.beats[1].isRest).toBe(false);
    expect(data.beats[2].isRest).toBe(false);
    expect(data.beats[3].isRest).toBe(true);
  });

  it("all 3 beats are chords when beatsPerMeasure is 3", () => {
    const { result } = renderHook(() => useExercise(4, 3));
    const data = result.current.getMeasureData(0);

    expect(data.beats).toHaveLength(3);
    expect(data.beats.every((b) => !b.isRest)).toBe(true);
  });

  it("beats have the triad inversions as labels", () => {
    const { result } = renderHook(() => useExercise(4, 4));
    const data = result.current.getMeasureData(0);

    expect(data.beats[0].label).toBe("C");
    expect(data.beats[1].label).toBe("C/E");
    expect(data.beats[2].label).toBe("C/G");
  });

  it("returns correct measureIndex", () => {
    const { result } = renderHook(() => useExercise(4, 4));
    const data = result.current.getMeasureData(7);
    expect(data.measureIndex).toBe(7);
  });

  it("same measure index returns cached data", () => {
    const { result } = renderHook(() => useExercise(4, 4));
    const first = result.current.getMeasureData(0);
    const second = result.current.getMeasureData(0);

    expect(first.beats[0].label).toBe(second.beats[0].label);
  });

  it("measures in the same cycle share the same chord", () => {
    const { result } = renderHook(() => useExercise(4, 4));
    const m0 = result.current.getMeasureData(0);
    const m1 = result.current.getMeasureData(1);
    const m3 = result.current.getMeasureData(3);

    expect(m0.beats[0].label).toBe(m1.beats[0].label);
    expect(m0.beats[0].label).toBe(m3.beats[0].label);
  });

  it("different cycles can have different chords", () => {
    const { result } = renderHook(() => useExercise(1, 4));
    const m0 = result.current.getMeasureData(0);
    const m1 = result.current.getMeasureData(1);

    expect(m0.beats[0].label).toBe("C");
    expect(m1.beats[0].label).toBe("D");
  });

  it("clearCache causes fresh data generation", () => {
    const { result } = renderHook(() => useExercise(1, 4));
    result.current.getMeasureData(0); // consumes "C"

    result.current.clearCache();

    const after = result.current.getMeasureData(0);
    // After clearing, next call to getRandomTriad returns "D"
    expect(after.measureIndex).toBe(0);
    expect(after.beats[0].label).toBe("D");
  });

  it("rest beats have empty label", () => {
    const { result } = renderHook(() => useExercise(4, 5));
    const data = result.current.getMeasureData(0);

    expect(data.beats[3].isRest).toBe(true);
    expect(data.beats[3].label).toBe("");
    expect(data.beats[4].isRest).toBe(true);
    expect(data.beats[4].label).toBe("");
  });
});
