import { type Getter, type Setter, atom } from "jotai";
import { appSettings } from "@/store/1-ui-settings";
import { engineDefinitions, getValidParamsByEngine } from "../model/1-definitions";
import { buildRecordedResult } from "../model/6-sample-engine";
import { type EngineId, type EngineParamsMap, type RunResult, type RunStatus, type SamplePoint, type VisualizationMode } from "../model/9-types";
import { ensurePreviewPlayingSpeed, resetPreviewValue, togglePreviewPause } from "./preview-motion";

export const AUTO_RECORD_DEBOUNCE_MS = 500;

export const activeEngineAtom = atom<EngineId>("spring");
export const visualizationModeAtom = atom<VisualizationMode>("spring");

export const paramsByEngineAtom = atom<EngineParamsMap>(readPersistedParams());

export const activeParamsAtom = atom(
    (get) => {
        const engineId = get(activeEngineAtom);
        return get(paramsByEngineAtom)[engineId];
    }
);

export const activeDefinitionAtom = atom((get) => engineDefinitions[get(activeEngineAtom)]);

export const runStatusAtom = atom<RunStatus>("idle");

export const runTokenAtom = atom(0);
export const runResultAtom = atom<RunResult | null>(null);
export const liveSamplesAtom = atom<SamplePoint[]>([]);
export const expectedDurationMsAtom = atom(0);

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

let autoRecordTimer: ReturnType<typeof setTimeout> | null = null;

export function clearAutoRecordTimer() {
    if (autoRecordTimer === null) return;
    clearTimeout(autoRecordTimer);
    autoRecordTimer = null;
}

function writePrecomputedCurve(get: Getter, set: Setter) {
    const engineId = get(activeEngineAtom);
    const params = get(paramsByEngineAtom)[engineId];
    const result = buildRecordedResult(engineId, params);
    set(runResultAtom, result);
    set(expectedDurationMsAtom, result.plotDurationMs ?? result.durationMs);
    set(liveSamplesAtom, []);
    resetPreviewValue();
    return result;
}

function startRun(get: Getter, set: Setter, keepResult = false) {
    clearAutoRecordTimer();
    set(runTokenAtom, (token) => token + 1);
    if (!keepResult || !get(runResultAtom)?.samples.length) {
        writePrecomputedCurve(get, set);
    }
    set(liveSamplesAtom, []);
    set(runStatusAtom, "running");
}

function resetOrAutoRun(get: Getter, set: Setter, debounce: boolean) {
    writePrecomputedCurve(get, set);

    if (!appSettings.autoRecordResponse) {
        set(runTokenAtom, (token) => token + 1);
        set(runStatusAtom, "idle");
        clearAutoRecordTimer();
        return;
    }

    if (!debounce) {
        startRun(get, set, true);
        return;
    }

    set(runTokenAtom, (token) => token + 1);
    set(runStatusAtom, "settled");
    clearAutoRecordTimer();
    autoRecordTimer = setTimeout(
        () => {
            autoRecordTimer = null;
            startRun(get, set, true);
        },
        AUTO_RECORD_DEBOUNCE_MS);
}

export const selectEngineAtom = atom(
    null,
    (get, set, engineId: EngineId) => {
        set(activeEngineAtom, engineId);
        resetOrAutoRun(get, set, false);
    }
);

export const updateParamAtom = atom(
    null,
    (get, set, update: { engineId: EngineId; key: string; value: number | string | boolean; }) => {
        const current = get(paramsByEngineAtom);
        const nextParams = { ...current[update.engineId], [update.key]: update.value } as EngineParamsMap[typeof update.engineId];
        set(paramsByEngineAtom, { ...current, [update.engineId]: nextParams } as EngineParamsMap);
        persistEngineParams(update.engineId, nextParams);
        resetOrAutoRun(get, set, true);
    },
);

export const applyPresetAtom = atom(
    null,
    (get, set, update: { engineId: EngineId; presetId: string; }) => {
        const definition = engineDefinitions[update.engineId];
        const preset = definition.presets.find(({ id }) => id === update.presetId);
        if (!preset) return;

        const current = get(paramsByEngineAtom);
        const nextParams = { ...preset.params } as EngineParamsMap[typeof update.engineId];
        set(paramsByEngineAtom, { ...current, [update.engineId]: nextParams } as EngineParamsMap);
        persistEngineParams(update.engineId, nextParams);
        resetOrAutoRun(get, set, true);
    },
);

export const requestRunAtom = atom(
    null,
    (get, set) => {
        startRun(get, set, true);
    }
);

export const hydrateCurveAtom = atom(
    null,
    (get, set) => {
        if (get(runResultAtom)?.samples.length) return;
        writePrecomputedCurve(get, set);
    }
);

export const publishLiveSamplesAtom = atom(
    null,
    (get, set, update: { token: number; samples: SamplePoint[]; }) => {
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
    (get, set, update: { token: number; elapsedMs: number; }) => {
        if (get(runTokenAtom) !== update.token) return;
        if (update.elapsedMs > get(expectedDurationMsAtom)) {
            set(expectedDurationMsAtom, update.elapsedMs);
        }
    },
);

export const completeRunAtom = atom(
    null,
    (get, set, update: { token: number; stopped?: boolean; elapsedMs?: number; }) => {
        if (get(runTokenAtom) !== update.token) return;
        const current = get(runResultAtom);
        if (current && update.stopped) {
            set(runResultAtom, { ...current, stopped: true, durationMs: Math.max(update.elapsedMs ?? current.durationMs, 1) });
        } else if (current) {
            set(runResultAtom, { ...current, stopped: false });
        }
        set(runStatusAtom, "settled");
    },
);

export const stopRunAtom = atom(
    null,
    (get) => {
        if (get(runStatusAtom) !== "running") return;
        stopActiveRun?.();
    }
);

export const togglePlayStopAtom = atom(
    null,
    (get, set) => {
        if (get(runStatusAtom) === "running") {
            set(stopRunAtom);
            ensurePreviewPlayingSpeed();
            return;
        }
        ensurePreviewPlayingSpeed();
        set(requestRunAtom);
    }
);

export const togglePauseResumeAtom = atom(
    null,
    (get) => {
        if (get(runStatusAtom) === "running") {
            togglePreviewPause();
        }
    }
);
