import { createStore } from "jotai/vanilla";
import { describe, expect, it, vi } from "vitest";
import type { RunResult } from "../model/types";

const appSettings = vi.hoisted(() => ({ autoRecordResponse: true }));

vi.mock("@/store/1-ui-settings", () => ({
    appSettings,
}));

import {
    completeRunAtom,
    requestRunAtom,
    runResultAtom,
    runTokenAtom,
    runStatusAtom,
    updateParamAtom,
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

describe("auto-record on parameter change", () => {
    it("starts a new run when auto-record is enabled", () => {
        appSettings.autoRecordResponse = true;
        const store = createStore();

        store.set(updateParamAtom, { engineId: "react-spring", key: "tension", value: 200 });

        expect(store.get(runStatusAtom)).toBe("running");
        expect(store.get(runResultAtom)).toBeNull();
    });

    it("resets to idle when auto-record is disabled", () => {
        appSettings.autoRecordResponse = false;
        const store = createStore();
        store.set(requestRunAtom);

        store.set(updateParamAtom, { engineId: "react-spring", key: "tension", value: 200 });

        expect(store.get(runStatusAtom)).toBe("idle");
        expect(store.get(runResultAtom)).toBeNull();
        appSettings.autoRecordResponse = true;
    });
});
