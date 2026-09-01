import { describe, expect, it } from "vitest";
import { getMechanicalLoadHeight } from "./mechanical-spring";

describe("mechanical load height", () => {
    it("increases monotonically with spring mass", () => {
        expect(getMechanicalLoadHeight(0.1)).toBeLessThan(getMechanicalLoadHeight(1));
        expect(getMechanicalLoadHeight(1)).toBeLessThan(getMechanicalLoadHeight(5));
        expect(getMechanicalLoadHeight(5)).toBeLessThan(getMechanicalLoadHeight(20));
    });

    it("clamps mass to the supported visual range", () => {
        expect(getMechanicalLoadHeight(0)).toBe(getMechanicalLoadHeight(0.1));
        expect(getMechanicalLoadHeight(100)).toBe(getMechanicalLoadHeight(20));
    });

    it("uses the original load height when mass is unavailable", () => {
        expect(getMechanicalLoadHeight()).toBe(150);
    });
});
