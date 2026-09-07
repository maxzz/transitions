import { describe, expect, it, vi } from "vitest";

vi.mock("@/store/1-ui-settings", () => ({
    appSettings: {
        autoRecordResponse: true,
        reactSpringParams: { mass: 1, tension: 170, friction: 26, precision: 0.01, velocity: 0, clamp: false },
        motionParams: {},
        gsapParams: {},
    },
}));

import {
    getLoadGeometry,
    getSpringDisplacement,
    getSpringSvgLayers,
    getSpringSvgPath,
    getSpringWraps,
} from "./3-1-spring-svg-math";

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

    it("joins straight coil spans with curved turnarounds", () => {
        const path = getSpringSvgPath(170);
        const wraps = getSpringWraps(170);

        expect(path.match(/C /g)?.length).toBe(wraps * 2 + 1);
        expect(path.match(/L /g)?.length).toBe(wraps * 2 + 4);
    });

    it("uses the same turn radius on the first, middle, and last coils", () => {
        for (const tension of [30, 170, 400]) {
            const spans = getCoilTurnHandleSpans(getSpringSvgPath(tension));

            expect(spans[0]).toBeCloseTo(spans[1], 2);
            expect(spans[0]).toBeCloseTo(spans[spans.length - 1], 2);
        }
    });

    it("shrinks the turn radius as the coil count rises", () => {
        const twoWraps = getCoilTurnHandleSpans(getSpringSvgPath(30))[0];
        const tenWraps = getCoilTurnHandleSpans(getSpringSvgPath(215))[0];
        const eighteenWraps = getCoilTurnHandleSpans(getSpringSvgPath(400))[0];

        expect(twoWraps).toBeGreaterThan(tenWraps * 1.5);
        expect(tenWraps).toBeGreaterThan(eighteenWraps);
        expect(twoWraps / eighteenWraps).toBeCloseTo(18 / 2, 0);
    });

    it("shades far coil spans separately from near spans", () => {
        const layers = getSpringSvgLayers(30);

        expect(layers.far).toContain("C ");
        expect(layers.near).toContain("C ");
        expect(layers.far).not.toBe(layers.near);
        expect(layers.far.match(/C /g)?.length).toBe(5);
        expect(layers.near.match(/C /g)?.length).toBe(5);
    });

    it("starts and ends the coil on the same side so the stack stays centered", () => {
        const path = getSpringSvgPath(400);
        const curves = getCoilCurves(path);
        const firstControlX = curves[0].c1x;
        const lastControlX = curves[curves.length - 1].c1x;

        expect(firstControlX).toBeGreaterThan(350);
        expect(lastControlX).toBeGreaterThan(350);
        expect(firstControlX).toBeCloseTo(lastControlX, 5);
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
        expect(getLoadGeometry(0.1).loadHeight).toBe(120);
        expect(getLoadGeometry(10.05).loadHeight).toBeCloseTo(185);
        expect(getLoadGeometry(20).loadHeight).toBe(250);
    });

    it("scales width linearly from the minimum size to the maximum size", () => {
        expect(getLoadGeometry(0.1).loadWidth).toBe(100);
        expect(getLoadGeometry(10.05).loadWidth).toBeCloseTo(170);
        expect(getLoadGeometry(20).loadWidth).toBe(240);
    });

    it("keeps the load taller than it is wide", () => {
        expect(getLoadGeometry(0.1).loadHeight).toBeGreaterThan(getLoadGeometry(0.1).loadWidth);
        expect(getLoadGeometry(10.05).loadHeight).toBeGreaterThan(getLoadGeometry(10.05).loadWidth);
        expect(getLoadGeometry(20).loadHeight).toBeGreaterThan(getLoadGeometry(20).loadWidth);
        expect(getLoadGeometry().loadHeight).toBeGreaterThan(getLoadGeometry().loadWidth);
    });

    it("increases monotonically with spring mass", () => {
        expect(getLoadGeometry(0.1).loadHeight).toBeLessThan(getLoadGeometry(1).loadHeight);
        expect(getLoadGeometry(1).loadHeight).toBeLessThan(getLoadGeometry(5).loadHeight);
        expect(getLoadGeometry(5).loadHeight).toBeLessThan(getLoadGeometry(20).loadHeight);
        expect(getLoadGeometry(0.1).loadWidth).toBeLessThan(getLoadGeometry(1).loadWidth);
        expect(getLoadGeometry(20).loadWidth).toBeGreaterThan(getLoadGeometry(5).loadWidth);
    });

    it("clamps mass to the supported visual range", () => {
        expect(getLoadGeometry(0).loadHeight).toBe(getLoadGeometry(0.1).loadHeight);
        expect(getLoadGeometry(100).loadHeight).toBe(getLoadGeometry(20).loadHeight);
        expect(getLoadGeometry(0).loadWidth).toBe(getLoadGeometry(0.1).loadWidth);
        expect(getLoadGeometry(100).loadWidth).toBe(getLoadGeometry(20).loadWidth);
    });

    it("uses the original load size when mass is unavailable", () => {
        expect(getLoadGeometry().loadHeight).toBe(170);
        expect(getLoadGeometry().loadWidth).toBe(120);
    });
});

function getCoilCurves(path: string) {
    return [...path.matchAll(/L ([-\d.]+) ([-\d.]+) C ([-\d.]+) ([-\d.]+), ([-\d.]+) ([-\d.]+), ([-\d.]+) ([-\d.]+)/g)].map((match) => ({
        startX: Number(match[1]),
        startY: Number(match[2]),
        c1x: Number(match[3]),
        c1y: Number(match[4]),
        c2x: Number(match[5]),
        c2y: Number(match[6]),
        endX: Number(match[7]),
        endY: Number(match[8]),
    }));
}

function getCoilTurnHandleSpans(path: string) {
    return getCoilCurves(path).map((curve) => Math.hypot(curve.c1x - curve.startX, curve.c1y - curve.startY));
}
