import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TriadShapes } from "./TriadShapes";

describe("TriadShapes", () => {
  it("renders the toggle text", () => {
    render(<TriadShapes />);
    expect(screen.getByText("Triad shapes")).toBeInTheDocument();
  });

  it("contains all shape titles for both qualities", () => {
    render(<TriadShapes />);
    // 2 of each (major + minor)
    expect(screen.getAllByText("Shape 1")).toHaveLength(2);
    expect(screen.getAllByText("Shape 2")).toHaveLength(2);
    expect(screen.getAllByText("Shape 3")).toHaveLength(2);
  });

  it("renders fretboard diagrams with interval labels", () => {
    render(<TriadShapes />);
    // Each shape has 2 roots = 6 per quality × 2 qualities = 12 total
    const roots = screen.getAllByText("R");
    expect(roots.length).toBe(12);
  });

  it("renders both major and minor sections", () => {
    render(<TriadShapes />);
    expect(screen.getByText("Major")).toBeInTheDocument();
    expect(screen.getByText("Minor")).toBeInTheDocument();
  });

  it("renders inversions explanation with examples", () => {
    render(<TriadShapes />);
    expect(screen.getByText("Understanding inversions")).toBeInTheDocument();
    expect(screen.getByText("Root position")).toBeInTheDocument();
    expect(screen.getByText("1st inversion")).toBeInTheDocument();
    expect(screen.getByText("2nd inversion")).toBeInTheDocument();
  });

  it("renders the movable shapes note", () => {
    render(<TriadShapes />);
    expect(
      screen.getByText(/These shapes are movable/)
    ).toBeInTheDocument();
  });
});
