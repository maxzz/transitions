import { createStore } from "jotai/vanilla";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunResult } from "../model/9-types";

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
    recordedDurations: {} as Record<string, { key: string; durationMs: number }>,
}));

vi.mock("@/store/1-ui-settings", () => ({
    appSettings,
}));

import {
    AUTO_RECORD_DEBOUNCE_MS,
    applyPresetAtom,
    clearAutoRecordTimer,
    clearDurationMemory,
    completeRunAtom,
    expectedDurationMsAtom,
    liveSamplesAtom,
    paramsByEngineAtom,
    publishLiveSamplesAtom,
    registerStopActiveRun,
    requestRunAtom,
    runResultAtom,
    runTokenAtom,
    runStatusAtom,
    stopRunAtom,
    updateParamAtom,
} from "./atoms";

describe("visualizer run state", () => {
    afterEach(() => {
        clearDurationMemory();
        registerStopActiveRun(null);
        clearAutoRecordTimer();
        appSettings.recordedDurations = {};
    });

    it("ignores completion from a stale run token", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const staleToken = store.get(runTokenAtom);
        store.set(requestRunAtom);

        const staleResult: RunResult = {
            engineId: "spring",
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

        expect(store.get(runResultAtom)).toMatchObject(result);
        expect(store.get(runResultAtom)?.plotDurationMs).toBeGreaterThanOrEqual(result.durationMs);
        expect(store.get(runStatusAtom)).toBe("settled");
    });

    it("reuses the measured duration on the next run with the same settings", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const result: RunResult = {
            engineId: "spring",
            durationMs: 1234,
            samples: [
                { elapsedMs: 0, value: 0 },
                { elapsedMs: 1234, value: 1 },
            ],
        };
        store.set(completeRunAtom, { token, result });
        store.set(requestRunAtom);

        expect(store.get(expectedDurationMsAtom)).toBe(1234);
    });

    it("keeps the predicted time scale when the run settles early", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const expected = store.get(expectedDurationMsAtom);
        const token = store.get(runTokenAtom);
        const result: RunResult = {
            engineId: "spring",
            durationMs: Math.max(1, Math.round(expected / 2)),
            samples: [
                { elapsedMs: 0, value: 0 },
                { elapsedMs: Math.max(1, Math.round(expected / 2)), value: 1 },
            ],
        };

        store.set(completeRunAtom, { token, result });

        expect(store.get(runResultAtom)?.plotDurationMs).toBe(expected);
        expect(store.get(runResultAtom)?.durationMs).toBe(result.durationMs);
    });

    it("clears the previous curve when a new run starts", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const result: RunResult = {
            engineId: "gsap",
            durationMs: 240,
            samples: [
                { elapsedMs: 0, value: 0 },
                { elapsedMs: 240, value: 1 },
            ],
        };
        store.set(completeRunAtom, { token, result });

        store.set(requestRunAtom);

        expect(store.get(runResultAtom)).toBeNull();
        expect(store.get(liveSamplesAtom)).toEqual([]);
        expect(store.get(runStatusAtom)).toBe("running");
        expect(store.get(expectedDurationMsAtom)).toBeGreaterThan(0);
    });

    it("publishes live samples for the current run token", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const samples = [
            { elapsedMs: 0, value: 0 },
            { elapsedMs: 80, value: 0.4 },
        ];

        store.set(publishLiveSamplesAtom, { token, samples });

        expect(store.get(liveSamplesAtom)).toEqual(samples);
        expect(store.get(runStatusAtom)).toBe("running");
    });

    it("stops the active run through the registered handler", () => {
        const store = createStore();
        const stop = vi.fn();
        registerStopActiveRun(stop);
        store.set(requestRunAtom);
        store.set(stopRunAtom);

        expect(stop).toHaveBeenCalledTimes(1);
        registerStopActiveRun(null);
    });

    it("does not stop when nothing is recording", () => {
        const stop = vi.fn();
        registerStopActiveRun(stop);
        const store = createStore();
        store.set(stopRunAtom);

        expect(stop).not.toHaveBeenCalled();
        registerStopActiveRun(null);
    });
});

describe("auto-record on parameter change", () => {
    afterEach(() => {
        clearAutoRecordTimer();
        clearDurationMemory();
        appSettings.recordedDurations = {};
        vi.useRealTimers();
        appSettings.autoRecordResponse = true;
    });

    it("debounces auto-record until settings stop changing", () => {
        vi.useFakeTimers();
        appSettings.autoRecordResponse = true;
        const store = createStore();

        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 200 });
        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 240 });

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

        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 200 });

        expect(store.get(runStatusAtom)).toBe("idle");
        expect(store.get(runResultAtom)).toBeNull();
        expect(store.get(liveSamplesAtom)).toEqual([]);
    });
});

describe("persisted library params", () => {
    afterEach(() => {
        clearAutoRecordTimer();
        clearDurationMemory();
        appSettings.recordedDurations = {};
        appSettings.autoRecordResponse = true;
    });

    it("writes react-spring values to a dedicated settings key", () => {
        const store = createStore();
        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 220 });

        expect(appSettings.reactSpringParams.tension).toBe(220);
        expect(store.get(paramsByEngineAtom).spring.tension).toBe(220);
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
