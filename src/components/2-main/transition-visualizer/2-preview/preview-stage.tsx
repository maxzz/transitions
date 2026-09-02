import { useRef } from "react";
import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { StopMotionButton } from "../1-controls/stop-motion-button";
import { VisualizationModeControl } from "../1-controls/visualization-mode-control";
import {
    activeDefinitionAtom,
    activeEngineAtom,
    paramsByEngineAtom,
    runStatusAtom,
    visualizationModeAtom,
} from "../state/atoms";
import type { MechanicalSpringHandle } from "./mechanical-spring";
import { TransitionScene } from "./transition-scene";
import { useEngineRun } from "./use-engine-run";

export function PreviewStage() {
    const scopeRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<MechanicalSpringHandle>(null);
    const { returnToInitialPosition } = useSnapshot(appSettings);
    const definition = useAtomValue(activeDefinitionAtom);
    const engineId = useAtomValue(activeEngineAtom);
    const params = useAtomValue(paramsByEngineAtom);
    const status = useAtomValue(runStatusAtom);
    const visualizationMode = useAtomValue(visualizationModeAtom);
    const clamped = engineId === "spring" && params.spring.clamp;
    const activeParams = params[engineId];
    const mass = "mass" in activeParams ? activeParams.mass : undefined;
    const tension = "tension" in activeParams
        ? activeParams.tension
        : "stiffness" in activeParams
            ? activeParams.stiffness
            : undefined;
    const title = visualizationMode === "spring"
        ? "Mechanical response"
        : `${visualizationMode === "translateY" ? "Translation" : visualizationMode[0].toUpperCase() + visualizationMode.slice(1)} response`;

    useEngineRun(scopeRef, sceneRef);

    return (
        <div ref={scopeRef} className="h-full min-h-0 bg-muted/20 flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{definition.subtitle}</p>
                </div>
                <div
                    className="px-2.5 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider bg-background border border-border rounded-full"
                    role="status"
                >
                    {status === "running" ? "Recording" : "Ready"}
                </div>
            </div>
            <div className="p-3 min-h-0 sm:p-6 flex-1">
                <TransitionScene ref={sceneRef} clamped={clamped} mass={mass} tension={tension} />
            </div>
            <div className="p-2 bg-muted/20 border-t border-border flex flex-wrap items-center justify-center gap-2">
                <VisualizationModeControl />
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
                <StopMotionButton />
            </div>
        </div>
    );
}
