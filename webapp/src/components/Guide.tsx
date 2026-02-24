import { useRef, useState } from "react";
import "./Guide.css";

export function Guide() {
  const [open, setOpen] = useState(false);
  const collapseRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      // Wait for the expand transition to finish so the page is full height,
      // then scroll the bottom of the guide into view.
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
    <div className="guide">
      <button className="guide-toggle" onClick={toggle}>
        <span className={`guide-arrow${open ? " open" : ""}`}>&#x25B8;</span>
        How to use
      </button>

      <div ref={collapseRef} className={`guide-collapse${open ? " open" : ""}`}>
        <div className="guide-content">
          <section>
            <h3>What is this?</h3>
            <p>
              A practice tool for learning major triad inversions on guitar. It
              generates a random chord and scrolls through a measure pattern at
              your chosen tempo, so you can practice finding root position, 1st
              inversion, and 2nd inversion shapes on the fretboard.
            </p>
          </section>

          <section>
            <h3>Getting started</h3>
            <ol>
              <li>
                <strong>Set your pattern</strong> — each box in "Measure pattern"
                represents one beat. Click a box to cycle through: Root, 1st, 2nd,
                Random, or Rest. Use + and − to add or remove beats.
              </li>
              <li>
                <strong>Measures / Pattern</strong> — how many measures the same
                chord repeats before a new random chord appears.
              </li>
              <li>
                <strong>BPM</strong> — adjust the tempo. You can change this while
                playing.
              </li>
              <li>
                <strong>Press Start</strong> — the staff scrolls and a metronome
                clicks on each beat. Play the indicated inversion on your guitar
                before the next beat arrives.
              </li>
            </ol>
          </section>

          <section>
            <h3>Tips</h3>
            <ul>
              <li>
                Start slow (40–60 BPM) and increase as the shapes become
                familiar.
              </li>
              <li>
                Use "Random" beats to test yourself — you won't know which
                inversion is coming until you see it.
              </li>
              <li>
                Add rest beats to give yourself breathing room between
                inversions.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
