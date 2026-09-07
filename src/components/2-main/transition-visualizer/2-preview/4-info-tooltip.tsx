import { useAtomValue } from "jotai";
import { PanelInfoTooltip } from "../../../../ui/local-ui/7-info-tooltip";
import { type VisualizationMode } from "../model/9-types";
import { activeDefinitionAtom, runStatusAtom, visualizationModeAtom } from "../state/atoms";

export function IconModelInfoTooltip() {
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
