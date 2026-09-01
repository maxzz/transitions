import { createStore } from "jotai/vanilla";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunResult } from "../model/types";

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

import {
    AUTO_RECORD_DEBOUNCE_MS,
    applyPresetAtom,
    clearAutoRecordTimer,
    completeRunAtom,
    paramsByEngineAtom,
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
    afterEach(() => {
        clearAutoRecordTimer();
        vi.useRealTimers();
        appSettings.autoRecordResponse = true;
    });

    it("debounces auto-record until settings stop changing", () => {
        vi.useFakeTimers();
        appSettings.autoRecordResponse = true;
        const store = createStore();

        store.set(updateParamAtom, { engineId: "react-spring", key: "tension", value: 200 });
        store.set(updateParamAtom, { engineId: "react-spring", key: "tension", value: 240 });

        expect(store.get(runStatusAtom)).toBe("idle");
        expect(store.get(runResultAtom)).toBeNull();

        vi.advanceTimersByTime(AUTO_RECORD_DEBOUNCE_MS - 1);
        expect(store.get(runStatusAtom)).toBe("idle");

        vi.advanceTimersByTime(1);
        expect(store.get(runStatusAtom)).toBe("running");
    });

    it("resets to idle when auto-record is disabled", () => {
        appSettings.autoRecordResponse = false;
        const store = createStore();
        store.set(requestRunAtom);

        store.set(updateParamAtom, { engineId: "react-spring", key: "tension", value: 200 });

        expect(store.get(runStatusAtom)).toBe("idle");
        expect(store.get(runResultAtom)).toBeNull();
    });
});

describe("persisted library params", () => {
    afterEach(() => {
        clearAutoRecordTimer();
        appSettings.autoRecordResponse = true;
    });

    it("writes react-spring values to a dedicated settings key", () => {
        const store = createStore();
        store.set(updateParamAtom, { engineId: "react-spring", key: "tension", value: 220 });

        expect(appSettings.reactSpringParams.tension).toBe(220);
        expect(store.get(paramsByEngineAtom)["react-spring"].tension).toBe(220);
    });

    it("writes motion values to a dedicated settings key", () => {
        const store = createStore();
        store.set(updateParamAtom, { engineId: "motion", key: "stiffness", value: 320 });

        expect(appSettings.motionParams).toMatchObject({ stiffness: 320 });
    });

    it("writes gsap preset values to a dedicated settings key", () => {
        const store = createStore();
        store.set(applyPresetAtom, { engineId: "gsap", presetId: "bounce" });

        expect(appSettings.gsapParams).toMatchObject({ ease: "bounce", duration: 1 });
    });
});
