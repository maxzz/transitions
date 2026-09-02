import { describe, expect, it } from "vitest";
import {
    getMechanicalLoadHeight,
    getMechanicalLoadMarkerRadius,
    getMechanicalLoadWidth,
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
        expect(getMechanicalLoadHeight(0.1)).toBe(120);
        expect(getMechanicalLoadHeight(10.05)).toBeCloseTo(185);
        expect(getMechanicalLoadHeight(20)).toBe(250);
    });

    it("scales width linearly from the minimum size to the maximum size", () => {
        expect(getMechanicalLoadWidth(0.1)).toBe(50);
        expect(getMechanicalLoadWidth(10.05)).toBeCloseTo(95);
        expect(getMechanicalLoadWidth(20)).toBe(140);
    });

    it("keeps the load taller than it is wide", () => {
        expect(getMechanicalLoadHeight(0.1)).toBeGreaterThan(getMechanicalLoadWidth(0.1));
        expect(getMechanicalLoadHeight(10.05)).toBeGreaterThan(getMechanicalLoadWidth(10.05));
        expect(getMechanicalLoadHeight(20)).toBeGreaterThan(getMechanicalLoadWidth(20));
        expect(getMechanicalLoadHeight()).toBeGreaterThan(getMechanicalLoadWidth());
    });

    it("scales the inner marker linearly with mass", () => {
        expect(getMechanicalLoadMarkerRadius(0.1)).toBe(10);
        expect(getMechanicalLoadMarkerRadius(10.05)).toBeCloseTo(23);
        expect(getMechanicalLoadMarkerRadius(20)).toBe(36);
    });

    it("increases monotonically with spring mass", () => {
        expect(getMechanicalLoadHeight(0.1)).toBeLessThan(getMechanicalLoadHeight(1));
        expect(getMechanicalLoadHeight(1)).toBeLessThan(getMechanicalLoadHeight(5));
        expect(getMechanicalLoadHeight(5)).toBeLessThan(getMechanicalLoadHeight(20));
        expect(getMechanicalLoadWidth(0.1)).toBeLessThan(getMechanicalLoadWidth(1));
        expect(getMechanicalLoadWidth(20)).toBeGreaterThan(getMechanicalLoadWidth(5));
        expect(getMechanicalLoadMarkerRadius(0.1)).toBeLessThan(getMechanicalLoadMarkerRadius(20));
    });

    it("clamps mass to the supported visual range", () => {
        expect(getMechanicalLoadHeight(0)).toBe(getMechanicalLoadHeight(0.1));
        expect(getMechanicalLoadHeight(100)).toBe(getMechanicalLoadHeight(20));
        expect(getMechanicalLoadWidth(0)).toBe(getMechanicalLoadWidth(0.1));
        expect(getMechanicalLoadWidth(100)).toBe(getMechanicalLoadWidth(20));
        expect(getMechanicalLoadMarkerRadius(0)).toBe(getMechanicalLoadMarkerRadius(0.1));
        expect(getMechanicalLoadMarkerRadius(100)).toBe(getMechanicalLoadMarkerRadius(20));
    });

    it("uses the original load size when mass is unavailable", () => {
        expect(getMechanicalLoadHeight()).toBe(190);
        expect(getMechanicalLoadWidth()).toBe(100);
        expect(getMechanicalLoadMarkerRadius()).toBe(17);
    });
});
