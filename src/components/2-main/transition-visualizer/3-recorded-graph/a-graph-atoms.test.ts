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

import type { RunResult } from "../model/9-types";
import { clearAutoRecordTimer, completeRunAtom, liveSamplesAtom, publishLiveSamplesAtom, registerStopActiveRun, requestRunAtom, runTokenAtom } from "../state/atoms";
import { graphDataAtom, graphSamplesAtom } from "./a-graph-atoms";

describe("recorded graph data", () => {
    afterEach(() => {
        registerStopActiveRun(null);
        clearAutoRecordTimer();
    });

    it("keeps the settled samples while a replay publishes live frames", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const result: RunResult = {
            engineId: "spring",
            durationMs: 300,
            samples: [
                { elapsedMs: 0, value: 0 },
                { elapsedMs: 150, value: 1.1 },
                { elapsedMs: 300, value: 1 },
            ],
        };
        store.set(completeRunAtom, { token, result });
        const settled = store.get(graphDataAtom);

        store.set(requestRunAtom);
        store.set(publishLiveSamplesAtom, {
            token: store.get(runTokenAtom),
            samples: [
                { elapsedMs: 0, value: 0 },
                { elapsedMs: 40, value: 0.2 },
            ],
        });

        expect(store.get(liveSamplesAtom)).toHaveLength(2);
        expect(store.get(graphSamplesAtom)).toEqual(result.samples);
        expect(store.get(graphDataAtom).samples).toBe(settled.samples);
        expect(store.get(graphDataAtom).durationMs).toBe(settled.durationMs);
    });
});
