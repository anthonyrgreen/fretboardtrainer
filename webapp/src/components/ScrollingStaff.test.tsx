import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollingStaff } from "./ScrollingStaff";
import type { MeasureData } from "../hooks/useExercise";

// Mock requestAnimationFrame
vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
vi.stubGlobal("cancelAnimationFrame", vi.fn());

const makeMeasureData = (index: number): MeasureData => ({
  measureIndex: index,
  beats: [
    { label: "C", isRest: false },
    { label: "C/E", isRest: false },
    { label: "C/G", isRest: false },
    { label: "", isRest: true },
  ],
});

const defaultProps = {
  bpm: 120,
  beatsPerMeasure: 4,
  currentBeat: -1,
  currentMeasure: 0,
  playState: "idle" as const,
  getMeasureData: makeMeasureData,
};

describe("ScrollingStaff", () => {
  it("renders without crashing in idle state", () => {
    const { container } = render(<ScrollingStaff {...defaultProps} />);
    expect(container.querySelector(".staff-container")).toBeInTheDocument();
  });

  it("renders the now-post", () => {
    const { container } = render(<ScrollingStaff {...defaultProps} />);
    expect(container.querySelector(".now-post")).toBeInTheDocument();
  });

  it("renders the staff line", () => {
    const { container } = render(<ScrollingStaff {...defaultProps} />);
    expect(container.querySelector(".staff-line")).toBeInTheDocument();
  });

  it("renders chord labels from getMeasureData", () => {
    render(<ScrollingStaff {...defaultProps} />);

    // Multiple measures may be visible, so use getAllByText
    expect(screen.getAllByText("C").length).toBeGreaterThan(0);
    expect(screen.getAllByText("C/E").length).toBeGreaterThan(0);
    expect(screen.getAllByText("C/G").length).toBeGreaterThan(0);
  });

  it("renders rest symbols for rest beats", () => {
    const { container } = render(<ScrollingStaff {...defaultProps} />);
    const restSvgs = container.querySelectorAll(".rest-svg");
    expect(restSvgs.length).toBeGreaterThan(0);
  });

  it("renders measure separators", () => {
    const { container } = render(<ScrollingStaff {...defaultProps} />);
    const separators = container.querySelectorAll(".measure-separator");
    expect(separators.length).toBeGreaterThan(0);
  });

  it("beat 0 has no beat-tick (separator serves as tick)", () => {
    const { container } = render(
      <ScrollingStaff {...defaultProps} playState="playing" currentBeat={0} />
    );

    // Each measure group should have beat-ticks only for beats > 0
    const beatGroups = container.querySelectorAll(".beat-group");
    // First beat-group in each measure should NOT have a beat-tick
    const firstBeatGroup = beatGroups[0];
    expect(firstBeatGroup?.querySelector(".beat-tick")).toBeNull();
  });

  it("now-post has flash class when playing", () => {
    const { container } = render(
      <ScrollingStaff {...defaultProps} playState="playing" currentBeat={0} />
    );

    const nowPost = container.querySelector(".now-post");
    expect(nowPost?.classList.contains("flash")).toBe(true);
  });

  it("now-post does not have flash class when idle", () => {
    const { container } = render(<ScrollingStaff {...defaultProps} />);

    const nowPost = container.querySelector(".now-post");
    expect(nowPost?.classList.contains("flash")).toBe(false);
  });

  it("active beat-tick gets active class when playing", () => {
    const { container } = render(
      <ScrollingStaff
        {...defaultProps}
        playState="playing"
        currentBeat={1}
        currentMeasure={0}
      />
    );

    const activeTicks = container.querySelectorAll(".beat-tick.active");
    expect(activeTicks.length).toBeGreaterThan(0);
  });

  it("measure separator gets active class on beat 0", () => {
    const { container } = render(
      <ScrollingStaff
        {...defaultProps}
        playState="playing"
        currentBeat={0}
        currentMeasure={0}
      />
    );

    const activeSeparators = container.querySelectorAll(".measure-separator.active");
    expect(activeSeparators.length).toBeGreaterThan(0);
  });

  it("calls getMeasureData for visible measures", () => {
    const getMeasureData = vi.fn(makeMeasureData);

    render(<ScrollingStaff {...defaultProps} getMeasureData={getMeasureData} />);

    expect(getMeasureData).toHaveBeenCalled();
    // Should at least request measure 0
    expect(getMeasureData).toHaveBeenCalledWith(0);
  });
});
