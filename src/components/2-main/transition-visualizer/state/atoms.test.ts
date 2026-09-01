import { createStore } from "jotai/vanilla";
import { describe, expect, it } from "vitest";
import type { RunResult } from "../model/types";
import {
    completeRunAtom,
    requestRunAtom,
    runResultAtom,
    runTokenAtom,
    runStatusAtom,
} from "./atoms";

describe("visualizer run state", () => {
    it("ignores completion from a stale run token", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const staleToken = store.get(runTokenAtom);
        store.set(requestRunAtom);

        const staleResult: RunResult = {
            engineId: "react-spring",
            durationMs: 100,
            samples: [{ elapsedMs: 0, value: 0 }],
        };
        store.set(completeRunAtom, { token: staleToken, result: staleResult });

        expect(store.get(runResultAtom)).toBeNull();
        expect(store.get(runStatusAtom)).toBe("running");
    });

    it("publishes completion for the current run token", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const result: RunResult = {
            engineId: "motion",
            durationMs: 320,
            samples: [
                { elapsedMs: 0, value: 0 },
                { elapsedMs: 320, value: 1 },
            ],
        };

        store.set(completeRunAtom, { token, result });

        expect(store.get(runResultAtom)).toEqual(result);
        expect(store.get(runStatusAtom)).toBe("settled");
    });
});
