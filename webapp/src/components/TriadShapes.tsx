import { useState } from "react";
import "./TriadShapes.css";

interface Dot {
  string: number; // 0=low E (left), 5=high e (right)
  fret: number;   // row from top of diagram (0-based)
  label: string;  // "R", "p5", "Δ3", "m3"
  isRoot: boolean;
}

interface ShapeData {
  name: string;
  dots: Dot[];
}

const MAJOR_SHAPES: ShapeData[] = [
  {
    name: "Shape 1",
    dots: [
      { string: 5, fret: 0, label: "Δ3", isRoot: false },
      { string: 4, fret: 1, label: "R",  isRoot: true },
      { string: 3, fret: 0, label: "p5", isRoot: false },
      { string: 2, fret: 2, label: "Δ3", isRoot: false },
      { string: 1, fret: 3, label: "R",  isRoot: true },
      { string: 0, fret: 3, label: "p5", isRoot: false },
    ],
  },
  {
    name: "Shape 2",
    dots: [
      { string: 5, fret: 0, label: "p5", isRoot: false },
      { string: 4, fret: 2, label: "Δ3", isRoot: false },
      { string: 3, fret: 2, label: "R",  isRoot: true },
      { string: 2, fret: 2, label: "p5", isRoot: false },
      { string: 1, fret: 4, label: "Δ3", isRoot: false },
      { string: 0, fret: 5, label: "R",  isRoot: true },
    ],
  },
  {
    name: "Shape 3",
    dots: [
      { string: 5, fret: 0, label: "R",  isRoot: true },
      { string: 4, fret: 0, label: "p5", isRoot: false },
      { string: 3, fret: 1, label: "Δ3", isRoot: false },
      { string: 2, fret: 2, label: "R",  isRoot: true },
      { string: 1, fret: 2, label: "p5", isRoot: false },
      { string: 0, fret: 4, label: "Δ3", isRoot: false },
    ],
  },
];

const MINOR_SHAPES: ShapeData[] = [
  {
    name: "Shape 1",
    dots: [
      { string: 5, fret: 0, label: "p5", isRoot: false },
      { string: 4, fret: 1, label: "m3", isRoot: false },
      { string: 3, fret: 2, label: "R",  isRoot: true },
      { string: 2, fret: 2, label: "p5", isRoot: false },
      { string: 1, fret: 3, label: "m3", isRoot: false },
      { string: 0, fret: 5, label: "R",  isRoot: true },
    ],
  },
  {
    name: "Shape 2",
    dots: [
      { string: 5, fret: 0, label: "R",  isRoot: true },
      { string: 4, fret: 0, label: "p5", isRoot: false },
      { string: 3, fret: 0, label: "m3", isRoot: false },
      { string: 2, fret: 2, label: "R",  isRoot: true },
      { string: 1, fret: 2, label: "p5", isRoot: false },
      { string: 0, fret: 3, label: "m3", isRoot: false },
    ],
  },
  {
    name: "Shape 3",
    dots: [
      { string: 5, fret: 0, label: "m3", isRoot: false },
      { string: 4, fret: 2, label: "R",  isRoot: true },
      { string: 3, fret: 1, label: "p5", isRoot: false },
      { string: 2, fret: 2, label: "m3", isRoot: false },
      { string: 1, fret: 4, label: "R",  isRoot: true },
      { string: 0, fret: 4, label: "p5", isRoot: false },
    ],
  },
];

/* ── Horizontal inversion fretboard ── */

const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21];

function getMajorTriad(rootIndex: number) {
  const root  = NOTES[rootIndex];
  const third = NOTES[(rootIndex + 4) % 12];
  const fifth = NOTES[(rootIndex + 7) % 12];
  return { root, third, fifth };
}

function getMinorTriad(rootIndex: number) {
  const root  = NOTES[rootIndex];
  const third = NOTES[(rootIndex + 3) % 12];
  const fifth = NOTES[(rootIndex + 7) % 12];
  return { root, third, fifth };
}

// Relative dot positions for each inversion (relative to root offset)
// G–B–e strings (strings 3, 4, 5): G→B is M3, B→e is P4
const INV_SHAPES_GBE = [
  {
    type: "2nd" as const,
    lowestRel: 0,
    dots: [
      { string: 3, rel: 0, note: "fifth" as const },
      { string: 4, rel: 1, note: "root" as const },
      { string: 5, rel: 0, note: "third" as const },
    ],
  },
  {
    type: "root" as const,
    lowestRel: 3,
    dots: [
      { string: 3, rel: 5, note: "root" as const },
      { string: 4, rel: 5, note: "third" as const },
      { string: 5, rel: 3, note: "fifth" as const },
    ],
  },
  {
    type: "1st" as const,
    lowestRel: 8,
    dots: [
      { string: 3, rel: 9, note: "third" as const },
      { string: 4, rel: 8, note: "fifth" as const },
      { string: 5, rel: 8, note: "root" as const },
    ],
  },
];

// E–A–D strings (strings 0, 1, 2): E→A is P4, A→D is P4
const INV_SHAPES_EAD = [
  {
    type: "2nd" as const,
    lowestRel: 2,
    dots: [
      { string: 0, rel: 3, note: "fifth" as const },
      { string: 1, rel: 3, note: "root" as const },
      { string: 2, rel: 2, note: "third" as const },
    ],
  },
  {
    type: "root" as const,
    lowestRel: 5,
    dots: [
      { string: 0, rel: 8, note: "root" as const },
      { string: 1, rel: 7, note: "third" as const },
      { string: 2, rel: 5, note: "fifth" as const },
    ],
  },
  {
    type: "1st" as const,
    lowestRel: 10,
    dots: [
      { string: 0, rel: 12, note: "third" as const },
      { string: 1, rel: 10, note: "fifth" as const },
      { string: 2, rel: 10, note: "root" as const },
    ],
  },
];

// A–D–G strings (strings 1, 2, 3): A→D is P4, D→G is P4
const INV_SHAPES_ADG = [
  {
    type: "root" as const,
    lowestRel: 0,
    dots: [
      { string: 1, rel: 3, note: "root" as const },
      { string: 2, rel: 2, note: "third" as const },
      { string: 3, rel: 0, note: "fifth" as const },
    ],
  },
  {
    type: "1st" as const,
    lowestRel: 5,
    dots: [
      { string: 1, rel: 7, note: "third" as const },
      { string: 2, rel: 5, note: "fifth" as const },
      { string: 3, rel: 5, note: "root" as const },
    ],
  },
  {
    type: "2nd" as const,
    lowestRel: 9,
    dots: [
      { string: 1, rel: 10, note: "fifth" as const },
      { string: 2, rel: 10, note: "root" as const },
      { string: 3, rel: 9, note: "third" as const },
    ],
  },
];

// D–G–B strings (strings 2, 3, 4): D→G is P4, G→B is M3
const INV_SHAPES_DGB = [
  {
    type: "1st" as const,
    lowestRel: 0,
    dots: [
      { string: 2, rel: 2, note: "third" as const },
      { string: 3, rel: 0, note: "fifth" as const },
      { string: 4, rel: 1, note: "root" as const },
    ],
  },
  {
    type: "2nd" as const,
    lowestRel: 5,
    dots: [
      { string: 2, rel: 5, note: "fifth" as const },
      { string: 3, rel: 5, note: "root" as const },
      { string: 4, rel: 5, note: "third" as const },
    ],
  },
  {
    type: "root" as const,
    lowestRel: 8,
    dots: [
      { string: 2, rel: 10, note: "root" as const },
      { string: 3, rel: 9, note: "third" as const },
      { string: 4, rel: 8, note: "fifth" as const },
    ],
  },
];

/* ── Minor inversion shapes ── */

// G–B–e minor (strings 3, 4, 5)
const INV_SHAPES_GBE_MINOR = [
  {
    type: "root" as const,
    lowestRel: 3,
    dots: [
      { string: 3, rel: 5, note: "root" as const },
      { string: 4, rel: 4, note: "third" as const },
      { string: 5, rel: 3, note: "fifth" as const },
    ],
  },
  {
    type: "1st" as const,
    lowestRel: 8,
    dots: [
      { string: 3, rel: 8, note: "third" as const },
      { string: 4, rel: 8, note: "fifth" as const },
      { string: 5, rel: 8, note: "root" as const },
    ],
  },
  {
    type: "2nd" as const,
    lowestRel: 11,
    dots: [
      { string: 3, rel: 12, note: "fifth" as const },
      { string: 4, rel: 13, note: "root" as const },
      { string: 5, rel: 11, note: "third" as const },
    ],
  },
];

// E–A–D minor (strings 0, 1, 2)
const INV_SHAPES_EAD_MINOR = [
  {
    type: "2nd" as const,
    lowestRel: 1,
    dots: [
      { string: 0, rel: 3, note: "fifth" as const },
      { string: 1, rel: 3, note: "root" as const },
      { string: 2, rel: 1, note: "third" as const },
    ],
  },
  {
    type: "root" as const,
    lowestRel: 5,
    dots: [
      { string: 0, rel: 8, note: "root" as const },
      { string: 1, rel: 6, note: "third" as const },
      { string: 2, rel: 5, note: "fifth" as const },
    ],
  },
  {
    type: "1st" as const,
    lowestRel: 10,
    dots: [
      { string: 0, rel: 11, note: "third" as const },
      { string: 1, rel: 10, note: "fifth" as const },
      { string: 2, rel: 10, note: "root" as const },
    ],
  },
];

// A–D–G minor (strings 1, 2, 3)
const INV_SHAPES_ADG_MINOR = [
  {
    type: "root" as const,
    lowestRel: 0,
    dots: [
      { string: 1, rel: 3, note: "root" as const },
      { string: 2, rel: 1, note: "third" as const },
      { string: 3, rel: 0, note: "fifth" as const },
    ],
  },
  {
    type: "1st" as const,
    lowestRel: 5,
    dots: [
      { string: 1, rel: 6, note: "third" as const },
      { string: 2, rel: 5, note: "fifth" as const },
      { string: 3, rel: 5, note: "root" as const },
    ],
  },
  {
    type: "2nd" as const,
    lowestRel: 8,
    dots: [
      { string: 1, rel: 10, note: "fifth" as const },
      { string: 2, rel: 10, note: "root" as const },
      { string: 3, rel: 8, note: "third" as const },
    ],
  },
];

// D–G–B minor (strings 2, 3, 4)
const INV_SHAPES_DGB_MINOR = [
  {
    type: "1st" as const,
    lowestRel: 0,
    dots: [
      { string: 2, rel: 1, note: "third" as const },
      { string: 3, rel: 0, note: "fifth" as const },
      { string: 4, rel: 1, note: "root" as const },
    ],
  },
  {
    type: "2nd" as const,
    lowestRel: 4,
    dots: [
      { string: 2, rel: 5, note: "fifth" as const },
      { string: 3, rel: 5, note: "root" as const },
      { string: 4, rel: 4, note: "third" as const },
    ],
  },
  {
    type: "root" as const,
    lowestRel: 8,
    dots: [
      { string: 2, rel: 10, note: "root" as const },
      { string: 3, rel: 8, note: "third" as const },
      { string: 4, rel: 8, note: "fifth" as const },
    ],
  },
];

const STRING_GROUPS = [
  { label: "E-A-D", strings: new Set([0, 1, 2]), major: INV_SHAPES_EAD, minor: INV_SHAPES_EAD_MINOR },
  { label: "A-D-G", strings: new Set([1, 2, 3]), major: INV_SHAPES_ADG, minor: INV_SHAPES_ADG_MINOR },
  { label: "D-G-B", strings: new Set([2, 3, 4]), major: INV_SHAPES_DGB, minor: INV_SHAPES_DGB_MINOR },
  { label: "G-B-e", strings: new Set([3, 4, 5]), major: INV_SHAPES_GBE, minor: INV_SHAPES_GBE_MINOR },
];

type InvType = "root" | "1st" | "2nd";

type InvShape = typeof INV_SHAPES_GBE;

function computeInversions(rootIndex: number, shapes: InvShape, minor = false) {
  const { root, third, fifth } = minor ? getMinorTriad(rootIndex) : getMajorTriad(rootIndex);
  const noteNames = { root, third, fifth };

  const groups = shapes.map((shape) => {
    const absLowest = rootIndex + shape.lowestRel;
    const wrap = absLowest >= 12;
    const shift = wrap ? -12 : 0;
    const dots: Dot[] = shape.dots.map((d) => ({
      string: d.string,
      fret: rootIndex + d.rel + shift,
      label: noteNames[d.note],
      isRoot: d.note === "root",
    }));
    const frets = dots.map((d) => d.fret);
    return {
      type: shape.type as InvType,
      dots,
      minFret: Math.min(...frets),
      maxFret: Math.max(...frets),
    };
  });

  groups.sort((a, b) => a.minFret - b.minFret);

  const labelInfo: Record<InvType, string> = {
    "2nd": `2nd inv — ${root}/${fifth}`,
    "root": `Root — ${root}`,
    "1st": `1st inv — ${root}/${third}`,
  };

  const allDots = groups.flatMap((g) => g.dots);
  const labels = groups.map((g) => ({
    name: labelInfo[g.type],
    fretMin: g.minFret,
    fretMax: g.maxFret,
  }));

  return { allDots, labels, root, third, fifth };
}

const H_FRET_GAP = 46;
const H_STRING_GAP = 22;
const H_DOT_R = 9;
const H_PAD_L = 14;
const H_PAD_R = 14;
const H_PAD_T = 14;
const H_PAD_B = 38;

const STRING_COUNT = 6;
const FRET_ROWS = 6;
const STRING_GAP = 30;
const FRET_GAP = 38;
const DOT_R = 12;
const PAD_X = 18;
const PAD_Y = 20;

const SVG_W = PAD_X * 2 + (STRING_COUNT - 1) * STRING_GAP;
const SVG_H = PAD_Y * 2 + FRET_ROWS * FRET_GAP;

function FretboardDiagram({ shape }: { shape: ShapeData }) {
  const stringX = (s: number) => PAD_X + s * STRING_GAP;
  const fretY = (f: number) => PAD_Y + f * FRET_GAP;
  const dotY = (f: number) => fretY(f + 1);

  return (
    <div className="shape-diagram">
      <h4 className="shape-title">{shape.name}</h4>
      <svg
        className="fretboard-svg"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      >
        {/* Fret lines (horizontal) */}
        {Array.from({ length: FRET_ROWS + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={PAD_X}
            y1={fretY(i)}
            x2={PAD_X + (STRING_COUNT - 1) * STRING_GAP}
            y2={fretY(i)}
            stroke="#555"
            strokeWidth={i === 0 ? 3 : 1}
          />
        ))}

        {/* String lines (vertical) */}
        {Array.from({ length: STRING_COUNT }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={stringX(i)}
            y1={fretY(0)}
            x2={stringX(i)}
            y2={fretY(FRET_ROWS)}
            stroke="#666"
            strokeWidth={1}
          />
        ))}

        {/* Dots */}
        {shape.dots.map((dot, i) => {
          const cx = stringX(dot.string);
          const cy = dotY(dot.fret);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={DOT_R}
                fill={dot.isRoot ? "#e8a43a" : "#ddd"}
                stroke={dot.isRoot ? "#e8a43a" : "#ddd"}
                strokeWidth={2}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#1a1a1a"
                fontSize={dot.label.length > 1 ? 9 : 11}
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {dot.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const H_START_FRET = 0;
const H_END_FRET = 14;
const H_SPAN = H_END_FRET - H_START_FRET;

interface InvFretboardProps {
  rootIndex: number;
  shapes: InvShape;
  activeStrings: Set<number>;
  minor?: boolean;
}

function InversionFretboard({ rootIndex, shapes, activeStrings, minor = false }: InvFretboardProps) {
  const { allDots, labels } = computeInversions(rootIndex, shapes, minor);

  const svgW = H_PAD_L + H_SPAN * H_FRET_GAP + H_PAD_R;
  const svgH = H_PAD_T + 5 * H_STRING_GAP + H_PAD_B;

  const stringY = (s: number) => H_PAD_T + (5 - s) * H_STRING_GAP;
  const fretToX = (f: number) => H_PAD_L + (f - H_START_FRET) * H_FRET_GAP;
  const fretMidX = (f: number) => fretToX(f) - H_FRET_GAP / 2;

  const topY = stringY(5);
  const botY = stringY(0);
  const fretNumY = botY + 16;
  const invLabelY = botY + 28;

  const visibleMarkers = FRET_MARKERS.filter(
    (f) => f > H_START_FRET && f <= H_END_FRET
  );

  return (
    <svg
      className="fretboard-svg inversion-fretboard"
      viewBox={`0 0 ${svgW} ${svgH}`}
    >
      {/* Fret wires */}
      {Array.from({ length: H_SPAN + 1 }, (_, i) => {
        const absFret = H_START_FRET + i;
        return (
          <line
            key={`fw-${i}`}
            x1={fretToX(absFret)}
            y1={topY}
            x2={fretToX(absFret)}
            y2={botY}
            stroke={absFret === 0 ? "#888" : "#555"}
            strokeWidth={absFret === 0 ? 3 : 2}
          />
        );
      })}

      {/* String lines */}
      {Array.from({ length: STRING_COUNT }, (_, i) => (
        <line
          key={`s-${i}`}
          x1={H_PAD_L}
          y1={stringY(i)}
          x2={fretToX(H_END_FRET)}
          y2={stringY(i)}
          stroke={activeStrings.has(i) ? "#666" : "#333"}
          strokeWidth={activeStrings.has(i) ? 1 : 2}
        />
      ))}

      {/* Fret marker dots (inlays) */}
      {visibleMarkers.map((f) => {
        const mx = fretMidX(f);
        const midY = (topY + botY) / 2;
        if (f === 12) {
          // Double dot: between G & B strings, and between A & D strings
          const upperY = (stringY(3) + stringY(4)) / 2;
          const lowerY = (stringY(1) + stringY(2)) / 2;
          return (
            <g key={`marker-${f}`}>
              <circle cx={mx} cy={upperY} r={4} fill="#727272" />
              <circle cx={mx} cy={lowerY} r={4} fill="#727272" />
            </g>
          );
        }
        return (
          <circle key={`marker-${f}`} cx={mx} cy={midY} r={4} fill="#727272" />
        );
      })}

      {/* Fret numbers */}
      {Array.from({ length: H_SPAN + 1 }, (_, i) => {
        const absFret = H_START_FRET + i;
        return (
          <text
            key={`fn-${absFret}`}
            x={fretToX(absFret)}
            y={fretNumY}
            textAnchor="middle"
            fill="#555"
            fontSize={9}
            fontFamily="system-ui, sans-serif"
          >
            {absFret}
          </text>
        );
      })}

      {/* Inversion labels */}
      {labels.map((inv) => (
        <text
          key={inv.name}
          x={(fretToX(inv.fretMin) + fretToX(inv.fretMax)) / 2}
          y={invLabelY}
          textAnchor="middle"
          fill="#e8a43a"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
        >
          {inv.name}
        </text>
      ))}

      {/* Dots */}
      {allDots.map((dot, i) => {
        const cx = fretToX(dot.fret);
        const cy = stringY(dot.string);
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={H_DOT_R}
              fill={dot.isRoot ? "#e8a43a" : "#ddd"}
              stroke={dot.isRoot ? "#e8a43a" : "#ddd"}
              strokeWidth={2}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#1a1a1a"
              fontSize={11}
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              {dot.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function InversionsContent() {
  const [rootIndex, setRootIndex] = useState(0);

  const { root, third, fifth } = getMajorTriad(rootIndex);

  return (
    <div className="triad-shapes-content">
      <p className="inversions-text">
        A triad has three notes. The order they're stacked in
        determines the <em>inversion</em>:
      </p>
      <ul className="inversions-list">
        <li><strong>Root position</strong> — root on the bottom ({root}–{third}–{fifth}), written as <strong>{root}</strong></li>
        <li><strong>1st inversion</strong> — 3rd on the bottom ({third}–{fifth}–{root}), written as <strong>{root}/{third}</strong></li>
        <li><strong>2nd inversion</strong> — 5th on the bottom ({fifth}–{root}–{third}), written as <strong>{root}/{fifth}</strong></li>
      </ul>
      <p className="inversions-text">
        Here are all three inversions of {root} major on the G–B–e strings:
      </p>
      <div className="note-selector">
        {NOTES.map((note, i) => (
          <button
            key={note}
            className={`note-btn${i === rootIndex ? " active" : ""}`}
            onClick={() => setRootIndex(i)}
          >
            {note}
          </button>
        ))}
      </div>
      <InversionFretboard rootIndex={rootIndex} shapes={INV_SHAPES_GBE} activeStrings={new Set([3, 4, 5])} />
      <p className="inversions-text">
        But these inversions could also be played on the D–A–E strings:
      </p>
      <InversionFretboard rootIndex={rootIndex} shapes={INV_SHAPES_EAD} activeStrings={new Set([0, 1, 2])} />
      <p className="inversions-text">
        Any other combination of strings will work as well!
      </p>

      <h3 className="shapes-heading">Major</h3>
      <div className="shapes-row">
        {MAJOR_SHAPES.map((shape) => (
          <FretboardDiagram key={`maj-${shape.name}`} shape={shape} />
        ))}
      </div>

      <h3 className="shapes-heading">Minor</h3>
      <div className="shapes-row">
        {MINOR_SHAPES.map((shape) => (
          <FretboardDiagram key={`min-${shape.name}`} shape={shape} />
        ))}
      </div>

      <p className="shapes-note">
        These shapes are movable — slide up or down the neck to change key.
        Root notes are highlighted.
      </p>
    </div>
  );
}

export function TriadShapesContent() {
  const [rootIndex, setRootIndex] = useState(0);
  const [groupIndex, setGroupIndex] = useState(3); // default G-B-e

  const group = STRING_GROUPS[groupIndex];

  return (
    <div className="triad-shapes-content">
      <p className="inversions-text">
        Pick a root and string group to see all three inversions.
      </p>
      <div className="string-group-selector">
        {STRING_GROUPS.map((g, i) => (
          <button
            key={g.label}
            className={`string-group-btn${i === groupIndex ? " active" : ""}`}
            onClick={() => setGroupIndex(i)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="note-selector">
        {NOTES.map((note, i) => (
          <button
            key={note}
            className={`note-btn${i === rootIndex ? " active" : ""}`}
            onClick={() => setRootIndex(i)}
          >
            {note}
          </button>
        ))}
      </div>
      <h3 className="shapes-heading">Major</h3>
      <InversionFretboard rootIndex={rootIndex} shapes={group.major} activeStrings={group.strings} />
      <h3 className="shapes-heading">Minor</h3>
      <InversionFretboard rootIndex={rootIndex} shapes={group.minor} activeStrings={group.strings} minor />
    </div>
  );
}
