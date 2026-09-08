import { useAtomValue } from "jotai";
import { RecordedView } from "./1-recorded-svg";
import { activeDefinitionAtom } from "../state/atoms";
import { GraphOptionsPopover } from "./2-graph-options-popover";
import { PanelInfoTooltip } from "@/ui/local-ui/7-info-tooltip";

export function Panel_ResponseGraph() {
    return (
        <div className="relative h-full min-h-0 @container-size bg-muted/20 flex flex-col">
            <RecordedView />
            <InfoToolbar />
        </div>
    );
}

function InfoToolbar() {
    const definition = useAtomValue(activeDefinitionAtom);

    return (
        <div className="absolute top-1.5 right-1.5 flex items-center z-10">
            <h2 className="sr-only">
                Recorded response
            </h2>

            <GraphOptionsPopover />
            <PanelInfoTooltip label="Recorded response details">
                <span className="font-semibold">Recorded response</span>
                <span className="text-background/80">{definition.label} · solver samples</span>
            </PanelInfoTooltip>
        </div>
    );
}
