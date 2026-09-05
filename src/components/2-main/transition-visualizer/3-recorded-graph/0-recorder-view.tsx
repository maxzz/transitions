import { useAtomValue } from "jotai";
import { activeDefinitionAtom } from "../state/atoms";
import { RecordedSvg } from "./1-recorded-svg";
import { GraphOptionsPopover } from "./2-graph-options-popover";

export function ResponseGraph() {
    return (
        <div className="relative h-full min-h-0 bg-muted/20 flex flex-col">
            <GraphHeader />
            <RecordedSvg />
        </div>
    );
}

function GraphHeader() {
    const definition = useAtomValue(activeDefinitionAtom);
    return (
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
            <div>
                <h2 className="text-sm font-semibold">
                    Recorded response
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {definition.label} · solver samples
                </p>
            </div>

            <GraphOptionsPopover />
        </div>
    );
}
