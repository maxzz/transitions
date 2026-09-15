import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ViewTransition, addTransitionType, startTransition } from "react";
import { appSettings, openPage } from "@/store/1-ui-settings";
import { type AppPageId } from "@/components/2-main/hero-page/model/9-types-hero";

const NAV_FORWARD = "nav-forward";
const NAV_BACK = "nav-back";
const APP_LOGO_VT_NAME = "app-logo";

const pageEnterClass = {
    [NAV_FORWARD]: "nav-enter-forward",
    [NAV_BACK]: "nav-enter-back",
    default: "none",
} as const;

const pageExitClass = {
    [NAV_FORWARD]: "nav-exit-forward",
    [NAV_BACK]: "nav-exit-back",
    default: "none",
} as const;

let skipHeroEnterMotion = false;

export function shouldSkipHeroEnterMotion() {
    return skipHeroEnterMotion;
}

type AppPageNav = {
    currentPage: AppPageId;
    navigatePage: (page: AppPageId) => void;
};

const AppPageNavContext = createContext<AppPageNav | null>(null);

export function AppPageNavProvider({ children }: { children: ReactNode; }) {
    const [currentPage, setCurrentPage] = useState<AppPageId>(() => appSettings.heroPage.currentPage);

    const navigatePage = useCallback(
        (page: AppPageId) => {
            if (appSettings.heroPage.currentPage === page) {
                return;
            }

            if (page === "hero") {
                skipHeroEnterMotion = true;
            }

            openPage(page);

            startTransition(() => {
                addTransitionType(page === "hero" ? NAV_BACK : NAV_FORWARD);
                setCurrentPage(page);
            });
        },
        []);

    const value = useMemo(
        () => ({ currentPage, navigatePage }),
        [currentPage, navigatePage]);

    return (
        <AppPageNavContext.Provider value={value}>
            {children}
        </AppPageNavContext.Provider>
    );
}

export function useAppPageNav() {
    const value = useContext(AppPageNavContext);
    if (!value) {
        throw new Error("useAppPageNav must be used within AppPageNavProvider");
    }
    return value;
}

export function AppPageViewTransition({ children }: { children: ReactNode; }) {
    const { currentPage } = useAppPageNav();

    return (
        <ViewTransition
            key={currentPage}
            default="none"
            enter={pageEnterClass}
            exit={pageExitClass}
        >
            {children}
        </ViewTransition>
    );
}

export function AppLogoViewTransition({ children }: { children: ReactNode; }) {
    return (
        <ViewTransition name={APP_LOGO_VT_NAME} share="logo-morph" default="none">
            {children}
        </ViewTransition>
    );
}
