import { ButtonThemeToggle } from "./8-btn-theme-toggle";

export function Header() {
    return (
        <header className="px-3 py-2 bg-background border-b border-border flex items-center justify-between">

            {/* <p className="pb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Transition laboratory
            </p> */}


            <div className="flex items-center gap-2">
                <span className="size-5 font-mono font-bold text-[10px] text-primary-foreground bg-primary rounded-md grid place-items-center">
                    TL
                </span>

                <div>
                    <span className="text-sm font-medium tracking-tight">
                        Transitions Visualizer
                    </span>
                </div>
            </div>


            <div className="flex items-center gap-2">
                <ButtonThemeToggle />
            </div>
        </header>
    );
}
