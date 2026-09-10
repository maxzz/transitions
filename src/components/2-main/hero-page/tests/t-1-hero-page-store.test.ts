import { describe, expect, it } from "vitest";
import { type HeroPageSettings } from "../model/2-types";
import {
    DEFAULT_HERO_PAGE_SETTINGS,
    createInitialHeroPageState,
    parseHeroPageSettings,
    resolveLaunchPage,
} from "../model/4-hero-page-settings";

describe("parseHeroPageSettings", () => {
    it("falls back to first-launch defaults", () => {
        expect(parseHeroPageSettings(null)).toEqual(DEFAULT_HERO_PAGE_SETTINGS);
        expect(parseHeroPageSettings({ showHeroPage: "yes", lastViewedPage: "home" })).toEqual(DEFAULT_HERO_PAGE_SETTINGS);
    });

    it("keeps a valid persisted pair", () => {
        const stored: HeroPageSettings = { showHeroPage: false, lastViewedPage: "visualizer" };
        expect(parseHeroPageSettings(stored)).toEqual(stored);
    });
});

describe("resolveLaunchPage", () => {
    it("shows the hero on a first launch", () => {
        expect(resolveLaunchPage(DEFAULT_HERO_PAGE_SETTINGS)).toBe("hero");
    });

    it("restores the last viewed page after the hero is opted out", () => {
        expect(resolveLaunchPage({ showHeroPage: false, lastViewedPage: "visualizer" })).toBe("visualizer");
    });

    it("never restores the hero once it has been opted out", () => {
        expect(resolveLaunchPage({ showHeroPage: false, lastViewedPage: "hero" })).toBe("visualizer");
    });
});

describe("createInitialHeroPageState", () => {
    it("keeps lastViewedPage when the hero is shown again", () => {
        expect(createInitialHeroPageState({ showHeroPage: true, lastViewedPage: "visualizer" })).toEqual({
            showHeroPage: true,
            lastViewedPage: "visualizer",
            currentPage: "hero",
        });
    });

    it("writes the skipped hero away from lastViewedPage", () => {
        expect(createInitialHeroPageState({ showHeroPage: false, lastViewedPage: "hero" })).toEqual({
            showHeroPage: false,
            lastViewedPage: "visualizer",
            currentPage: "visualizer",
        });
    });
});
