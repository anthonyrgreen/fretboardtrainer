import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Settings, type SettingsValues } from "./Settings";

const defaultValues: SettingsValues = {
  bpm: 80,
  beatPattern: ["root", "1st", "2nd", "rest"],
  measuresPerChord: 4,
};

describe("Settings", () => {
  it("renders BPM and measures/chord sliders", () => {
    render(
      <Settings values={defaultValues} onChange={() => {}} disableStructure={false} />
    );

    expect(screen.getByLabelText("BPM")).toBeInTheDocument();
    expect(screen.getByLabelText("Measures / Pattern")).toBeInTheDocument();
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

  it("renders beat pattern slots", () => {
    render(
      <Settings values={defaultValues} onChange={() => {}} disableStructure={false} />
    );

    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("2nd")).toBeInTheDocument();
    expect(screen.getByText("Rest")).toBeInTheDocument();
  });

  it("clicking a pattern slot cycles to next type", () => {
    const onChange = vi.fn();
    render(
      <Settings values={defaultValues} onChange={onChange} disableStructure={false} />
    );

    // Click the "Root" slot — should cycle to "1st"
    fireEvent.click(screen.getByText("Root"));

    expect(onChange).toHaveBeenCalledWith({
      ...defaultValues,
      beatPattern: ["1st", "1st", "2nd", "rest"],
    });
  });

  it("+ button adds a rest beat", () => {
    const onChange = vi.fn();
    render(
      <Settings values={defaultValues} onChange={onChange} disableStructure={false} />
    );

    fireEvent.click(screen.getByTitle("Add beat"));

    expect(onChange).toHaveBeenCalledWith({
      ...defaultValues,
      beatPattern: ["root", "1st", "2nd", "rest", "rest"],
    });
  });

  it("- button removes last beat", () => {
    const onChange = vi.fn();
    render(
      <Settings values={defaultValues} onChange={onChange} disableStructure={false} />
    );

    fireEvent.click(screen.getByTitle("Remove beat"));

    expect(onChange).toHaveBeenCalledWith({
      ...defaultValues,
      beatPattern: ["root", "1st", "2nd"],
    });
  });

  it("disableStructure disables pattern slots and measures/chord but not bpm", () => {
    render(
      <Settings values={defaultValues} onChange={() => {}} disableStructure={true} />
    );

    expect(screen.getByLabelText("BPM")).not.toBeDisabled();
    expect(screen.getByLabelText("Measures / Pattern")).toBeDisabled();

    // Pattern slots should be disabled
    const rootSlot = screen.getByText("Root");
    expect(rootSlot).toBeDisabled();
  });

  it("all controls enabled when disableStructure is false", () => {
    render(
      <Settings values={defaultValues} onChange={() => {}} disableStructure={false} />
    );

    expect(screen.getByLabelText("BPM")).not.toBeDisabled();
    expect(screen.getByLabelText("Measures / Pattern")).not.toBeDisabled();

    const rootSlot = screen.getByText("Root");
    expect(rootSlot).not.toBeDisabled();
  });

  it("+ button is disabled at max 8 beats", () => {
    const maxValues: SettingsValues = {
      ...defaultValues,
      beatPattern: ["root", "1st", "2nd", "rest", "rest", "rest", "rest", "rest"],
    };
    render(
      <Settings values={maxValues} onChange={() => {}} disableStructure={false} />
    );

    expect(screen.getByTitle("Add beat")).toBeDisabled();
  });

  it("- button is disabled at min 1 beat", () => {
    const minValues: SettingsValues = {
      ...defaultValues,
      beatPattern: ["root"],
    };
    render(
      <Settings values={minValues} onChange={() => {}} disableStructure={false} />
    );

    expect(screen.getByTitle("Remove beat")).toBeDisabled();
  });
});
