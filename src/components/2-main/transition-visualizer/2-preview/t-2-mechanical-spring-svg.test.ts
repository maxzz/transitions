import { describe, expect, it } from "vitest";
import {
    getLoad_Height,
    getLoad_MarkerRadius,
    getLoad_Width,
    getSpringDisplacement,
    getSpringSvgPath,
    getSpringWraps,
} from "./2-0-mechanical-spring-svg";

describe("mechanical spring", () => {
    it("tightens from two broad wraps to eighteen dense wraps", () => {
        expect(getSpringWraps(30)).toBe(2);
        expect(getSpringWraps(215)).toBe(10);
        expect(getSpringWraps(400)).toBe(18);
    });

    it("clamps tension to the reference visual range", () => {
        expect(getSpringWraps(1)).toBe(2);
        expect(getSpringWraps(500)).toBe(18);
    });

    it("changes the rendered coil path with tension", () => {
        expect(getSpringSvgPath(30)).not.toBe(getSpringSvgPath(400));
    });

    it("keeps extreme responses inside the mechanical stage", () => {
        expect(getSpringDisplacement(8.563)).toBe(-150);
        expect(getSpringDisplacement(-8.563)).toBe(145);
    });

    it("preserves displacement throughout the normal response range", () => {
        expect(getSpringDisplacement(0)).toBe(105);
        expect(getSpringDisplacement(1)).toBe(0);
        expect(getSpringDisplacement(2)).toBe(-105);
    });
});

describe("mechanical load size", () => {
    it("scales height linearly from the minimum size to the maximum size", () => {
        expect(getLoad_Height(0.1)).toBe(120);
        expect(getLoad_Height(10.05)).toBeCloseTo(185);
        expect(getLoad_Height(20)).toBe(250);
    });

    it("scales width linearly from the minimum size to the maximum size", () => {
        expect(getLoad_Width(0.1)).toBe(50);
        expect(getLoad_Width(10.05)).toBeCloseTo(95);
        expect(getLoad_Width(20)).toBe(140);
    });

    it("keeps the load taller than it is wide", () => {
        expect(getLoad_Height(0.1)).toBeGreaterThan(getLoad_Width(0.1));
        expect(getLoad_Height(10.05)).toBeGreaterThan(getLoad_Width(10.05));
        expect(getLoad_Height(20)).toBeGreaterThan(getLoad_Width(20));
        expect(getLoad_Height()).toBeGreaterThan(getLoad_Width());
    });

    it("scales the inner marker linearly with mass", () => {
        expect(getLoad_MarkerRadius(0.1)).toBe(10);
        expect(getLoad_MarkerRadius(10.05)).toBeCloseTo(23);
        expect(getLoad_MarkerRadius(20)).toBe(36);
    });

    it("increases monotonically with spring mass", () => {
        expect(getLoad_Height(0.1)).toBeLessThan(getLoad_Height(1));
        expect(getLoad_Height(1)).toBeLessThan(getLoad_Height(5));
        expect(getLoad_Height(5)).toBeLessThan(getLoad_Height(20));
        expect(getLoad_Width(0.1)).toBeLessThan(getLoad_Width(1));
        expect(getLoad_Width(20)).toBeGreaterThan(getLoad_Width(5));
        expect(getLoad_MarkerRadius(0.1)).toBeLessThan(getLoad_MarkerRadius(20));
    });

    it("clamps mass to the supported visual range", () => {
        expect(getLoad_Height(0)).toBe(getLoad_Height(0.1));
        expect(getLoad_Height(100)).toBe(getLoad_Height(20));
        expect(getLoad_Width(0)).toBe(getLoad_Width(0.1));
        expect(getLoad_Width(100)).toBe(getLoad_Width(20));
        expect(getLoad_MarkerRadius(0)).toBe(getLoad_MarkerRadius(0.1));
        expect(getLoad_MarkerRadius(100)).toBe(getLoad_MarkerRadius(20));
    });

    it("uses the original load size when mass is unavailable", () => {
        expect(getLoad_Height()).toBe(190);
        expect(getLoad_Width()).toBe(100);
        expect(getLoad_MarkerRadius()).toBe(17);
    });
});
