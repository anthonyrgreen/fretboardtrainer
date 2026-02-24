import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Guide } from "./Guide";

describe("Guide", () => {
  it("renders the toggle text", () => {
    render(<Guide />);
    expect(screen.getByText("How to use")).toBeInTheDocument();
  });

  it("contains the what-is-this section", () => {
    render(<Guide />);
    expect(screen.getByText("What is this?")).toBeInTheDocument();
  });

  it("contains the getting-started section", () => {
    render(<Guide />);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
  });

  it("contains the tips section", () => {
    render(<Guide />);
    expect(screen.getByText("Tips")).toBeInTheDocument();
  });
});
