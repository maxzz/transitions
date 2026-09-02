import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { cn } from "@/utils/classnames";
import { formatDuration } from "../model/duration";
import { activeDefinitionAtom, activeEngineAtom, runResultAtom } from "../state/atoms";
import { graphAtom, graphSamplesAtom, isRecordingAtom } from "./a-graph-atoms";
import { ResponsePlot } from "./response-plot";

export function ResponseGraph() {
    const definition = useAtomValue(activeDefinitionAtom);
    const recording = useAtomValue(isRecordingAtom);
    const samples = useAtomValue(graphSamplesAtom);

    return (
        <div className="relative h-full min-h-0 bg-muted/20 flex flex-col">
            <RecordingIndicator recording={recording} />
            <div className="py-4 pl-5 pr-28 border-b border-border flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold">Recorded response</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {definition.label} · native frame samples
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <AutoRecordControl />
                    <span className="px-2.5 py-1 font-mono text-[10px] text-muted-foreground bg-background border border-border rounded-full">
                        {samples.length} points
                    </span>
                </div>
            </div>

            <ResponsePlot />
            <GraphStats />
        </div>
    );
}

function GraphStats() {
    const result = useAtomValue(runResultAtom);
    const engineId = useAtomValue(activeEngineAtom);
    const recording = useAtomValue(isRecordingAtom);
    const graph = useAtomValue(graphAtom);

    const overshoot = graph.hasCurve ? Math.max(0, graph.bounds.maxValue - 1) : 0;
    const durationLabel = result?.stopped
        ? "stopped after"
        : engineId === "gsap"
            ? "fixed duration"
            : "settled after";
    const durationValue = recording
        ? formatDuration(graph.elapsedMs)
        : graph.hasCurve && result
            ? formatDuration(result.durationMs)
            : "—";

    return (
        <div className="px-5 py-3 font-mono text-[11px] text-muted-foreground bg-background sm:grid-cols-4 border-t border-border grid grid-cols-2 gap-3">
            <span>{recording ? "elapsed" : durationLabel}: {durationValue}</span>
            <span>min: {graph.hasCurve ? graph.bounds.minValue.toFixed(3) : "—"}</span>
            <span>max: {graph.hasCurve ? graph.bounds.maxValue.toFixed(3) : "—"}</span>
            <span>overshoot: {graph.hasCurve ? overshoot.toFixed(3) : "—"}</span>
        </div>
    );
}

function RecordingIndicator({ recording }: { recording: boolean }) {
    return (
        <div
            className={cn(
                "absolute top-3.5 right-5 h-6 flex items-center gap-1.5 z-10 pointer-events-none",
                !recording && "invisible",
            )}
            role="status"
            aria-live="polite"
            aria-hidden={!recording}
        >
            <span
                className={cn(
                    "shrink-0 size-2 bg-red-500 rounded-full",
                    recording && "animate-rec-blink motion-reduce:animate-none",
                )}
            />
            <span className="font-medium text-[10px] text-red-500 tracking-wide">
                recording
            </span>
        </div>
    );
}

function AutoRecordControl() {
    const { autoRecordResponse } = useSnapshot(appSettings);

    return (
        <div className="h-6 flex items-center gap-2" title="Replay and record whenever transition parameters change">
            <Checkbox
                id="auto-record-response"
                checked={autoRecordResponse}
                onCheckedChange={(checked) => {
                    appSettings.autoRecordResponse = checked === true;
                }}
            />
            <Label htmlFor="auto-record-response">Auto-update</Label>
        </div>
    );
}
