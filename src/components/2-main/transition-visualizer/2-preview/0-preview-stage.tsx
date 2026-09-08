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

/**
 * Square stage from the pane's size container, then a nested size container so
 * strokes, type, and gaps scale with `cqmin` of the square — not the window.
 */
function PreviewCanvas({ className, children }: { className?: string; children: ReactNode; }) {
    return (
        <div className={classNames(canvasClasses, className)}>
            <div className={canvasUiClasses}>
                {children}
            </div>
        </div>
    );
}

const canvasClasses = "\
relative \
w-[min(100cqw,100cqh)] aspect-square \
@container-size \
";

const canvasUiClasses = "\
size-full \
[--preview-stroke:clamp(1.5px,0.95cqmin,3px)] \
[--preview-stroke-thick:clamp(2px,1.5cqmin,5px)] \
[--preview-label:clamp(0.7rem,5.5cqmin,1.25rem)] \
[--preview-pad:clamp(0.2rem,1.8cqmin,0.75rem)] \
[--preview-gap:clamp(0.4rem,3.5cqmin,1.5rem)] \
[--preview-legend:clamp(1.15rem,7cqmin,2.5rem)] \
[--preview-marker:clamp(2.5rem,14cqmin,5rem)] \
[--preview-radius:clamp(0.4rem,3.2cqmin,1.25rem)] \
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
