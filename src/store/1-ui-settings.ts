import { proxy, subscribe } from "valtio";
import { type ThemeMode, themeApplyMode } from "../utils/theme-apply";
import { type PanelSizes, getValidPanelSizes } from "./2-panel-sizes";
import { type AppPageId, type HeroPageState } from "@/components/2-main/hero-page/model/2-types";
import {
    DEFAULT_HERO_PAGE_SETTINGS,
    createInitialHeroPageState,
    parseHeroPageSettings,
} from "@/components/2-main/hero-page/model/4-hero-page-settings";
import {
    type GsapParams,
    type MotionParams,
    type SpringParams,
} from "@/components/2-main/transition-visualizer/model/9-types";
import {
    engineDefinitions,
    gsapDefaults,
    getValidEngineParams,
    motionDefaults,
    springDefaults,
} from "@/components/2-main/transition-visualizer/model/1-definitions";

const STORE_KEY = "tm-transition-visualizer";
const STORE_VER = "v1.0";
const STORAGE_ID = `${STORE_KEY}__${STORE_VER}`;
const LEGACY_HERO_PAGE_STORAGE_ID = "tm-hero-page__v1";

export type VisualizerDisplay = "mechanical" | "split" | "graph";

export interface AppSettings {
    theme: ThemeMode;                       // the theme of the app
    showFooter: boolean;                    // false to hide the footer
    panelSizes: PanelSizes;                 // the sizes of the panels
    expandedSections: string[];             // the sections that are expanded by default
    visualizerDisplay: VisualizerDisplay;   // "mechanical" to show the mechanical response, "split" to show the mechanical response and the graph side by side, "graph" to show only the graph
    autoRecordResponse: boolean;            // false to disable recording of the response
    returnToInitialPosition: boolean;       // false to keep the final position of the transition
    showGraphPoints: boolean;               // false to hide the points on the graph
    graphClickToDrag: boolean;              // false to disable scrubbing of the graph
    reactSpringParams: SpringParams;        // the parameters for the react-spring transition
    motionParams: MotionParams;             // the parameters for the Motion transition
    gsapParams: GsapParams;                 // the parameters for the GSAP transition
    heroPage: HeroPageState;                // hero splash visibility, last viewed page, and the page shown on launch
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: "light",
    showFooter: true,
    panelSizes: getValidPanelSizes(),
    expandedSections: ["resizable-panels", "pierre-trees"],
    visualizerDisplay: "split",
    autoRecordResponse: true,
    returnToInitialPosition: false,
    showGraphPoints: false,
    graphClickToDrag: true,
    reactSpringParams: { ...springDefaults },
    motionParams: { ...motionDefaults },
    gsapParams: { ...gsapDefaults },
    heroPage: createInitialHeroPageState(DEFAULT_HERO_PAGE_SETTINGS),
};

function loadSettings(): AppSettings {
    try {
        const stored = localStorage.getItem(STORAGE_ID);
        if (stored) {
            // `recordedDurations` was persisted by older versions; the plot range is now derived from the parameters.
            const { recordedDurations: _legacy, graphPlayheadScrub: legacyScrub, ...parsed } = JSON.parse(stored) as Partial<AppSettings> & {
                recordedDurations?: unknown;
                graphPlayheadScrub?: unknown;
            };
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                panelSizes: getValidPanelSizes(parsed.panelSizes),
                expandedSections: parsed.expandedSections ?? DEFAULT_SETTINGS.expandedSections,
                visualizerDisplay: getValidVisualizerDisplay(parsed.visualizerDisplay),
                autoRecordResponse: getValidBoolean(parsed.autoRecordResponse, DEFAULT_SETTINGS.autoRecordResponse),
                returnToInitialPosition: getValidBoolean(parsed.returnToInitialPosition, DEFAULT_SETTINGS.returnToInitialPosition),
                showGraphPoints: getValidBoolean(parsed.showGraphPoints, DEFAULT_SETTINGS.showGraphPoints),
                graphClickToDrag: getValidClickToDrag(parsed.graphClickToDrag, legacyScrub),
                reactSpringParams: getValidEngineParams(engineDefinitions.spring, parsed.reactSpringParams),
                motionParams: getValidEngineParams(engineDefinitions.motion, parsed.motionParams),
                gsapParams: getValidEngineParams(engineDefinitions.gsap, parsed.gsapParams),
                heroPage: getValidHeroPage(parsed.heroPage),
            };
        }
    } catch (error) {
        console.error("Failed to load settings", error);
    }
    return {
        ...DEFAULT_SETTINGS,
        reactSpringParams: { ...springDefaults },
        motionParams: { ...motionDefaults },
        gsapParams: { ...gsapDefaults },
        heroPage: getValidHeroPage(),
    };
}

function getValidVisualizerDisplay(value: unknown): VisualizerDisplay {
    return value === "mechanical" || value === "graph" || value === "split" ? value : DEFAULT_SETTINGS.visualizerDisplay;
}

function getValidClickToDrag(value: unknown, legacyScrub?: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (legacyScrub === "grab") return true;
    if (legacyScrub === "hover") return false;
    return DEFAULT_SETTINGS.graphClickToDrag;
}

function getValidBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function getValidHeroPage(value?: unknown): HeroPageState {
    if (value != null) {
        return createInitialHeroPageState(parseHeroPageSettings(value));
    }
    return loadLegacyHeroPage() ?? createInitialHeroPageState(DEFAULT_HERO_PAGE_SETTINGS);
}

function loadLegacyHeroPage(): HeroPageState | undefined {
    try {
        const stored = localStorage.getItem(LEGACY_HERO_PAGE_STORAGE_ID);
        if (!stored) {
            return undefined;
        }
        const state = createInitialHeroPageState(parseHeroPageSettings(JSON.parse(stored)));
        localStorage.removeItem(LEGACY_HERO_PAGE_STORAGE_ID);
        return state;
    } catch (error) {
        console.error("Failed to migrate hero page settings", error);
        return undefined;
    }
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

export function openPage(page: AppPageId) {
    appSettings.heroPage.currentPage = page;
    appSettings.heroPage.lastViewedPage = page;
}

export function setShowHeroPage(show: boolean) {
    appSettings.heroPage.showHeroPage = show;
}
