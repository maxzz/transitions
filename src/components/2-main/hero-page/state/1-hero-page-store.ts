import { proxy, subscribe } from "valtio";
import { type AppPageId, type HeroPageSettings, type HeroPageState } from "../model/2-types";

export const HERO_PAGE_STORAGE_ID = "tm-hero-page__v1";

export const DEFAULT_HERO_PAGE_SETTINGS: HeroPageSettings = {
    showHeroPage: true,
    lastViewedPage: "hero",
};

export function isAppPageId(value: unknown): value is AppPageId {
    return value === "hero" || value === "visualizer";
}

export function parseHeroPageSettings(raw: unknown): HeroPageSettings {
    const parsed = raw && typeof raw === "object" ? raw as Partial<HeroPageSettings> : {};

    return {
        showHeroPage: typeof parsed.showHeroPage === "boolean" ? parsed.showHeroPage : DEFAULT_HERO_PAGE_SETTINGS.showHeroPage,
        lastViewedPage: isAppPageId(parsed.lastViewedPage) ? parsed.lastViewedPage : DEFAULT_HERO_PAGE_SETTINGS.lastViewedPage,
    };
}

export function resolveLaunchPage(settings: HeroPageSettings): AppPageId {
    if (settings.showHeroPage) {
        return "hero";
    }
    return settings.lastViewedPage === "hero" ? "visualizer" : settings.lastViewedPage;
}

export function createInitialHeroPageState(loaded: HeroPageSettings): HeroPageState {
    const currentPage = resolveLaunchPage(loaded);
    return {
        showHeroPage: loaded.showHeroPage,
        lastViewedPage: currentPage === "hero" ? loaded.lastViewedPage : currentPage,
        currentPage,
    };
}

function loadHeroPageSettings(): HeroPageSettings {
    try {
        const stored = localStorage.getItem(HERO_PAGE_STORAGE_ID);
        if (stored) {
            return parseHeroPageSettings(JSON.parse(stored));
        }
    } catch (error) {
        console.error("Failed to load hero page settings", error);
    }
    return { ...DEFAULT_HERO_PAGE_SETTINGS };
}

function persistHeroPageSettings(state: HeroPageState) {
    try {
        const payload: HeroPageSettings = {
            showHeroPage: state.showHeroPage,
            lastViewedPage: state.lastViewedPage,
        };
        localStorage.setItem(HERO_PAGE_STORAGE_ID, JSON.stringify(payload));
    } catch (error) {
        console.error("Failed to save hero page settings", error);
    }
}

const loadedSettings = loadHeroPageSettings();
const initialState = createInitialHeroPageState(loadedSettings);

export const heroPageStore = proxy<HeroPageState>(initialState);

persistHeroPageSettings(heroPageStore);

subscribe(heroPageStore, () => {
    persistHeroPageSettings(heroPageStore);
});

export function openPage(page: AppPageId) {
    heroPageStore.currentPage = page;
    heroPageStore.lastViewedPage = page;
}

export function setShowHeroPage(show: boolean) {
    heroPageStore.showHeroPage = show;
}
