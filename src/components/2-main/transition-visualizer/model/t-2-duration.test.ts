import { describe, expect, it } from "vitest";
import { gsapDefaults, motionDefaults, springDefaults } from "./1-definitions";
import { estimateDurationMs, formatDuration, resolveExpectedDurationMs } from "./2-duration";

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
});

describe("resolveExpectedDurationMs", () => {
    const wobbly = { ...springDefaults, mass: 15.8, tension: 333, friction: 9, precision: 0.0032 };

    it("reuses the measured duration for the same settings", () => {
        expect(resolveExpectedDurationMs("spring", wobbly, 9750, 9750)).toBe(9750);
    });

    it("grows from the last engine duration instead of a longer simulation", () => {
        const simulated = estimateDurationMs("spring", wobbly);
        const resolved = resolveExpectedDurationMs("spring", wobbly, 0, 800);
        expect(resolved).toBe(800);
        expect(simulated).toBeGreaterThan(800);
    });

    it("uses GSAP duration even when a previous measurement exists", () => {
        expect(resolveExpectedDurationMs("gsap", { ...gsapDefaults, duration: 1.2 }, 4000)).toBe(1200);
    });
});

describe("formatDuration", () => {
    it("formats milliseconds and seconds", () => {
        expect(formatDuration(320)).toBe("320 ms");
        expect(formatDuration(9750)).toBe("9.75 s");
    });
});
