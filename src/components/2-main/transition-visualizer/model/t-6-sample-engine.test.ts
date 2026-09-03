import { describe, expect, it } from "vitest";
import { gsapDefaults, motionDefaults, springDefaults } from "./1-definitions";
import { estimateDurationMs } from "./2-duration";
import { SAMPLE_STEP_MS, buildRecordedResult, sampleEngine } from "./6-sample-engine";

describe("sampleEngine", () => {
    it("starts at 0 and ends near the target for each engine", () => {
        const spring = sampleEngine("spring", springDefaults);
        const motion = sampleEngine("motion", motionDefaults);
        const gsap = sampleEngine("gsap", gsapDefaults);

        expect(spring[0]).toEqual({ elapsedMs: 0, value: 0 });
        expect(motion[0]).toEqual({ elapsedMs: 0, value: 0 });
        expect(gsap[0]).toEqual({ elapsedMs: 0, value: 0 });

        expect(spring.at(-1)!.value).toBeCloseTo(1, 1);
        expect(motion.at(-1)!.value).toBeCloseTo(1, 1);
        expect(gsap.at(-1)!.value).toBe(1);
    });

    it("covers the GSAP duration exactly", () => {
        const samples = sampleEngine("gsap", { ...gsapDefaults, duration: 0.8, ease: "none" });
        expect(samples.at(-1)!.elapsedMs).toBe(800);
        expect(samples.at(-1)!.value).toBe(1);
        expect(samples[Math.floor(samples.length / 2)].value).toBeCloseTo(0.5, 1);
    });

    it("settles a React Spring run near the estimated rest time", () => {
        const samples = sampleEngine("spring", springDefaults);
        const estimated = estimateDurationMs("spring", springDefaults);
        expect(samples.at(-1)!.elapsedMs).toBe(estimated);
        expect(samples.length).toBeGreaterThan(8);
        expect(samples[1]!.elapsedMs).toBeGreaterThanOrEqual(SAMPLE_STEP_MS);
    });

    it("includes Motion overshoot for a bouncy spring", () => {
        const samples = sampleEngine("motion", { ...motionDefaults, stiffness: 300, damping: 12 });
        const maxValue = Math.max(...samples.map(({ value }) => value));
        expect(maxValue).toBeGreaterThan(1);
        expect(samples.at(-1)!.value).toBeCloseTo(1, 1);
    });
});

describe("buildRecordedResult", () => {
    it("stores the plot duration from the parameters", () => {
        const result = buildRecordedResult("gsap", { ...gsapDefaults, duration: 1.2, ease: "none" });
        expect(result.engineId).toBe("gsap");
        expect(result.durationMs).toBe(1200);
        expect(result.plotDurationMs).toBe(1200);
        expect(result.samples[0]).toEqual({ elapsedMs: 0, value: 0 });
        expect(result.samples.at(-1)).toEqual({ elapsedMs: 1200, value: 1 });
    });
});
