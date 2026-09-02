import { describe, expect, it } from "vitest";
import {
    buildGraphPlot,
    formatTimeTick,
    getGraphSize,
    getTimeAxis,
    getValueAxis,
    monotoneCurvePath,
    niceStep,
    ticksBetween,
} from "./5-graph-plot";

describe("graph axes", () => {
    it("picks nice steps that respect the tick budget", () => {
        expect(niceStep(1000, 5)).toBe(200);
        expect(niceStep(500, 5)).toBe(100);
        expect(niceStep(1.2, 5)).toBe(0.25);
        expect(niceStep(2.4, 6)).toBe(0.5);
    });

    it("generates ticks inside the domain without floating point drift", () => {
        expect(ticksBetween(-0.16, 1.16, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1]);
        expect(ticksBetween(0, 600, 200)).toEqual([0, 200, 400, 600]);
    });

    it("rounds the time axis up to the next tick boundary", () => {
        expect(getTimeAxis(491, 5)).toEqual({ max: 500, step: 100, ticks: [0, 100, 200, 300, 400, 500] });
        expect(getTimeAxis(508, 5)).toEqual({ max: 600, step: 200, ticks: [0, 200, 400, 600] });
        expect(getTimeAxis(1234, 5)).toEqual({ max: 1250, step: 250, ticks: [0, 250, 500, 750, 1000, 1250] });
        expect(getTimeAxis(0, 5).max).toBeGreaterThan(0);
    });

    it("always includes the start and target with breathing room on the value axis", () => {
        const axis = getValueAxis({ durationMs: 0, minValue: 0, maxValue: 1.3 }, 5);

        expect(axis.min).toBeLessThan(0);
        expect(axis.max).toBeGreaterThan(1.3);
        expect(axis.ticks).toContain(0);
        expect(axis.ticks).toContain(1);
    });

    it("formats time ticks in one unit with the unit on the last label", () => {
        expect(formatTimeTick(200, 600, 200, false)).toBe("200");
        expect(formatTimeTick(600, 600, 200, true)).toBe("600 ms");
        expect(formatTimeTick(500, 1500, 500, false)).toBe("0.5");
        expect(formatTimeTick(1500, 1500, 500, true)).toBe("1.5 s");
        expect(formatTimeTick(2000, 2000, 1000, true)).toBe("2 s");
    });
});

describe("graph sizing", () => {
    it("fills the width and caps the height near a square", () => {
        expect(getGraphSize(400, 800)).toEqual({ width: 400, height: 360 });
        expect(getGraphSize(1000, 500)).toEqual({ width: 1000, height: 500 });
        expect(getGraphSize(undefined, 500)).toBeNull();
        expect(getGraphSize(400, 10)).toBeNull();
    });
});

describe("monotone curve", () => {
    it("passes through every sample and never overshoots between them", () => {
        const points = [
            { x: 0, y: 100 },
            { x: 10, y: 80 },
            { x: 20, y: 30 },
            { x: 30, y: 28 },
            { x: 40, y: 28 },
        ];
        const path = monotoneCurvePath(points);
        const segments = path.split(" C ");

        expect(segments).toHaveLength(points.length);
        expect(segments[0]).toBe("M 0.0 100.0");

        for (let index = 1; index < segments.length; index += 1) {
            const [, c1y, , c2y, x, y] = segments[index].split(" ").map(Number);
            const from = points[index - 1];
            const to = points[index];
            const low = Math.min(from.y, to.y) - 1e-6;
            const high = Math.max(from.y, to.y) + 1e-6;

            expect(x).toBeCloseTo(to.x, 1);
            expect(y).toBeCloseTo(to.y, 1);
            expect(c1y).toBeGreaterThanOrEqual(low);
            expect(c1y).toBeLessThanOrEqual(high);
            expect(c2y).toBeGreaterThanOrEqual(low);
            expect(c2y).toBeLessThanOrEqual(high);
        }
    });

    it("degrades to a straight line for two points", () => {
        expect(monotoneCurvePath([{ x: 0, y: 0 }, { x: 10, y: 5 }])).toBe("M 0.0 0.0 L 10.0 5.0");
        expect(monotoneCurvePath([])).toBe("");
    });
});

describe("graph plot", () => {
    it("maps samples into the plot area and closes the area on the zero line", () => {
        const plot = buildGraphPlot(
            {
                samples: [
                    { elapsedMs: 0, value: 0 },
                    { elapsedMs: 250, value: 1.2 },
                    { elapsedMs: 500, value: 1 },
                ],
                bounds: { durationMs: 500, minValue: 0, maxValue: 1.2 },
                durationMs: 500,
            },
            { width: 400, height: 360 },
        );

        expect(plot.hasCurve).toBe(true);
        expect(plot.points[0].x).toBe(plot.left);
        expect(plot.points[0].y).toBeCloseTo(plot.zeroY, 6);
        expect(plot.points.at(-1)!.y).toBeCloseTo(plot.targetY, 6);
        expect(plot.targetY).toBeLessThan(plot.zeroY);
        expect(plot.xTicks[0]).toEqual({ position: plot.left, label: "0" });
        expect(plot.xTicks.at(-1)!.position).toBeCloseTo(plot.right, 6);
        expect(plot.xTicks.at(-1)!.label).toMatch(/^\d+ ms$/);
        expect(plot.areaPath.endsWith("Z")).toBe(true);
        expect(plot.showPoints).toBe(true);
    });

    it("hides individual points when samples are too dense to read", () => {
        const samples = Array.from({ length: 600 }, (_, index) => ({ elapsedMs: index * 5, value: index / 600 }));
        const plot = buildGraphPlot(
            { samples, bounds: { durationMs: 3000, minValue: 0, maxValue: 1 }, durationMs: 3000 },
            { width: 400, height: 360 },
        );

        expect(plot.showPoints).toBe(false);
        expect(plot.points).toHaveLength(600);
    });
});
