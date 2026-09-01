import { atom, type Setter } from "jotai";
import { appSettings } from "@/store/1-ui-settings";
import { engineDefinitions, gsapDefaults, motionDefaults, reactSpringDefaults } from "../model/definitions";
import type { EngineId, EngineParamsMap, RunResult, RunStatus, VisualizationMode } from "../model/types";

export const activeEngineAtom = atom<EngineId>("react-spring");
export const visualizationModeAtom = atom<VisualizationMode>("spring");

export const paramsByEngineAtom = atom<EngineParamsMap>({
    "react-spring": { ...reactSpringDefaults },
    motion: { ...motionDefaults },
    gsap: { ...gsapDefaults },
});

export const activeParamsAtom = atom((get) => {
    const engineId = get(activeEngineAtom);
    return get(paramsByEngineAtom)[engineId];
});

export const activeDefinitionAtom = atom((get) => engineDefinitions[get(activeEngineAtom)]);

export const runStatusAtom = atom<RunStatus>("idle");
export const runTokenAtom = atom(0);
export const runResultAtom = atom<RunResult | null>(null);

function resetRun(set: Setter) {
    set(runTokenAtom, (token) => token + 1);
    set(runStatusAtom, "idle");
    set(runResultAtom, null);
}

function resetOrAutoRun(set: Setter) {
    if (appSettings.autoRecordResponse) {
        set(runTokenAtom, (token) => token + 1);
        set(runResultAtom, null);
        set(runStatusAtom, "running");
        return;
    }
    resetRun(set);
}

export const selectEngineAtom = atom(null, (_get, set, engineId: EngineId) => {
    set(activeEngineAtom, engineId);
    resetOrAutoRun(set);
});

export const updateParamAtom = atom(
    null,
    (get, set, update: { engineId: EngineId; key: string; value: number | string | boolean }) => {
        const current = get(paramsByEngineAtom);
        set(paramsByEngineAtom, {
            ...current,
            [update.engineId]: {
                ...current[update.engineId],
                [update.key]: update.value,
            },
        } as EngineParamsMap);
        resetOrAutoRun(set);
    },
);

export const applyPresetAtom = atom(
    null,
    (get, set, update: { engineId: EngineId; presetId: string }) => {
        const definition = engineDefinitions[update.engineId];
        const preset = definition.presets.find(({ id }) => id === update.presetId);
        if (!preset) return;

        const current = get(paramsByEngineAtom);
        set(paramsByEngineAtom, {
            ...current,
            [update.engineId]: { ...preset.params },
        } as EngineParamsMap);
        resetOrAutoRun(set);
    },
);

export const requestRunAtom = atom(null, (_get, set) => {
    set(runTokenAtom, (token) => token + 1);
    set(runResultAtom, null);
    set(runStatusAtom, "running");
});

export const completeRunAtom = atom(
    null,
    (get, set, update: { token: number; result: RunResult }) => {
        if (get(runTokenAtom) !== update.token) return;
        set(runResultAtom, update.result);
        set(runStatusAtom, "settled");
    },
);

export const backToPreviewAtom = atom(null, (_get, set) => {
    resetRun(set);
});
