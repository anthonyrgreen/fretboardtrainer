import { useRef, useState } from "react";
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

/* ── Horizontal C major inversion fretboard ── */

const C_MAJOR_FRETBOARD: Dot[] = [
  // 2nd inversion (frets 0–1)
  { string: 3, fret: 0, label: "G", isRoot: false },
  { string: 4, fret: 1, label: "C", isRoot: true },
  { string: 5, fret: 0, label: "E", isRoot: false },
  // Root position (frets 3–5)
  { string: 3, fret: 5, label: "C", isRoot: true },
  { string: 4, fret: 5, label: "E", isRoot: false },
  { string: 5, fret: 3, label: "G", isRoot: false },
  // 1st inversion (frets 8–9)
  { string: 3, fret: 9, label: "E", isRoot: false },
  { string: 4, fret: 8, label: "G", isRoot: false },
  { string: 5, fret: 8, label: "C", isRoot: true },
];

const INV_LABELS = [
  { name: "2nd inv — C/G", fretMin: 0, fretMax: 1 },
  { name: "Root — C", fretMin: 3, fretMax: 5 },
  { name: "1st inv — C/E", fretMin: 8, fretMax: 9 },
];

const H_FRET_GAP = 46;
const H_STRING_GAP = 22;
const H_DOT_R = 9;
const H_PAD_L = 14;
const H_PAD_R = 14;
const H_PAD_T = 14;
const H_PAD_B = 38;
const H_OPEN_W = 22;
const H_FRET_MAX = 9;

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
        width={SVG_W}
        height={SVG_H}
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

function InversionFretboard() {
  const nutX = H_PAD_L + H_OPEN_W;
  const svgW = nutX + H_FRET_MAX * H_FRET_GAP + H_PAD_R;
  const svgH = H_PAD_T + 5 * H_STRING_GAP + H_PAD_B;

  const stringY = (s: number) => H_PAD_T + (5 - s) * H_STRING_GAP;
  const fretWireX = (f: number) => nutX + f * H_FRET_GAP;
  const dotCX = (f: number) => nutX + f * H_FRET_GAP; // on the fret wire
  const fretMidX = (f: number) => nutX + (f - 0.5) * H_FRET_GAP; // center of fret space

  const topY = stringY(5);
  const botY = stringY(0);
  const fretNumY = botY + 16;
  const invLabelY = botY + 28;

  return (
    <svg
      className="fretboard-svg inversion-fretboard"
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
    >
      {/* Nut */}
      <line x1={nutX} y1={topY} x2={nutX} y2={botY} stroke="#888" strokeWidth={3} />

      {/* Fret wires */}
      {Array.from({ length: H_FRET_MAX }, (_, i) => (
        <line
          key={`fw-${i}`}
          x1={fretWireX(i + 1)}
          y1={topY}
          x2={fretWireX(i + 1)}
          y2={botY}
          stroke="#555"
          strokeWidth={2}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: STRING_COUNT }, (_, i) => (
        <line
          key={`s-${i}`}
          x1={H_PAD_L}
          y1={stringY(i)}
          x2={fretWireX(H_FRET_MAX)}
          y2={stringY(i)}
          stroke={i < 3 ? "#333" : "#666"}
          strokeWidth={1 < 3 ? 2 : 1}
        />
      ))}

      {/* Fret marker dots (inlays) */}
      {[3, 5, 7, 9].map((f) => (
        <circle
          key={`marker-${f}`}
          cx={fretMidX(f)}
          cy={(topY + botY) / 2}
          r={4}
          fill="#727272"
        />
      ))}

      {/* Fret numbers */}
      {Array.from({ length: H_FRET_MAX + 1 }, (_, f) => (
        <text
          key={`fn-${f}`}
          x={dotCX(f)}
          y={fretNumY}
          textAnchor="middle"
          fill="#555"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
        >
          {f}
        </text>
      ))}

      {/* Inversion labels */}
      {INV_LABELS.map((inv) => (
        <text
          key={inv.name}
          x={(dotCX(inv.fretMin) + dotCX(inv.fretMax)) / 2}
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
      {C_MAJOR_FRETBOARD.map((dot, i) => {
        const cx = dotCX(dot.fret);
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

export function TriadShapes() {
  const [open, setOpen] = useState(false);
  const collapseRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      collapseRef.current?.addEventListener(
        "transitionend",
        () => {
          collapseRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        },
        { once: true }
      );
    }
  };

  return (
    <div className="triad-shapes">
      <button className="triad-shapes-toggle" onClick={toggle}>
        <span className={`triad-shapes-arrow${open ? " open" : ""}`}>&#x25B8;</span>
        Triad shapes
      </button>

      <div ref={collapseRef} className={`triad-shapes-collapse${open ? " open" : ""}`}>
        <div className="triad-shapes-content">
          <h3 className="shapes-heading">Understanding inversions</h3>
          <p className="inversions-text">
            A triad has three notes. The order they're stacked in
            determines the <em>inversion</em>:
          </p>
          <ul className="inversions-list">
            <li><strong>Root position</strong> — root on the bottom (C–E–G), written as <strong>C</strong></li>
            <li><strong>1st inversion</strong> — 3rd on the bottom (E–G–C), written as <strong>C/E</strong></li>
            <li><strong>2nd inversion</strong> — 5th on the bottom (G–C–E), written as <strong>C/G</strong></li>
          </ul>
          <p className="inversions-text">
            Here are all three inversions of C major on the G–B–e strings:
          </p>
          <InversionFretboard />
          <p className="inversions-text inversions-bridge">
            The full shapes below show how these inversions connect across all six strings.
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
      </div>
    </div>
  );
}
