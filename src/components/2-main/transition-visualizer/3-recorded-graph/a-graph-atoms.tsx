import { atom } from "jotai";
import { estimateDurationMs } from "../model/duration";
import { getSampleBounds, type SampleBounds } from "../model/samples";
import {
    activeEngineAtom,
    activeParamsAtom,
    expectedDurationMsAtom,
    liveSamplesAtom,
    runResultAtom,
    runStatusAtom,
} from "../state/atoms";

export const WIDTH = 760;
export const HEIGHT = 440;
export const LEFT = 58;
const RIGHT = 24;
export const TOP = 32;
const BOTTOM = 54;
export const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
export const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

const EMPTY_BOUNDS: SampleBounds = { durationMs: 0, minValue: 0, maxValue: 1 };

export type GraphPlot = {
    bounds: SampleBounds;
    toY: (value: number) => number;
    line: string;
    area: string;
    points: { x: number; y: number }[];
    hasCurve: boolean;
    duration: number;
    elapsedMs: number;
};

export const isRecordingAtom = atom((get) => get(runStatusAtom) === "running");

export const graphSamplesAtom = atom((get) => {
    const result = get(runResultAtom);
    return get(isRecordingAtom) ? get(liveSamplesAtom) : result?.samples ?? [];
});

export const graphAtom = atom((get): GraphPlot => {
    const samples = get(graphSamplesAtom);
    const recording = get(isRecordingAtom);
    const expectedDurationMs = get(expectedDurationMsAtom);
    const result = get(runResultAtom);
    const engineId = get(activeEngineAtom);
    const params = get(activeParamsAtom);

    const bounds = samples.length > 0 ? getSampleBounds(samples) : EMPTY_BOUNDS;
    const elapsedMs = samples.at(-1)?.elapsedMs ?? 0;
    const duration = recording
        ? Math.max(expectedDurationMs, elapsedMs, 1)
        : result
            ? Math.max(result.plotDurationMs ?? result.durationMs, 1)
            : Math.max(estimateDurationMs(engineId, params), 1);
    const valueRange = bounds.maxValue - bounds.minValue;
    const pad = Math.max(valueRange * 0.12, 0.08);
    const minValue = bounds.minValue - pad;
    const maxValue = bounds.maxValue + pad;
    const toX = (elapsed: number) => LEFT + (elapsed / duration) * PLOT_WIDTH;
    const toY = (value: number) => TOP + ((maxValue - value) / (maxValue - minValue)) * PLOT_HEIGHT;
    const points = samples.map((sample) => ({
        x: toX(sample.elapsedMs),
        y: toY(sample.value),
    }));
    const line = points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = points.length > 0
        ? `M ${points[0].x} ${TOP + PLOT_HEIGHT} L ${points.map(({ x, y }) => `${x} ${y}`).join(" L ")} L ${points.at(-1)!.x} ${TOP + PLOT_HEIGHT} Z`
        : "";

    return { bounds, toY, line, area, points, hasCurve: points.length > 0, duration, elapsedMs };
});
