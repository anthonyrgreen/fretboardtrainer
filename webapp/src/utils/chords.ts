export type TriadQuality = "major";

export interface Triad {
  root: string;
  quality: TriadQuality;
  inversions: [string, string, string]; // [root position, 1st inversion, 2nd inversion]
}

const MAJOR_TRIADS: Record<string, [string, string, string]> = {
  A: ["A", "A/C#", "A/E"],
  B: ["B", "B/D#", "B/F#"],
  C: ["C", "C/E", "C/G"],
  D: ["D", "D/F#", "D/A"],
  E: ["E", "E/G#", "E/B"],
  F: ["F", "F/A", "F/C"],
  G: ["G", "G/B", "G/D"],
};

const ROOTS = Object.keys(MAJOR_TRIADS);

export function getTriad(root: string, quality: TriadQuality): Triad {
  if (quality === "major") {
    const inversions = MAJOR_TRIADS[root];
    if (!inversions) throw new Error(`Unknown root: ${root}`);
    return { root, quality, inversions };
  }
  throw new Error(`Unknown quality: ${quality}`);
}

export function getRandomTriad(quality: TriadQuality): Triad {
  const root = ROOTS[Math.floor(Math.random() * ROOTS.length)];
  return getTriad(root, quality);
}
