import { useRef, type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { classNames } from "@/utils/classnames";
import { PreviewModelSelector } from "./7-preview-model-selector";
import { visualizationModeAtom } from "../state/atoms";
import { MechanicalSpringScene } from "./2-1-1-preview-spring";
import { TranslatePreview } from "./2-1-2-preview-translate";
import { ScalePreview } from "./2-1-3-preview-scale";
import { RotatePreview } from "./2-1-4-preview-rotate";
import { OpacityPreview } from "./2-1-5-preview-opacity";
import { useEngineRun } from "./8-use-engine-run";
import { PreviewInfoOverlay } from "./9-preview-info-overlay";

export function PreviewStage() {
    const scopeRef = useRef<HTMLDivElement>(null);

    useEngineRun();

    return (
        <div ref={scopeRef} className="relative @container h-full min-h-0 bg-muted/20 flex flex-col">
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
            <PreviewInfoOverlay />
        </div>
    );
}

/**
 * Square stage sized from the nearest @container-size ancestor. Leave room below
 * the square when a toolbar sits under the model (`--preview-toolbar`).
 */
function PreviewCanvas({ className, children }: { className?: string; children: ReactNode; }) {
    return (
        <div className={classNames(canvasClasses, className)}>
            {children}
        </div>
    );
}

const canvasClasses = "\
relative \
w-[min(100cqw,calc(100cqh-var(--preview-toolbar,0px)))] aspect-square \
bg-muted/60 \
border-2 border-border \
rounded-xl \
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

