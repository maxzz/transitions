import { useRef } from "react";
import { useAtomValue } from "jotai";
import { PreviewModelSelector } from "./7-preview-model-selector";
import { activeDefinitionAtom, runStatusAtom, visualizationModeAtom } from "../state/atoms";
import { PreviewCanvas } from "./1-preview-frame";
import { MechanicalSpringScene } from "./2-1-1-preview-spring";
import { TranslatePreview } from "./2-1-2-preview-translate";
import { ScalePreview } from "./2-1-3-preview-scale";
import { RotatePreview } from "./2-1-4-preview-rotate";
import { OpacityPreview } from "./2-1-5-preview-opacity";
import { useEngineRun } from "./8-use-engine-run";

export function PreviewStage() {
    const scopeRef = useRef<HTMLDivElement>(null);

    useEngineRun();

    return (
        <div ref={scopeRef} className="@container h-full min-h-0 bg-muted/20 flex flex-col">
            <PreviewHeader />

            <div className="flex-1 p-3 min-h-0 sm:p-6 [--stage-toolbar-scale:min(1,100cqi/240px)] [--preview-toolbar:calc(2.75rem*var(--stage-toolbar-scale))] @container-size overflow-hidden grid place-items-center">
                <div className="flex flex-col items-center gap-2">
                    <PreviewCanvas>
                        <TransitionScene />
                    </PreviewCanvas>

                    <div className="zoom-(--stage-toolbar-scale,1)">
                        <PreviewModelSelector />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PreviewHeader() {
    const definition = useAtomValue(activeDefinitionAtom);
    const visualizationMode = useAtomValue(visualizationModeAtom);
    const title = visualizationMode === "spring"
        ? "Mechanical response"
        : `${visualizationMode === "translateY" ? "Translation" : visualizationMode[0].toUpperCase() + visualizationMode.slice(1)} response`;

    return (
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
            <div>
                <h2 className="text-sm font-semibold">
                    {title}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {definition.subtitle}
                </p>
            </div>

            <RunStatusBadge />
        </div>
    );
}

function RunStatusBadge() {
    const status = useAtomValue(runStatusAtom);

    return (
        <div className="px-2.5 py-1 font-mono text-[10px] text-muted-foreground bg-background border border-border rounded-full uppercase tracking-wider" role="status">
            {status === "running" ? "Playing" : "Ready"}
        </div>
    );
}

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

