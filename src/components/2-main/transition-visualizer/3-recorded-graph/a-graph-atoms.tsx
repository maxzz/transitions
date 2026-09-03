import { atom } from "jotai";
import { getPlotDurationMs } from "../model/2-duration";
import { getSampleBounds, type SampleBounds } from "../model/3-samples";
import type { GraphData } from "../model/5-graph-plot";
import {
    activeEngineAtom,
    activeParamsAtom,
    expectedDurationMsAtom,
    liveSamplesAtom,
    runResultAtom,
    runStatusAtom,
} from "../state/atoms";

const EMPTY_BOUNDS: SampleBounds = { durationMs: 0, minValue: 0, maxValue: 1 };

export type RecordedGraphData = GraphData & {
    hasCurve: boolean;
    elapsedMs: number;
};

export const isRecordingAtom = atom((get) => get(runStatusAtom) === "running");

/**
 * The settled curve is the plot source whenever it exists. Live samples only populate the
 * first recording (or a run after parameters changed and the previous result was cleared),
 * so a replay with the same parameters does not rebuild the path on every frame.
 */
export const graphSamplesAtom = atom((get) => {
    const resultSamples = get(runResultAtom)?.samples ?? [];
    if (resultSamples.length > 0) return resultSamples;
    return get(isRecordingAtom) ? get(liveSamplesAtom) : [];
});

export const graphDataAtom = atom((get): RecordedGraphData => {
    const samples = get(graphSamplesAtom);
    const recording = get(isRecordingAtom);
    const expectedDurationMs = get(expectedDurationMsAtom);
    const result = get(runResultAtom);
    const engineId = get(activeEngineAtom);
    const params = get(activeParamsAtom);

    const bounds = samples.length > 0 ? getSampleBounds(samples) : EMPTY_BOUNDS;
    const elapsedMs = samples.at(-1)?.elapsedMs ?? 0;
    const durationMs = result
        ? Math.max(result.plotDurationMs ?? result.durationMs, 1)
        : recording
            ? Math.max(expectedDurationMs, elapsedMs, 1)
            : Math.max(getPlotDurationMs(engineId, params), 1);

    return { samples, bounds, durationMs, elapsedMs, hasCurve: samples.length > 0 };
});
