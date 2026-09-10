import { describe, expect, it } from "vitest";
import { buildCumulativeDelays, characterDelayMs, lengthAtProgress } from "./3-typewriter";

describe("characterDelayMs", () => {
    it("pauses longer after a sentence than after a letter", () => {
        expect(characterDelayMs(".", 0)).toBeGreaterThan(characterDelayMs("a", 0));
        expect(characterDelayMs(",", 0)).toBeGreaterThan(characterDelayMs("a", 0));
        expect(characterDelayMs("\n", 0)).toBeGreaterThan(characterDelayMs(".", 0));
    });

    it("is deterministic for the same character and index", () => {
        expect(characterDelayMs("e", 4)).toBe(characterDelayMs("e", 4));
    });
});

describe("lengthAtProgress", () => {
    const text = "Hi.";
    const cumulative = buildCumulativeDelays(text);
    const totalMs = cumulative.at(-1)!;

    it("starts empty and finishes with the full string", () => {
        expect(lengthAtProgress(0, cumulative, totalMs)).toBe(0);
        expect(lengthAtProgress(1, cumulative, totalMs)).toBe(text.length);
    });

    it("reveals characters as elapsed time crosses each delay", () => {
        expect(lengthAtProgress((cumulative[0]! - 0.01) / totalMs, cumulative, totalMs)).toBe(0);
        expect(lengthAtProgress(cumulative[0]! / totalMs, cumulative, totalMs)).toBe(1);
        expect(lengthAtProgress(cumulative[1]! / totalMs, cumulative, totalMs)).toBe(2);
    });
});
