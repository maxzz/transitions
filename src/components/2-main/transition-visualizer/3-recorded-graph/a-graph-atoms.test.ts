import { createStore } from "jotai/vanilla";
import { afterEach, describe, expect, it, vi } from "vitest";

const appSettings = vi.hoisted(() => ({
    autoRecordResponse: true,
    reactSpringParams: {
        mass: 1,
        tension: 170,
        friction: 26,
        precision: 0.01,
        velocity: 0,
        clamp: false,
    },
    motionParams: {} as Record<string, unknown>,
    gsapParams: {} as Record<string, unknown>,
}));

vi.mock("@/store/1-ui-settings", () => ({
    appSettings,
}));

import { clearAutoRecordTimer, completeRunAtom, liveSamplesAtom, publishLiveSamplesAtom, registerStopActiveRun, requestRunAtom, runTokenAtom } from "../state/atoms";
import { graphDataAtom, graphSamplesAtom, showGraphPlayheadAtom } from "./a-graph-atoms";

describe("recorded graph data", () => {
    afterEach(() => {
        registerStopActiveRun(null);
        clearAutoRecordTimer();
    });

    it("exposes the precomputed curve as soon as a run starts", () => {
        const store = createStore();
        store.set(requestRunAtom);

        expect(store.get(graphSamplesAtom).length).toBeGreaterThan(2);
        expect(store.get(graphDataAtom).hasCurve).toBe(true);
        expect(store.get(showGraphPlayheadAtom)).toBe(true);
    });

    it("ignores live frames once the solver curve exists", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const settled = store.get(graphDataAtom);

        store.set(publishLiveSamplesAtom, {
            token: store.get(runTokenAtom),
            samples: [
                { elapsedMs: 0, value: 0 },
                { elapsedMs: 40, value: 0.2 },
            ],
        });

        expect(store.get(liveSamplesAtom)).toHaveLength(2);
        expect(store.get(graphSamplesAtom)).toBe(settled.samples);
        expect(store.get(graphDataAtom).durationMs).toBe(settled.durationMs);
    });

    it("hides the playhead after playback settles", () => {
        const store = createStore();
        store.set(requestRunAtom);
        store.set(completeRunAtom, { token: store.get(runTokenAtom) });

        expect(store.get(showGraphPlayheadAtom)).toBe(false);
        expect(store.get(graphSamplesAtom).length).toBeGreaterThan(0);
    });
});
