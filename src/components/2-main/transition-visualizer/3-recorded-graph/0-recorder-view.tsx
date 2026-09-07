import { RecordedSvg } from "./1-recorded-svg";
import { GraphOverlayToolbar } from "./3-graph-overlay-toolbar";

export function ResponseGraph() {
    return (
        <div className="relative h-full min-h-0 bg-muted/20 flex flex-col">
            <RecordedSvg />
            <GraphOverlayToolbar />
        </div>
    );
}
