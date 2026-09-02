import { proxy, subscribe } from "valtio";
import { type ThemeMode, themeApplyMode } from "../utils/theme-apply";
import { type PanelSizes, getValidPanelSizes } from "./2-panel-sizes";
import {
    type EngineId,
    type GsapParams,
    type MotionParams,
    type ReactSpringParams,
} from "@/components/2-main/transition-visualizer/model/9-types";
import {
    engineDefinitions,
    gsapDefaults,
    getValidEngineParams,
    motionDefaults,
    reactSpringDefaults,
} from "@/components/2-main/transition-visualizer/model/1-definitions";

export type RecordedDuration = {
    key: string;
    durationMs: number;
};

const STORE_KEY = "tm-transition-visualizer";
const STORE_VER = "v1.0";
const STORAGE_ID = `${STORE_KEY}__${STORE_VER}`;

export type VisualizerDisplay = "mechanical" | "split" | "graph";

export interface AppSettings {
    theme: ThemeMode;
    showFooter: boolean;
    panelSizes: PanelSizes;
    expandedSections: string[];
    visualizerDisplay: VisualizerDisplay;
    autoRecordResponse: boolean;
    returnToInitialPosition: boolean;
    reactSpringParams: ReactSpringParams;
    motionParams: MotionParams;
    gsapParams: GsapParams;
    recordedDurations: Partial<Record<EngineId, RecordedDuration>>;
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: "light",
    showFooter: true,
    panelSizes: getValidPanelSizes(),
    expandedSections: ["resizable-panels", "pierre-trees"],
    visualizerDisplay: "split",
    autoRecordResponse: true,
    returnToInitialPosition: false,
    reactSpringParams: { ...reactSpringDefaults },
    motionParams: { ...motionDefaults },
    gsapParams: { ...gsapDefaults },
    recordedDurations: {},
};

function loadSettings(): AppSettings {
    try {
        const stored = localStorage.getItem(STORAGE_ID);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<AppSettings>;
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                panelSizes: getValidPanelSizes(parsed.panelSizes),
                expandedSections: parsed.expandedSections ?? DEFAULT_SETTINGS.expandedSections,
                visualizerDisplay: getValidVisualizerDisplay(parsed.visualizerDisplay),
                autoRecordResponse: getValidBoolean(parsed.autoRecordResponse, DEFAULT_SETTINGS.autoRecordResponse),
                returnToInitialPosition: getValidBoolean(parsed.returnToInitialPosition, DEFAULT_SETTINGS.returnToInitialPosition),
                reactSpringParams: getValidEngineParams(engineDefinitions.spring, parsed.reactSpringParams),
                motionParams: getValidEngineParams(engineDefinitions.motion, parsed.motionParams),
                gsapParams: getValidEngineParams(engineDefinitions.gsap, parsed.gsapParams),
                recordedDurations: getValidRecordedDurations(parsed.recordedDurations),
            };
        }
    } catch (error) {
        console.error("Failed to load settings", error);
    }
    return {
        ...DEFAULT_SETTINGS,
        reactSpringParams: { ...reactSpringDefaults },
        motionParams: { ...motionDefaults },
        gsapParams: { ...gsapDefaults },
    };
}

function getValidVisualizerDisplay(value: unknown): VisualizerDisplay {
    return value === "mechanical" || value === "graph" || value === "split" ? value : DEFAULT_SETTINGS.visualizerDisplay;
}

function getValidBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function getValidRecordedDurations(value: unknown): AppSettings["recordedDurations"] {
    if (!value || typeof value !== "object") {
        return {};
    }

    const recorded: AppSettings["recordedDurations"] = {};
    for (const engineId of ["spring", "motion", "gsap"] as const) {
        const entry = (value as Partial<Record<EngineId, unknown>>)[engineId];
        if (!entry || typeof entry !== "object") {
            continue;
        }

        const { key, durationMs } = entry as Partial<RecordedDuration>;
        if (typeof key === "string" && Number.isFinite(durationMs) && (durationMs ?? 0) > 0) {
            recorded[engineId] = { key, durationMs: durationMs as number };
        }
    }
    return recorded;
}

// appSettings

export const appSettings = proxy<AppSettings>(loadSettings());

themeApplyMode(appSettings.theme);

subscribe(appSettings, () => {
    try {
        themeApplyMode(appSettings.theme);
        localStorage.setItem(STORAGE_ID, JSON.stringify(appSettings));
    } catch (error) {
        console.error("Failed to save settings", error);
    }
});
