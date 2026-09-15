import { ButtonThemeToggle } from "./8-btn-theme-toggle";
import { PreviewSelectorTab } from "../2-main/transition-visualizer/0-all/1-2-tabs-preview-selector";
import hummingbird from "@/assets/icons/logo.svg";
import { EngineTabs } from "../2-main/transition-visualizer/0-all/1-1-tabs-engine";
import { AppLogoViewTransition, useAppPageNav } from "@/components/0-all/8-page-navigation";

export function Header() {
    const { navigatePage } = useAppPageNav();

    return (
        <header className="px-3 py-2 bg-background border-b border-border flex items-center justify-between">

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigatePage("hero")}
                    aria-label="Open hero page"
                >
                    <AppLogoViewTransition>
                        <img className="pt-px" src={hummingbird} alt="" width={24} height={24} />
                    </AppLogoViewTransition>

                    <div className="-ml-2 pt-0.5 text-md uppercase tracking-tight text-[#70a749] scale-y-60">
                        Transitions Visualizer
                    </div>
                </button>

                <EngineTabs />
            </div>

            <div className="flex items-center gap-2">
                <PreviewSelectorTab />

                <ButtonThemeToggle />
            </div>
        </header>
    );
}
