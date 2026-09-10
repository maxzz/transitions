import { type AppPageId, type HeroPageSettings, type HeroPageState } from "./2-types";

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
