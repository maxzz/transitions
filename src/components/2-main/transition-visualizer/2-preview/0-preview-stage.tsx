import { forwardRef, useRef } from "react";
import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { StopMotionButton } from "../1-controls/stop-motion-button";
import { VisualizationModeControl } from "../1-controls/visualization-mode-control";
import { activeDefinitionAtom, activeEngineAtom, paramsByEngineAtom, runStatusAtom, visualizationModeAtom } from "../state/atoms";
import { MechanicalSpring, type MechanicalSpringHandle } from "./2-mechanical-spring-svg";
import { TransformPreview } from "./3-transform-preview-svg";
import { useEngineRun } from "./8-use-engine-run";

export function PreviewStage() {
    const scopeRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<MechanicalSpringHandle>(null);

    const engineId = useAtomValue(activeEngineAtom);
    const params = useAtomValue(paramsByEngineAtom);
    const clamped = engineId === "spring" && params.spring.clamp;
    const activeParams = params[engineId];
    const mass = "mass" in activeParams ? activeParams.mass : undefined;
    const tension = "tension" in activeParams ? activeParams.tension : "stiffness" in activeParams ? activeParams.stiffness : undefined;

    useEngineRun(scopeRef, sceneRef);

    return (
        <div ref={scopeRef} className="h-full min-h-0 bg-muted/20 flex flex-col">
            <PreviewHeader />

            <div className="flex-1 p-3 min-h-0 sm:p-6">
                <TransitionScene ref={sceneRef} clamped={clamped} mass={mass} tension={tension} />
            </div>

            <div className="p-2 bg-muted/20 border-t border-border flex flex-wrap items-center justify-center gap-2">
                <VisualizationModeControl />
                <ReturnToInitialPosition />
                <StopMotionButton />
            </div>
        </div>
    );
}

function ReturnToInitialPosition() {
    const { returnToInitialPosition } = useSnapshot(appSettings);

    return (
        <div
            className="px-2 h-7 flex items-center gap-2"
            title="Return the preview to its starting position one second after the animation finishes"
        >
            <Checkbox
                id="return-to-initial-position"
                checked={returnToInitialPosition}
                onCheckedChange={(checked) => {
                    appSettings.returnToInitialPosition = checked === true;
                }}
            />
            <Label htmlFor="return-to-initial-position">Return to initial position</Label>
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
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{definition.subtitle}</p>
            </div>
            <RunStatusBadge />
        </div>
    );
}

function RunStatusBadge() {
    const status = useAtomValue(runStatusAtom);

    return (
        <div className="px-2.5 py-1 font-mono text-[10px] text-muted-foreground bg-background border border-border rounded-full uppercase tracking-wider" role="status">
            {status === "running" ? "Recording" : "Ready"}
        </div>
    );
}

const TransitionScene = forwardRef<MechanicalSpringHandle, { clamped?: boolean; mass?: number; tension?: number; }>(function TransitionScene({ clamped = false, mass, tension }, ref) {
    const mode = useAtomValue(visualizationModeAtom);

    return mode === "spring"
        ? <MechanicalSpring ref={ref} clamped={clamped} mass={mass} tension={tension} />
        : <TransformPreview key={mode} ref={ref} mode={mode} />;
});

