import { atom } from "jotai";
import { getPlotDurationMs } from "../model/2-duration";
import { getSampleBounds, type SampleBounds } from "../model/3-samples";
import type { GraphData } from "../model/5-graph-plot";
import {
    activeEngineAtom,
    activeParamsAtom,
    expectedDurationMsAtom,
    runResultAtom,
    runStatusAtom,
} from "../state/atoms";

const EMPTY_BOUNDS: SampleBounds = { durationMs: 0, minValue: 0, maxValue: 1 };

export type RecordedGraphData = GraphData & {
    hasCurve: boolean;
    elapsedMs: number;
};

export const isRecordingAtom = atom((get) => get(runStatusAtom) === "running");

/** Playhead tracks a precomputed curve while playing, or after the clock has moved. */
export const showGraphPlayheadAtom = atom((get) => {
    return (get(runResultAtom)?.samples.length ?? 0) > 0 && get(isRecordingAtom);
});

export const graphSamplesAtom = atom((get) => get(runResultAtom)?.samples ?? []);

export const graphDataAtom = atom((get): RecordedGraphData => {
    const samples = get(graphSamplesAtom);
    const result = get(runResultAtom);
    const engineId = get(activeEngineAtom);
    const params = get(activeParamsAtom);
    const expectedDurationMs = get(expectedDurationMsAtom);

    const bounds = samples.length > 0 ? getSampleBounds(samples) : EMPTY_BOUNDS;
    const elapsedMs = samples.at(-1)?.elapsedMs ?? 0;
    const durationMs = result
        ? Math.max(result.plotDurationMs ?? result.durationMs, 1)
        : Math.max(expectedDurationMs, getPlotDurationMs(engineId, params), 1);

    return { samples, bounds, durationMs, elapsedMs, hasCurve: samples.length > 0 };
});
