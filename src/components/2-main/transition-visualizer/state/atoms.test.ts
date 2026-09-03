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

import { getPlotDurationMs } from "../model/2-duration";
import { previewMotion, setPreviewSpeed } from "./preview-motion";
import {
    AUTO_RECORD_DEBOUNCE_MS,
    applyPresetAtom,
    clearAutoRecordTimer,
    completeRunAtom,
    expectedDurationMsAtom,
    extendExpectedDurationAtom,
    liveSamplesAtom,
    paramsByEngineAtom,
    publishLiveSamplesAtom,
    registerStopActiveRun,
    requestRunAtom,
    runResultAtom,
    runTokenAtom,
    runStatusAtom,
    stopRunAtom,
    togglePauseResumeAtom,
    togglePlayStopAtom,
    updateParamAtom,
} from "./atoms";

describe("visualizer run state", () => {
    afterEach(() => {
        registerStopActiveRun(null);
        clearAutoRecordTimer();
        setPreviewSpeed(1);
    });

    it("ignores completion from a stale run token", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const staleToken = store.get(runTokenAtom);
        store.set(requestRunAtom);

        store.set(completeRunAtom, { token: staleToken, stopped: true, elapsedMs: 50 });

        expect(store.get(runResultAtom)?.stopped).not.toBe(true);
        expect(store.get(runStatusAtom)).toBe("running");
    });

    it("publishes completion for the current run token", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const sampled = store.get(runResultAtom);

        store.set(completeRunAtom, { token });

        expect(store.get(runResultAtom)?.samples).toEqual(sampled?.samples);
        expect(store.get(runResultAtom)?.plotDurationMs).toBeGreaterThanOrEqual(sampled?.durationMs ?? 0);
        expect(store.get(runStatusAtom)).toBe("settled");
    });

    it("fixes the time scale from the parameters before the run, regardless of earlier measurements", () => {
        const store = createStore();
        const predicted = getPlotDurationMs("spring", store.get(paramsByEngineAtom).spring);
        store.set(requestRunAtom);
        expect(store.get(expectedDurationMsAtom)).toBe(predicted);

        const token = store.get(runTokenAtom);
        store.set(completeRunAtom, { token });
        store.set(requestRunAtom);

        expect(store.get(expectedDurationMsAtom)).toBe(predicted);
    });

    it("keeps the predicted time scale on the precomputed curve", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const expected = store.get(expectedDurationMsAtom);
        const token = store.get(runTokenAtom);

        store.set(completeRunAtom, { token });

        expect(store.get(runResultAtom)?.plotDurationMs).toBe(expected);
        expect(store.get(runResultAtom)?.durationMs).toBeLessThanOrEqual(expected);
    });

    it("keeps the previous curve when the same parameters are replayed", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        store.set(completeRunAtom, { token });
        const sampled = store.get(runResultAtom);

        store.set(requestRunAtom);

        expect(store.get(runResultAtom)).toBe(sampled);
        expect(store.get(runResultAtom)?.samples).toBe(sampled?.samples);
        expect(store.get(liveSamplesAtom)).toEqual([]);
        expect(store.get(runStatusAtom)).toBe("running");
        expect(store.get(expectedDurationMsAtom)).toBeGreaterThan(0);
    });

    it("precomputes the curve as soon as a run starts", () => {
        const store = createStore();
        store.set(requestRunAtom);

        const result = store.get(runResultAtom);
        expect(result?.samples.length).toBeGreaterThan(2);
        expect(result?.samples[0]).toEqual({ elapsedMs: 0, value: 0 });
        expect(store.get(runStatusAtom)).toBe("running");
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

    it("extends the plotted time range per frame so completion reuses the live axis", () => {
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const expected = store.get(expectedDurationMsAtom);

        store.set(extendExpectedDurationAtom, { token, elapsedMs: expected - 1 });
        expect(store.get(expectedDurationMsAtom)).toBe(expected);

        store.set(extendExpectedDurationAtom, { token, elapsedMs: expected + 37 });
        expect(store.get(expectedDurationMsAtom)).toBe(expected + 37);

        store.set(extendExpectedDurationAtom, { token: token - 1, elapsedMs: expected + 999 });
        expect(store.get(expectedDurationMsAtom)).toBe(expected + 37);

        store.set(completeRunAtom, { token, stopped: true, elapsedMs: expected + 37 });
        expect(store.get(runResultAtom)?.durationMs).toBe(expected + 37);
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

    it("starts a run from the play/stop toggle and stops the next click", () => {
        const store = createStore();
        const stop = vi.fn();
        registerStopActiveRun(stop);

        store.set(togglePlayStopAtom);
        expect(store.get(runStatusAtom)).toBe("running");

        store.set(togglePlayStopAtom);
        expect(stop).toHaveBeenCalledTimes(1);

        registerStopActiveRun(null);
    });

    it("ignores pause/resume when nothing is playing", () => {
        const store = createStore();
        setPreviewSpeed(1);
        store.set(togglePauseResumeAtom);
        expect(previewMotion.speed).toBe(1);
    });

    it("pauses and resumes only while a run is active", () => {
        const store = createStore();
        setPreviewSpeed(1);
        store.set(requestRunAtom);
        expect(store.get(runStatusAtom)).toBe("running");

        store.set(togglePauseResumeAtom);
        expect(previewMotion.speed).toBe(0);

        store.set(togglePauseResumeAtom);
        expect(previewMotion.speed).toBe(1);
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

        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 200 });
        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 240 });

        expect(store.get(runStatusAtom)).toBe("settled");
        expect(store.get(runResultAtom)?.samples.length).toBeGreaterThan(0);

        vi.advanceTimersByTime(AUTO_RECORD_DEBOUNCE_MS - 1);
        expect(store.get(runStatusAtom)).toBe("settled");

        vi.advanceTimersByTime(1);
        expect(store.get(runStatusAtom)).toBe("running");
    });

    it("replaces the curve when parameters change", () => {
        vi.useFakeTimers();
        appSettings.autoRecordResponse = true;
        const store = createStore();
        store.set(requestRunAtom);
        const token = store.get(runTokenAtom);
        const first = store.get(runResultAtom);
        store.set(completeRunAtom, { token });

        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 240 });
        vi.advanceTimersByTime(AUTO_RECORD_DEBOUNCE_MS);

        expect(store.get(runResultAtom)).not.toBe(first);
        expect(store.get(runResultAtom)?.samples.length).toBeGreaterThan(0);
        expect(store.get(runStatusAtom)).toBe("running");
    });

    it("keeps a precomputed curve when auto-record is disabled", () => {
        appSettings.autoRecordResponse = false;
        const store = createStore();
        store.set(requestRunAtom);

        store.set(updateParamAtom, { engineId: "spring", key: "tension", value: 200 });

        expect(store.get(runStatusAtom)).toBe("idle");
        expect(store.get(runResultAtom)?.samples.length).toBeGreaterThan(0);
        expect(store.get(liveSamplesAtom)).toEqual([]);
    });
});

describe("persisted library params", () => {
    afterEach(() => {
        clearAutoRecordTimer();
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
