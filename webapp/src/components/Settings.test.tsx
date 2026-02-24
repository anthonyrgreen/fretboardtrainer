import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Settings, type SettingsValues } from "./Settings";

const defaultValues: SettingsValues = {
  bpm: 80,
  beatsPerMeasure: 4,
  measuresPerChord: 4,
};

describe("Settings", () => {
  it("renders three labeled sliders", () => {
    render(
      <Settings values={defaultValues} onChange={() => {}} disableStructure={false} />
    );

    expect(screen.getByLabelText("BPM")).toBeInTheDocument();
    expect(screen.getByLabelText("Beats / Measure")).toBeInTheDocument();
    expect(screen.getByLabelText("Measures / Chord")).toBeInTheDocument();
  });

  it("displays current BPM value", () => {
    render(
      <Settings
        values={{ ...defaultValues, bpm: 120 }}
        onChange={() => {}}
        disableStructure={false}
      />
    );

    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("calls onChange when BPM slider changes", () => {
    const onChange = vi.fn();
    render(
      <Settings values={defaultValues} onChange={onChange} disableStructure={false} />
    );

    const bpmInput = screen.getByLabelText("BPM");
    fireEvent.input(bpmInput, { target: { value: "120" } });

    expect(onChange).toHaveBeenCalledWith({
      ...defaultValues,
      bpm: 120,
    });
  });

  it("calls onChange when beats/measure slider changes", () => {
    const onChange = vi.fn();
    render(
      <Settings values={defaultValues} onChange={onChange} disableStructure={false} />
    );

    fireEvent.input(screen.getByLabelText("Beats / Measure"), {
      target: { value: "6" },
    });

    expect(onChange).toHaveBeenCalledWith({
      ...defaultValues,
      beatsPerMeasure: 6,
    });
  });

  it("disableStructure disables beats/measure and measures/chord but not bpm", () => {
    render(
      <Settings values={defaultValues} onChange={() => {}} disableStructure={true} />
    );

    expect(screen.getByLabelText("BPM")).not.toBeDisabled();
    expect(screen.getByLabelText("Beats / Measure")).toBeDisabled();
    expect(screen.getByLabelText("Measures / Chord")).toBeDisabled();
  });

  it("all sliders enabled when disableStructure is false", () => {
    render(
      <Settings values={defaultValues} onChange={() => {}} disableStructure={false} />
    );

    expect(screen.getByLabelText("BPM")).not.toBeDisabled();
    expect(screen.getByLabelText("Beats / Measure")).not.toBeDisabled();
    expect(screen.getByLabelText("Measures / Chord")).not.toBeDisabled();
  });
});
