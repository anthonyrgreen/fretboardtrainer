import { useRef, useState } from "react";
import { GuideContent } from "./Guide";
import { InversionsContent, TriadShapesContent } from "./TriadShapes";
import "./InfoBar.css";

type Panel = "guide" | "inversions" | "shapes";

export function InfoBar() {
  const [active, setActive] = useState<Panel | null>(null);
  const [visible, setVisible] = useState<Panel | null>(null);
  const collapseRef = useRef<HTMLDivElement>(null);

  const toggle = (panel: Panel) => {
    const next = active === panel ? null : panel;
    setActive(next);
    if (next) {
      setVisible(next);
    } else {
      // Scroll to top over the same 350ms as the CSS collapse
      const start = window.scrollY;
      if (start > 0) {
        const duration = 350;
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          // ease-out curve to match CSS ease
          const ease = 1 - (1 - p) * (1 - p);
          window.scrollTo(0, start * (1 - ease));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName === "grid-template-rows") {
          collapseRef.current?.removeEventListener("transitionend", onEnd);
          setVisible(null);
        }
      };
      collapseRef.current?.addEventListener("transitionend", onEnd);
    }
  };

  return (
    <div className="info-bar">
      <div className="info-bar-tabs">
        <button
          className={`info-bar-tab${active === "guide" ? " active" : ""}`}
          onClick={() => toggle("guide")}
        >
          How to use
        </button>
        <button
          className={`info-bar-tab${active === "inversions" ? " active" : ""}`}
          onClick={() => toggle("inversions")}
        >
          Understanding inversions
        </button>
        <button
          className={`info-bar-tab${active === "shapes" ? " active" : ""}`}
          onClick={() => toggle("shapes")}
        >
          Triad shapes
        </button>
      </div>

      <div
        ref={collapseRef}
        className={`info-bar-collapse${active ? " open" : ""}`}
      >
        <div className="info-bar-panel">
          {visible === "guide" && <GuideContent />}
          {visible === "inversions" && <InversionsContent />}
          {visible === "shapes" && <TriadShapesContent />}
          {visible && (
            <button
              className="info-bar-close"
              onClick={() => active && toggle(active)}
              aria-label="Close panel"
            >
              &#x25B4;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
