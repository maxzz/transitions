import { describe, expect, it } from "vitest";
import { formatTranslateProgress, getTranslateOffsetPercent } from "./2-1-1-translate-preview";
import { formatScaleProgress, getScaleFactor } from "./2-1-2--scale-preview";
import { formatRotateProgress, getRotationDegrees } from "./2-1-3-rotate-preview";
import { formatOpacityProgress, getLegendMarkerTopPercent } from "./2-1-4-opacity-preview";
import { getPreviewValue, previewMotion, resetPreviewValue, setPreviewValue } from "../state/preview-motion";

describe("translate preview", () => {
    it("moves the pill by exactly one frame height between start and target", () => {
        expect(getTranslateOffsetPercent(0)).toBeCloseTo(0);
        expect(getTranslateOffsetPercent(1)).toBeCloseTo(-100 / 0.6);
    });

    it("keeps following the engine through overshoot", () => {
        expect(getTranslateOffsetPercent(1.5)).toBeCloseTo(-250);
        expect(getTranslateOffsetPercent(-0.2)).toBeCloseTo(100 / 3);
    });

    it("formats progress with two decimals", () => {
        expect(formatTranslateProgress(0.98765)).toBe("0.99");
    });
});

describe("scale preview", () => {
    it("grows from half size to full size", () => {
        expect(getScaleFactor(0)).toBe(0.5);
        expect(getScaleFactor(1)).toBe(1);
        expect(getScaleFactor(2.74)).toBeCloseTo(1.87);
    });

    it("formats progress with two decimals", () => {
        expect(formatScaleProgress(1.234)).toBe("1.23");
    });
});

describe("rotate preview", () => {
    it("turns a quarter turn counter-clockwise", () => {
        expect(getRotationDegrees(0)).toBeCloseTo(0);
        expect(getRotationDegrees(1)).toBe(-90);
        expect(getRotationDegrees(2.47)).toBeCloseTo(-222.3);
    });

    it("formats progress as whole degrees", () => {
        expect(formatRotateProgress(0.8666)).toBe("78°");
        expect(formatRotateProgress(2.47)).toBe("222°");
    });
});

describe("opacity preview", () => {
    it("slides the legend marker from the bottom to the top of the bar", () => {
        expect(getLegendMarkerTopPercent(0)).toBe(100);
        expect(getLegendMarkerTopPercent(1)).toBe(0);
        expect(getLegendMarkerTopPercent(1.17)).toBeCloseTo(-17);
    });

    it("formats progress as a whole percentage", () => {
        expect(formatOpacityProgress(0.666)).toBe("67%");
        expect(formatOpacityProgress(1.17)).toBe("117%");
    });
});

describe("preview motion store", () => {
    it("shares the live value between writers and readers", () => {
        setPreviewValue(0.42);
        expect(getPreviewValue()).toBe(0.42);
        expect(previewMotion.value).toBe(0.42);
    });

    it("ignores non-finite engine output", () => {
        setPreviewValue(Number.NaN);
        expect(getPreviewValue()).toBe(0);
    });

    it("returns to the initial position on reset", () => {
        setPreviewValue(1);
        resetPreviewValue();
        expect(getPreviewValue()).toBe(0);
    });
});
