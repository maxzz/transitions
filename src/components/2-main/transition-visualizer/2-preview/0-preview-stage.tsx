import { useRef, type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { classNames } from "@/utils/classnames";
import { visualizationModeAtom } from "../state/atoms";
import { MechanicalSpringScene } from "./2-1-1-preview-spring";
import { TranslatePreview } from "./2-1-2-preview-translate";
import { ScalePreview } from "./2-1-3-preview-scale";
import { RotatePreview } from "./2-1-4-preview-rotate";
import { OpacityPreview } from "./2-1-5-preview-opacity";
import { useEngineRun } from "./8-use-engine-run";
import { IconModelInfoTooltip } from "./4-info-tooltip";

export function PreviewStage() {
    const scopeRef = useRef<HTMLDivElement>(null);

    useEngineRun();

    return (
        <div ref={scopeRef} className="relative h-full min-h-0 bg-muted/20 flex flex-col">
            <div className="flex-1 min-h-0 @container-size overflow-hidden grid place-items-center">
                <PreviewCanvas>
                    <TransitionScene />
                </PreviewCanvas>
            </div>

            <IconModelInfoTooltip />
        </div>
    );
}

/** Square stage sized from the nearest @container-size ancestor. */
function PreviewCanvas({ className, children }: { className?: string; children: ReactNode; }) {
    return (
        <div className={classNames(canvasClasses, className)}>
            {children}
        </div>
    );
}

const canvasClasses = "\
relative \
w-[min(100cqw,100cqh)] aspect-square \
grid place-items-center \
";

function TransitionScene() {
    const mode = useAtomValue(visualizationModeAtom);

    switch (mode) {
        case "spring": return <MechanicalSpringScene />;
        case "translateY": return <TranslatePreview />;
        case "scale": return <ScalePreview />;
        case "rotate": return <RotatePreview />;
        case "opacity": return <OpacityPreview />;
    }
}

