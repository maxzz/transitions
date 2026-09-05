import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { EllipsisVertical } from "lucide-react";
import { appSettings } from "@/store/1-ui-settings";
import { cn } from "@/utils/classnames";
import { Button } from "@/ui/shadcn/button";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shadcn/popover";
import { formatDuration } from "../model/2-duration";
import { activeEngineAtom, runResultAtom } from "../state/atoms";
import { previewMotion } from "../state/preview-motion";
import { graphDataAtom, graphSamplesAtom, isRecordingAtom } from "./a-graph-atoms";

export function GraphOptionsPopover() {
    const samples = useAtomValue(graphSamplesAtom);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="icon-sm" variant="ghost" aria-label="Graph options" title="Graph options">
                    <EllipsisVertical />
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-48">
                <AutoRecordControl />
                <ShowPointsControl />
                <span className="px-2.5 py-1 w-full font-mono tabular-nums text-[10px] text-muted-foreground text-center bg-background border border-border rounded-full">
                    {samples.length} points
                </span>
                <div className="-mx-2.5 h-px bg-border" role="separator" />
                <GraphStats />
            </PopoverContent>
        </Popover>
    );
}

function GraphStats() {
    const result = useAtomValue(runResultAtom);
    const engineId = useAtomValue(activeEngineAtom);
    const recording = useAtomValue(isRecordingAtom);
    const graph = useAtomValue(graphDataAtom);
    const { elapsedMs: liveElapsedMs } = useSnapshot(previewMotion);

    const overshoot = graph.hasCurve ? Math.max(0, graph.bounds.maxValue - 1) : 0;
    const durationLabel = recording
        ? "elapsed"
        : result?.stopped
            ? "stopped at"
            : engineId === "gsap"
                ? "duration"
                : "settled in";
    const durationValue = recording
        ? formatDuration(liveElapsedMs)
        : graph.hasCurve && result
            ? formatDuration(result.durationMs)
            : "—";

    return (
        <div className="grid grid-cols-2 gap-2">
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

export function RecordingIndicator({ recording }: { recording: boolean; }) {
    return (
        <div
            className={cn("absolute top-1/2 right-full -translate-y-1/2 mr-2 h-6 flex items-center gap-1.5 pointer-events-none", !recording && "invisible")}
            role="status"
            aria-live="polite"
            aria-hidden={!recording}
        >
            <span className={cn("shrink-0 size-2 bg-red-500 rounded-full", recording && "animate-rec-blink motion-reduce:animate-none")} />
            <span className="font-medium text-[10px] text-red-500 tracking-wide">
                playing
            </span>
        </div>
    );
}

function AutoRecordControl() {
    const { autoRecordResponse } = useSnapshot(appSettings);

    return (
        <Label className="h-6 w-full flex items-center gap-2" title="Replay whenever transition parameters change">
            <Checkbox
                checked={autoRecordResponse}
                onCheckedChange={(checked) => { appSettings.autoRecordResponse = checked === true; }}
            />
            <div>Auto-update</div>
        </Label>
    );
}

function ShowPointsControl() {
    const { showGraphPoints } = useSnapshot(appSettings);

    return (
        <Label className="h-6 w-full flex items-center gap-2" title="Mark every recorded frame on the curve">
            <Checkbox
                checked={showGraphPoints}
                onCheckedChange={(checked) => { appSettings.showGraphPoints = checked === true; }}
            />
            <div>Points</div>
        </Label>
    );
}
