import { describe, expect, it } from "vitest";
import { formatGsapEase } from "../engines/3-gsap";
import { gsapDefaults } from "./1-definitions";
import { decimateSamples, getSampleBounds, interpolateSampleValue, sanitizeSamples } from "./3-samples";

describe("transition samples", () => {
    it("sanitizes invalid and out-of-order samples", () => {
        expect(sanitizeSamples([
            { elapsedMs: 10, value: 0.1 },
            { elapsedMs: 5, value: 0.2 },
            { elapsedMs: 20, value: Number.NaN },
            { elapsedMs: 30, value: 1 },
        ])).toEqual([
            { elapsedMs: 0, value: 0.1 },
            { elapsedMs: 10, value: 0.1 },
            { elapsedMs: 30, value: 1 },
        ]);
    });

    it("retains endpoints and extrema when reducing points", () => {
        const samples = Array.from({ length: 1000 }, (_, index) => ({
            elapsedMs: index,
            value: index === 420 ? 1.8 : Math.sin(index / 50),
        }));
        const reduced = decimateSamples(samples, 100);

        expect(reduced.length).toBeLessThanOrEqual(102);
        expect(reduced[0]).toEqual(samples[0]);
        expect(reduced.at(-1)).toEqual(samples.at(-1));
        expect(Math.max(...reduced.map(({ value }) => value))).toBe(1.8);
    });

    it("interpolates the recorded value at an elapsed time", () => {
        const samples = [
            { elapsedMs: 0, value: 0 },
            { elapsedMs: 100, value: 1 },
            { elapsedMs: 200, value: 0.5 },
        ];

        expect(interpolateSampleValue([], 50)).toBeUndefined();
        expect(interpolateSampleValue(samples, -10)).toBe(0);
        expect(interpolateSampleValue(samples, 50)).toBeCloseTo(0.5);
        expect(interpolateSampleValue(samples, 150)).toBeCloseTo(0.75);
        expect(interpolateSampleValue(samples, 400)).toBe(0.5);
    });

    it("always includes the normalized start and target in graph bounds", () => {
        expect(getSampleBounds([{ elapsedMs: 0, value: 0.4 }])).toEqual({
            durationMs: 0,
            minValue: 0,
            maxValue: 1,
        });
    });
});

describe("GSAP ease formatting", () => {
    it("builds configurable native ease strings", () => {
        expect(formatGsapEase(gsapDefaults)).toBe("elastic.out(1,0.3)");
        expect(formatGsapEase({ ...gsapDefaults, ease: "back", direction: "inOut" }))
            .toBe("back.inOut(1.7)");
        expect(formatGsapEase({ ...gsapDefaults, ease: "steps", steps: 7.6 }))
            .toBe("steps(8)");
    });
});
