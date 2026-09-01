import { atom, type Getter, type Setter } from "jotai";
import { appSettings } from "@/store/1-ui-settings";
import {
    engineDefinitions,
    getValidParamsByEngine,
} from "../model/definitions";
import type { EngineId, EngineParamsMap, RunResult, RunStatus, VisualizationMode } from "../model/types";

export const AUTO_RECORD_DEBOUNCE_MS = 500;

export const activeEngineAtom = atom<EngineId>("react-spring");
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

let autoRecordTimer: ReturnType<typeof setTimeout> | null = null;

function readPersistedParams(): EngineParamsMap {
    return getValidParamsByEngine({
        "react-spring": appSettings.reactSpringParams,
        motion: appSettings.motionParams,
        gsap: appSettings.gsapParams,
    });
}

function persistEngineParams<Id extends EngineId>(engineId: Id, params: EngineParamsMap[Id]) {
    if (engineId === "react-spring") {
        appSettings.reactSpringParams = params as EngineParamsMap["react-spring"];
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
}

function startRun(set: Setter) {
    clearAutoRecordTimer();
    set(runTokenAtom, (token) => token + 1);
    set(runStatusAtom, "running");
}

function resetOrAutoRun(get: Getter, set: Setter, debounce: boolean) {
    if (!appSettings.autoRecordResponse) {
        resetRun(set);
        return;
    }

    if (!debounce) {
        startRun(set);
        return;
    }

    set(runTokenAtom, (token) => token + 1);
    set(runStatusAtom, get(runResultAtom) ? "settled" : "idle");
    clearAutoRecordTimer();
    autoRecordTimer = setTimeout(() => {
        autoRecordTimer = null;
        startRun(set);
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

export const requestRunAtom = atom(null, (_get, set) => {
    startRun(set);
});

export const completeRunAtom = atom(
    null,
    (get, set, update: { token: number; result: RunResult }) => {
        if (get(runTokenAtom) !== update.token) return;
        set(runResultAtom, update.result);
        set(runStatusAtom, "settled");
    },
);

