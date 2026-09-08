import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { PanelInfoTooltip } from "@/ui/local-ui/7-info-tooltip";
import { useResizeObserver } from "@/utils/util-hooks/use-resize-observer";
import { buildGraphPlot, getGraphSize } from "../model/5-graph-plot";
import { activeDefinitionAtom } from "../state/atoms";
import { RecordedSvg } from "./1-0-recorded-svg";
import { GraphOptionsPopover } from "./2-graph-options-popover";
import { graphDataAtom } from "./a-graph-atoms";

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

/**
 * The plot box is sized from the graph pane (`cqi`/`cqb`), then measured so the
 * SVG viewBox matches that container. Tick labels scale with the same container.
 */
function RecordedView() {
    const { ref, width, height } = useResizeObserver<HTMLDivElement>({ round: Math.floor });
    const data = useAtomValue(graphDataAtom);
    const definition = useAtomValue(activeDefinitionAtom);
    const { showGraphPoints } = useSnapshot(appSettings);

    const plot = useMemo(
        () => {
            const size = getGraphSize(width, height);
            return size ? buildGraphPlot(data, size) : null;
        },
        [data, width, height]);

    return (
        <div className="flex-1 p-[clamp(0.25rem,1.2cqi,0.5rem)] min-h-0 @container-size overflow-hidden grid place-items-center">
            <div className="w-[100cqi] h-[min(100cqb,90cqi)] [--graph-label:clamp(0.6rem,2.4cqi,0.75rem)]" ref={ref}>
                {plot && (
                    <RecordedSvg
                        plot={plot}
                        samples={data.samples}
                        showGraphPoints={showGraphPoints}
                        title={definition.label}
                    />
                )}
            </div>
        </div>
    );
}
