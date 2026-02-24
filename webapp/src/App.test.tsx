import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

// Mock audio to avoid Web Audio API issues in tests
vi.mock("./utils/audio", () => ({
  playClick: vi.fn(),
  resumeAudioContext: vi.fn(),
}));

// Mock requestAnimationFrame for ScrollingStaff
vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
vi.stubGlobal("cancelAnimationFrame", vi.fn());

describe("App", () => {
  it("renders the title", () => {
    render(<App />);
    expect(screen.getByText("Triad trainer")).toBeInTheDocument();
  });

  it("shows Start and Reset buttons in idle state", () => {
    render(<App />);
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("shows Pause and Stop buttons after clicking Start", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Start"));

    expect(screen.getByText("Pause")).toBeInTheDocument();
    expect(screen.getByText("Stop")).toBeInTheDocument();
  });

  it("shows Resume and Reset buttons after pausing", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Start"));
    fireEvent.click(screen.getByText("Pause"));

    expect(screen.getByText("Resume")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("returns to idle state after clicking Stop", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Start"));
    fireEvent.click(screen.getByText("Stop"));

    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders settings sliders", () => {
    render(<App />);

    expect(screen.getByLabelText("BPM")).toBeInTheDocument();
    expect(screen.getByLabelText("Beats / Measure")).toBeInTheDocument();
    expect(screen.getByLabelText("Measures / Chord")).toBeInTheDocument();
  });

  it("settings are not disabled in idle state", () => {
    render(<App />);

    expect(screen.getByLabelText("BPM")).not.toBeDisabled();
    expect(screen.getByLabelText("Beats / Measure")).not.toBeDisabled();
    expect(screen.getByLabelText("Measures / Chord")).not.toBeDisabled();
  });

  it("structure settings are disabled while playing", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Start"));

    expect(screen.getByLabelText("BPM")).not.toBeDisabled();
    expect(screen.getByLabelText("Beats / Measure")).toBeDisabled();
    expect(screen.getByLabelText("Measures / Chord")).toBeDisabled();
  });

  it("renders mute button", () => {
    render(<App />);
    expect(screen.getByText("Mute")).toBeInTheDocument();
  });

  it("mute button toggles to Unmute when clicked", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Mute"));
    expect(screen.getByText("Unmute")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Unmute"));
    expect(screen.getByText("Mute")).toBeInTheDocument();
  });

  it("structure settings are not disabled while paused", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Start"));
    fireEvent.click(screen.getByText("Pause"));

    expect(screen.getByLabelText("Beats / Measure")).not.toBeDisabled();
    expect(screen.getByLabelText("Measures / Chord")).not.toBeDisabled();
  });
});
