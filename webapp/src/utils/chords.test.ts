import { describe, it, expect } from "vitest";
import { getTriad, getRandomTriad } from "./chords";

describe("getTriad", () => {
  it("returns correct inversions for C major", () => {
    const triad = getTriad("C", "major");
    expect(triad.root).toBe("C");
    expect(triad.quality).toBe("major");
    expect(triad.inversions).toEqual(["C", "C/E", "C/G"]);
  });

  it("returns correct inversions for all 7 roots", () => {
    const expected: Record<string, [string, string, string]> = {
      A: ["A", "A/C#", "A/E"],
      B: ["B", "B/D#", "B/F#"],
      C: ["C", "C/E", "C/G"],
      D: ["D", "D/F#", "D/A"],
      E: ["E", "E/G#", "E/B"],
      F: ["F", "F/A", "F/C"],
      G: ["G", "G/B", "G/D"],
    };

    for (const [root, inversions] of Object.entries(expected)) {
      const triad = getTriad(root, "major");
      expect(triad.inversions).toEqual(inversions);
    }
  });

  it("throws on unknown root", () => {
    expect(() => getTriad("X", "major")).toThrow("Unknown root: X");
  });

  it("throws on unknown quality", () => {
    // @ts-expect-error testing invalid input
    expect(() => getTriad("C", "minor")).toThrow("Unknown quality: minor");
  });

  it("root position label equals the root note", () => {
    const triad = getTriad("D", "major");
    expect(triad.inversions[0]).toBe("D");
  });

  it("1st and 2nd inversions use slash notation", () => {
    const triad = getTriad("G", "major");
    expect(triad.inversions[1]).toBe("G/B");
    expect(triad.inversions[2]).toBe("G/D");
  });
});

describe("getRandomTriad", () => {
  it("returns a valid triad with 3 inversions", () => {
    const triad = getRandomTriad("major");
    expect(triad.quality).toBe("major");
    expect(triad.inversions).toHaveLength(3);
    expect(triad.root).toMatch(/^[A-G]$/);
  });

  it("root position always matches root", () => {
    for (let i = 0; i < 20; i++) {
      const triad = getRandomTriad("major");
      expect(triad.inversions[0]).toBe(triad.root);
    }
  });
});
