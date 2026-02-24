import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AudioContext before importing the module
const mockOscillator = {
  connect: vi.fn(),
  type: "",
  frequency: { value: 0 },
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};

const mockAudioContext = {
  currentTime: 0,
  state: "running" as string,
  destination: {},
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({
    ...mockGain,
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  })),
  resume: vi.fn(),
};

vi.stubGlobal(
  "AudioContext",
  vi.fn(() => mockAudioContext)
);

describe("audio", () => {
  beforeEach(async () => {
    vi.resetModules();
    mockAudioContext.state = "running";
    mockAudioContext.createOscillator.mockClear();
    mockAudioContext.createGain.mockClear();
    mockAudioContext.resume.mockClear();
  });

  it("playClick with accent uses 1000 Hz and gain 0.3", async () => {
    const { playClick } = await import("./audio");
    playClick(true);

    const osc = mockAudioContext.createOscillator.mock.results[0].value;
    const gain = mockAudioContext.createGain.mock.results[0].value;

    expect(osc.frequency.value).toBe(1000);
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 0);
  });

  it("playClick without accent uses 800 Hz and gain 0.15", async () => {
    const { playClick } = await import("./audio");
    playClick(false);

    const osc = mockAudioContext.createOscillator.mock.results[0].value;
    const gain = mockAudioContext.createGain.mock.results[0].value;

    expect(osc.frequency.value).toBe(800);
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0.15, 0);
  });

  it("playClick connects oscillator → gain → destination", async () => {
    const { playClick } = await import("./audio");
    playClick(true);

    const osc = mockAudioContext.createOscillator.mock.results[0].value;
    const gain = mockAudioContext.createGain.mock.results[0].value;

    expect(osc.connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
  });

  it("resumeAudioContext calls resume when suspended", async () => {
    mockAudioContext.state = "suspended";
    const { resumeAudioContext } = await import("./audio");
    resumeAudioContext();

    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it("resumeAudioContext does not call resume when running", async () => {
    mockAudioContext.state = "running";
    const { resumeAudioContext } = await import("./audio");
    resumeAudioContext();

    expect(mockAudioContext.resume).not.toHaveBeenCalled();
  });
});
