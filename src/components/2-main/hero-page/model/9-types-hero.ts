export type AppPageId = "hero" | "visualizer";

export interface HeroPageSettings {
    showHeroPage: boolean;
    lastViewedPage: AppPageId;
}

export interface HeroPageState extends HeroPageSettings {
    currentPage: AppPageId;
}
