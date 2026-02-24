import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InversionsContent, TriadShapesContent } from "./TriadShapes";

describe("InversionsContent", () => {
  it("renders inversions explanation with examples", () => {
    render(<InversionsContent />);
    expect(screen.getByText("Root position")).toBeInTheDocument();
    expect(screen.getByText("1st inversion")).toBeInTheDocument();
    expect(screen.getByText("2nd inversion")).toBeInTheDocument();
  });

  it("renders note selector and fretboard diagrams", () => {
    render(<InversionsContent />);
    expect(screen.getByRole("button", { name: "C" })).toBeInTheDocument();
    expect(screen.getByText(/G–B–e strings/)).toBeInTheDocument();
    expect(screen.getByText(/D–A–E strings/)).toBeInTheDocument();
  });

  it("renders major and minor shape diagrams", () => {
    render(<InversionsContent />);
    expect(screen.getByText("Major")).toBeInTheDocument();
    expect(screen.getByText("Minor")).toBeInTheDocument();
    expect(screen.getAllByText("Shape 1")).toHaveLength(2);
    expect(screen.getByText(/These shapes are movable/)).toBeInTheDocument();
  });
});

describe("TriadShapesContent", () => {
  it("renders string group selector with all groups", () => {
    render(<TriadShapesContent />);
    expect(screen.getByRole("button", { name: "E-A-D" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "A-D-G" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "D-G-B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "G-B-e" })).toBeInTheDocument();
  });

  it("renders note selector", () => {
    render(<TriadShapesContent />);
    expect(screen.getByRole("button", { name: "C" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "F#" })).toBeInTheDocument();
  });

  it("renders major and minor inversion fretboards with labels", () => {
    render(<TriadShapesContent />);
    // Both major and minor fretboards have Root/1st/2nd labels
    expect(screen.getAllByText(/Root — C/)).toHaveLength(2);
    expect(screen.getAllByText(/1st inv/)).toHaveLength(2);
    expect(screen.getAllByText(/2nd inv/)).toHaveLength(2);
    expect(screen.getByText("Major")).toBeInTheDocument();
    expect(screen.getByText("Minor")).toBeInTheDocument();
  });

  it("defaults to G-B-e string group", () => {
    render(<TriadShapesContent />);
    const gbeBtn = screen.getByRole("button", { name: "G-B-e" });
    expect(gbeBtn.className).toContain("active");
  });
});
