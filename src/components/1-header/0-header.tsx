import { useAtomValue } from "jotai";
import { ButtonThemeToggle } from "./8-btn-theme-toggle";
import { activeDefinitionAtom } from "../2-main/transition-visualizer/state/atoms";
import { PreviewSelectorTab } from "../2-main/transition-visualizer/0-all/1-tabs-preview-selector";

export function Header() {
    const definition = useAtomValue(activeDefinitionAtom);
    return (
        <header className="px-3 py-2 bg-background border-b border-border flex items-center justify-between">

            <div>
                {/* <p className="pb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Transition laboratory
            </p> */}
                <p className="pb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                    laboratory
                </p>


                <div className="flex items-center gap-2">
                    <span className="size-5 font-mono font-bold text-[10px] text-primary-foreground bg-primary rounded-md grid place-items-center">
                        TV
                    </span>

                    <div>
                        <span className="text-sm font-medium tracking-tight">
                            Transitions Visualizer
                        </span>
                    </div>
                </div>

                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
                    {definition.label} visualizer
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Tune native animation parameters, run the same mechanical response, and inspect the recorded curve.
                </p>

            </div>

            <div className="flex items-center gap-2">
                <PreviewSelectorTab />

                <ButtonThemeToggle />
            </div>
        </header>
    );
}
