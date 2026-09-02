import { describe, expect, it } from "vitest";
import {
    getMechanicalLoadHeight,
    getMechanicalSpringDisplacement,
    getMechanicalSpringPath,
    getMechanicalSpringWraps,
} from "./2-0-mechanical-spring-svg";

describe("mechanical spring", () => {
    it("tightens from two broad wraps to eighteen dense wraps", () => {
        expect(getMechanicalSpringWraps(30)).toBe(2);
        expect(getMechanicalSpringWraps(215)).toBe(10);
        expect(getMechanicalSpringWraps(400)).toBe(18);
    });

    it("clamps tension to the reference visual range", () => {
        expect(getMechanicalSpringWraps(1)).toBe(2);
        expect(getMechanicalSpringWraps(500)).toBe(18);
    });

    it("changes the rendered coil path with tension", () => {
        expect(getMechanicalSpringPath(30)).not.toBe(getMechanicalSpringPath(400));
    });

    it("keeps extreme responses inside the mechanical stage", () => {
        expect(getMechanicalSpringDisplacement(8.563)).toBe(-150);
        expect(getMechanicalSpringDisplacement(-8.563)).toBe(145);
    });

    it("preserves displacement throughout the normal response range", () => {
        expect(getMechanicalSpringDisplacement(0)).toBe(105);
        expect(getMechanicalSpringDisplacement(1)).toBe(0);
        expect(getMechanicalSpringDisplacement(2)).toBe(-105);
    });
});

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
