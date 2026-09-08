import { type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { PanelInfoTooltip } from "@/ui/local-ui/7-info-tooltip";
import { type VisualizationMode } from "../model/9-types";
import { activeDefinitionAtom, runStatusAtom, visualizationModeAtom } from "../state/atoms";
import { MechanicalSpringScene } from "./2-1-1-preview-spring";
import { TranslatePreview } from "./2-1-2-preview-translate";
import { ScalePreview } from "./2-1-3-preview-scale";
import { RotatePreview } from "./2-1-4-preview-rotate";
import { OpacityPreview } from "./2-1-5-preview-opacity";
import { useEngineRun } from "./8-use-engine-run";

export function Panel_PreviewStage() {
    useEngineRun();

    return (
        <div className="relative h-full min-h-0 bg-muted/20 flex flex-col">
            <PreviewCanvas>
                <TransitionScene />
            </PreviewCanvas>

            <IconModelInfoTooltip />
        </div >
    );
}

/**
 * The pane is the size container; the square is `min(cqw, cqh)` of that pane.
 * Tokens use `cqmin` on the square itself — that resolves against the pane, which
 * is the same length as the square side, so a third wrapper is not needed.
 */
function PreviewCanvas({ children }: { children: ReactNode; }) {
    return (
        <div className={containerClasses}>
            <div className={canvasClasses}>
                {children}
            </div>
        </div>
    );
}

const containerClasses = "flex-1 min-h-0 @container-size overflow-hidden grid place-items-center";

const canvasClasses = "\
relative w-[min(100cqw,100cqh)] aspect-square \
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

//---------------------------------------------------------------------------

function IconModelInfoTooltip() {
    const definition = useAtomValue(activeDefinitionAtom);
    const visualizationMode = useAtomValue(visualizationModeAtom);
    const status = useAtomValue(runStatusAtom);
    const title = previewResponseTitle(visualizationMode);

    return (
        <div className="absolute top-1.5 right-1.5 z-10">
            <h2 className="sr-only">
                {title}
            </h2>

            <PanelInfoTooltip label={`${title} details`}>
                <span className="font-semibold">{title}</span>
                <span className="text-background/80">{definition.subtitle}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-background/80" role="status">
                    {status === "running" ? "Playing" : "Ready"}
                </span>
            </PanelInfoTooltip>
        </div>
    );
}

function previewResponseTitle(mode: VisualizationMode): string {
    if (mode === "spring") return "Mechanical response";
    if (mode === "translateY") return "Translation response";
    return `${mode[0].toUpperCase()}${mode.slice(1)} response`;
}
