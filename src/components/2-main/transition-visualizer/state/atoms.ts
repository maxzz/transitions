import { atom, type Getter, type Setter } from "jotai";
import { appSettings } from "@/store/1-ui-settings";
import {
    engineDefinitions,
    getValidParamsByEngine,
} from "../model/1-definitions";
import { getPlotDurationMs } from "../model/2-duration";
import type { EngineId, EngineParamsMap, RunResult, RunStatus, SamplePoint, VisualizationMode } from "../model/9-types";

export const AUTO_RECORD_DEBOUNCE_MS = 500;

export const activeEngineAtom = atom<EngineId>("spring");
export const visualizationModeAtom = atom<VisualizationMode>("spring");

export const paramsByEngineAtom = atom<EngineParamsMap>(readPersistedParams());

export const activeParamsAtom = atom((get) => {
    const engineId = get(activeEngineAtom);
    return get(paramsByEngineAtom)[engineId];
});

export const activeDefinitionAtom = atom((get) => engineDefinitions[get(activeEngineAtom)]);

export const runStatusAtom = atom<RunStatus>("idle");
export const runTokenAtom = atom(0);
export const runResultAtom = atom<RunResult | null>(null);
export const liveSamplesAtom = atom<SamplePoint[]>([]);
export const expectedDurationMsAtom = atom(0);

let autoRecordTimer: ReturnType<typeof setTimeout> | null = null;
let stopActiveRun: (() => void) | null = null;

export function registerStopActiveRun(stop: (() => void) | null) {
    stopActiveRun = stop;
}

function readPersistedParams(): EngineParamsMap {
    return getValidParamsByEngine({
        spring: appSettings.reactSpringParams,
        motion: appSettings.motionParams,
        gsap: appSettings.gsapParams,
    });
}

function persistEngineParams<Id extends EngineId>(engineId: Id, params: EngineParamsMap[Id]) {
    if (engineId === "spring") {
        appSettings.reactSpringParams = params as EngineParamsMap["spring"];
        return;
    }
    if (engineId === "motion") {
        appSettings.motionParams = params as EngineParamsMap["motion"];
        return;
    }
    appSettings.gsapParams = params as EngineParamsMap["gsap"];
}

export function clearAutoRecordTimer() {
    if (autoRecordTimer === null) return;
    clearTimeout(autoRecordTimer);
    autoRecordTimer = null;
}

function resetRun(set: Setter) {
    clearAutoRecordTimer();
    set(runTokenAtom, (token) => token + 1);
    set(runStatusAtom, "idle");
    set(runResultAtom, null);
    set(liveSamplesAtom, []);
}

function startRun(get: Getter, set: Setter, keepResult = false) {
    clearAutoRecordTimer();
    const engineId = get(activeEngineAtom);
    const params = get(paramsByEngineAtom)[engineId];
    set(runTokenAtom, (token) => token + 1);
    // Replaying the same parameters keeps the last curve; the playhead tracks progress instead.
    if (!keepResult) {
        set(runResultAtom, null);
    }
    set(liveSamplesAtom, []);
    // The time range is fixed from the parameters alone, so the plot does not rescale while recording.
    set(expectedDurationMsAtom, getPlotDurationMs(engineId, params));
    set(runStatusAtom, "running");
}

function resetOrAutoRun(get: Getter, set: Setter, debounce: boolean) {
    if (!appSettings.autoRecordResponse) {
        resetRun(set);
        return;
    }

    if (!debounce) {
        startRun(get, set);
        return;
    }

    set(runTokenAtom, (token) => token + 1);
    set(runStatusAtom, get(runResultAtom) ? "settled" : "idle");
    clearAutoRecordTimer();
    autoRecordTimer = setTimeout(() => {
        autoRecordTimer = null;
        startRun(get, set);
    }, AUTO_RECORD_DEBOUNCE_MS);
}

export const selectEngineAtom = atom(null, (get, set, engineId: EngineId) => {
    set(activeEngineAtom, engineId);
    resetOrAutoRun(get, set, false);
});

export const updateParamAtom = atom(
    null,
    (get, set, update: { engineId: EngineId; key: string; value: number | string | boolean }) => {
        const current = get(paramsByEngineAtom);
        const nextParams = {
            ...current[update.engineId],
            [update.key]: update.value,
        } as EngineParamsMap[typeof update.engineId];
        set(paramsByEngineAtom, {
            ...current,
            [update.engineId]: nextParams,
        } as EngineParamsMap);
        persistEngineParams(update.engineId, nextParams);
        resetOrAutoRun(get, set, true);
    },
);

export const applyPresetAtom = atom(
    null,
    (get, set, update: { engineId: EngineId; presetId: string }) => {
        const definition = engineDefinitions[update.engineId];
        const preset = definition.presets.find(({ id }) => id === update.presetId);
        if (!preset) return;

        const current = get(paramsByEngineAtom);
        const nextParams = { ...preset.params } as EngineParamsMap[typeof update.engineId];
        set(paramsByEngineAtom, {
            ...current,
            [update.engineId]: nextParams,
        } as EngineParamsMap);
        persistEngineParams(update.engineId, nextParams);
        resetOrAutoRun(get, set, true);
    },
);

export const requestRunAtom = atom(null, (get, set) => {
    startRun(get, set, true);
});

export const publishLiveSamplesAtom = atom(
    null,
    (get, set, update: { token: number; samples: SamplePoint[] }) => {
        if (get(runTokenAtom) !== update.token) return;
        set(liveSamplesAtom, update.samples);
        set(extendExpectedDurationAtom, { token: update.token, elapsedMs: update.samples.at(-1)?.elapsedMs ?? 0 });
    },
);

/**
 * Grows the plotted time range as soon as a frame runs past it. Called for every frame (not only on
 * throttled publishes) so the final result never has to stretch the axis one more time after the live plot.
 */
export const extendExpectedDurationAtom = atom(
    null,
    (get, set, update: { token: number; elapsedMs: number }) => {
        if (get(runTokenAtom) !== update.token) return;
        if (update.elapsedMs > get(expectedDurationMsAtom)) {
            set(expectedDurationMsAtom, update.elapsedMs);
        }
    },
);

export const completeRunAtom = atom(
    null,
    (get, set, update: { token: number; result: RunResult }) => {
        if (get(runTokenAtom) !== update.token) return;
        const plotDurationMs = Math.max(get(expectedDurationMsAtom), update.result.durationMs, 1);
        const result = { ...update.result, plotDurationMs };
        set(runResultAtom, result);
        set(liveSamplesAtom, result.samples);
        set(runStatusAtom, "settled");
    },
);

export const stopRunAtom = atom(null, (get) => {
    if (get(runStatusAtom) !== "running") return;
    stopActiveRun?.();
});
