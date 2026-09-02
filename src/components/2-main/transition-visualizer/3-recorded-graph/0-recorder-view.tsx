import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { cn } from "@/utils/classnames";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { formatDuration } from "../model/2-duration";
import { activeDefinitionAtom, activeEngineAtom, runResultAtom } from "../state/atoms";
import { graphDataAtom, graphSamplesAtom, isRecordingAtom } from "./a-graph-atoms";
import { RecordedSvg } from "./1-recorded-svg";

export function ResponseGraph() {
    const recording = useAtomValue(isRecordingAtom);

    return (
        <div className="relative h-full min-h-0 bg-muted/20 flex flex-col">
            <RecordingIndicator recording={recording} />
            <GraphHeader />
            <RecordedSvg />
            <GraphButtomStats />
        </div>
    );
}

function GraphHeader() {
    const definition = useAtomValue(activeDefinitionAtom);
    const samples = useAtomValue(graphSamplesAtom);

    return (
        <div className="py-4 pl-5 pr-28 border-b border-border flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="text-sm font-semibold">Recorded response</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {definition.label} · native frame samples
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
                <AutoRecordControl />
                <span className="px-2.5 py-1 min-w-[5.5rem] font-mono tabular-nums text-[10px] text-muted-foreground text-center bg-background border border-border rounded-full">
                    {samples.length} points
                </span>
            </div>
        </div>
    );
}

function RecordingIndicator({ recording }: { recording: boolean; }) {
    return (
        <div
            className={cn("absolute top-3.5 right-5 h-6 flex items-center gap-1.5 z-10 pointer-events-none", !recording && "invisible")}
            role="status"
            aria-live="polite"
            aria-hidden={!recording}
        >
            <span className={cn("shrink-0 size-2 bg-red-500 rounded-full", recording && "animate-rec-blink motion-reduce:animate-none")} />
            <span className="font-medium text-[10px] text-red-500 tracking-wide">
                recording
            </span>
        </div>
    );
}

function AutoRecordControl() {
    const { autoRecordResponse } = useSnapshot(appSettings);

    return (
        <Label className="h-6 flex items-center gap-2" title="Replay and record whenever transition parameters change">
            <Checkbox
                checked={autoRecordResponse}
                onCheckedChange={(checked) => { appSettings.autoRecordResponse = checked === true; }}
            />
            <div>Auto-update</div>
        </Label>
    );
}

function GraphButtomStats() {
    const result = useAtomValue(runResultAtom);
    const engineId = useAtomValue(activeEngineAtom);
    const recording = useAtomValue(isRecordingAtom);
    const graph = useAtomValue(graphDataAtom);

    const overshoot = graph.hasCurve ? Math.max(0, graph.bounds.maxValue - 1) : 0;
    const durationLabel = recording
        ? "elapsed"
        : result?.stopped
            ? "stopped at"
            : engineId === "gsap"
                ? "duration"
                : "settled in";
    const durationValue = recording
        ? formatDuration(graph.elapsedMs)
        : graph.hasCurve && result
            ? formatDuration(result.durationMs)
            : "—";

    // Two fixed lines per cell (label above value) so that changing text never wraps and shifts the chart above.
    return (
        <div className="px-5 py-2.5 bg-background border-t border-border grid grid-cols-4 gap-3">
            <StatCell label={durationLabel} value={durationValue} />
            <StatCell label="min" value={graph.hasCurve ? graph.bounds.minValue.toFixed(3) : "—"} />
            <StatCell label="max" value={graph.hasCurve ? graph.bounds.maxValue.toFixed(3) : "—"} />
            <StatCell label="overshoot" value={graph.hasCurve ? overshoot.toFixed(3) : "—"} />
        </div>
    );
}

function StatCell({ label, value }: { label: string; value: string; }) {
    return (
        <div className="min-w-0 flex flex-col">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                {label}
            </span>
            <span className="text-xs font-mono tabular-nums text-foreground truncate">
                {value}
            </span>
        </div>
    );
}
