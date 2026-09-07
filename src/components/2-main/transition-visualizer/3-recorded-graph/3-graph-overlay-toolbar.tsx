import { useAtomValue } from "jotai";
import { PanelInfoTooltip } from "../0-all/3-panel-info-tooltip";
import { activeDefinitionAtom } from "../state/atoms";
import { GraphOptionsPopover } from "./2-graph-options-popover";

export function GraphOverlayToolbar() {
    const definition = useAtomValue(activeDefinitionAtom);

    return (
        <div className="absolute top-1.5 right-1.5 flex items-center z-10">
            <h2 className="sr-only">
                Recorded response
            </h2>
            <PanelInfoTooltip label="Recorded response details">
                <span className="font-semibold">Recorded response</span>
                <span className="text-background/80">{definition.label} · solver samples</span>
            </PanelInfoTooltip>
            <GraphOptionsPopover />
        </div>
    );
}
