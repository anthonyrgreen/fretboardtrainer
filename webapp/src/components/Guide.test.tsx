import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuideContent } from "./Guide";

describe("GuideContent", () => {
  it("contains the what-is-this section", () => {
    render(<GuideContent />);
    expect(screen.getByText("What is this?")).toBeInTheDocument();
  });

  it("contains the getting-started section", () => {
    render(<GuideContent />);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
  });

  it("contains the tips section", () => {
    render(<GuideContent />);
    expect(screen.getByText("Tips")).toBeInTheDocument();
  });
});
