import { describe, expect, it } from "vitest";
import { gsapDefaults, motionDefaults, springDefaults } from "./1-definitions";
import {
    MAX_DURATION_MS,
    SETTLE_HEADROOM_MS,
    estimateDurationMs,
    formatDuration,
    getPlotDurationMs,
    motionSpringDurationMs,
    reactSpringDurationMs,
} from "./2-duration";

describe("estimateDurationMs", () => {
    it("uses the GSAP duration parameter", () => {
        expect(estimateDurationMs("gsap", { ...gsapDefaults, duration: 1.2 })).toBe(1200);
    });

    it("returns a finite spring duration for default React Spring params", () => {
        const durationMs = estimateDurationMs("spring", springDefaults);
        expect(durationMs).toBeGreaterThan(100);
        expect(durationMs).toBeLessThan(4000);
    });

    it("returns a longer duration for a weakly damped heavy spring", () => {
        const snappy = estimateDurationMs("spring", springDefaults);
        const wobbly = estimateDurationMs("spring", {
            ...springDefaults,
            mass: 15.8,
            tension: 333,
            friction: 9,
            precision: 0.0032,
        });
        expect(wobbly).toBeGreaterThan(snappy);
        expect(wobbly).toBeGreaterThan(2000);
    });

    it("returns a finite duration for Motion springs", () => {
        const durationMs = estimateDurationMs("motion", motionDefaults);
        expect(durationMs).toBeGreaterThan(100);
        expect(durationMs).toBeLessThan(8000);
    });

    it("is deterministic for the same parameters", () => {
        expect(estimateDurationMs("spring", springDefaults)).toBe(estimateDurationMs("spring", springDefaults));
        expect(estimateDurationMs("motion", motionDefaults)).toBe(estimateDurationMs("motion", motionDefaults));
    });
});

describe("reactSpringDurationMs", () => {
    it("integrates in whole milliseconds and rests at the react-spring thresholds", () => {
        const durationMs = reactSpringDurationMs(springDefaults);
        expect(Number.isInteger(durationMs)).toBe(true);
        expect(durationMs).toBeGreaterThan(300);
        expect(durationMs).toBeLessThan(800);
    });

    it("settles sooner with a looser precision", () => {
        expect(reactSpringDurationMs({ ...springDefaults, precision: 0.1 }))
            .toBeLessThan(reactSpringDurationMs({ ...springDefaults, precision: 0.001 }));
    });

    it("stops at the target when clamped", () => {
        const wobbly = { ...springDefaults, tension: 180, friction: 12 };
        expect(reactSpringDurationMs({ ...wobbly, clamp: true })).toBeLessThan(reactSpringDurationMs(wobbly));
    });

    it("never exceeds the maximum duration", () => {
        expect(reactSpringDurationMs({ ...springDefaults, friction: 0.001, precision: 0.001 })).toBeLessThanOrEqual(MAX_DURATION_MS);
    });
});

describe("motionSpringDurationMs", () => {
    it("matches Motion's own 50 ms duration grid", () => {
        const durationMs = motionSpringDurationMs(motionDefaults);
        expect(durationMs % 50).toBe(0);
        expect(durationMs).toBeGreaterThan(0);
    });
});

describe("getPlotDurationMs", () => {
    it("keeps the exact GSAP duration", () => {
        expect(getPlotDurationMs("gsap", { ...gsapDefaults, duration: 1.2 })).toBe(1200);
    });

    it("adds one frame of settle headroom for physics engines", () => {
        expect(getPlotDurationMs("spring", springDefaults)).toBe(estimateDurationMs("spring", springDefaults) + SETTLE_HEADROOM_MS);
        expect(getPlotDurationMs("motion", motionDefaults)).toBe(estimateDurationMs("motion", motionDefaults) + SETTLE_HEADROOM_MS);
    });
});

describe("formatDuration", () => {
    it("formats milliseconds and seconds", () => {
        expect(formatDuration(320)).toBe("320 ms");
        expect(formatDuration(9750)).toBe("9.75 s");
    });
});
