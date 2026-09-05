import { type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { classNames } from "@/utils/classnames";
import { appSettings } from "@/store/1-ui-settings";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shadcn/popover";

import { formatDuration } from "../model/2-duration";
import { activeEngineAtom, runResultAtom } from "../state/atoms";
import { previewMotion } from "../state/preview-motion";
import { graphDataAtom, graphSamplesAtom, isRecordingAtom } from "./a-graph-atoms";

export function GraphOptionsPopover() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="icon-sm" variant="ghost" aria-label="Graph options" title="Graph options">
                    <EllipsisVertical />
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-48">
                <section className="flex flex-col gap-2.5">
                    <SectionHeader>Graph settings</SectionHeader>
                    <ShowPointsControl />
                    <GraphStats />
                </section>
            </PopoverContent>
        </Popover>
    );
}

function GraphStats() {
    const samples = useAtomValue(graphSamplesAtom);
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
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5">
            <StatCell label="points" value={String(samples.length)} />
            <Separator />
            <StatCell label={durationLabel} value={durationValue} />
            <StatCell label="min" value={graph.hasCurve ? graph.bounds.minValue.toFixed(3) : "—"} />
            <StatCell label="max" value={graph.hasCurve ? graph.bounds.maxValue.toFixed(3) : "—"} />
            <StatCell label="overshoot" value={graph.hasCurve ? overshoot.toFixed(3) : "—"} />
        </div>
    );
}

function SectionHeader({ children }: { children: ReactNode; }) {
    return (
        <h3 className="text-xs font-medium">
            {children}
        </h3>
    );
}

function Separator({ className }: { className?: string; }) {
    return <div className={classNames("col-span-2 h-px bg-border", className)} role="separator" />;
}

function StatCell({ label, value }: { label: string; value: string; }) {
    return (
        <div className="col-span-2 min-w-0 grid grid-cols-subgrid items-baseline">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                {label}
            </span>
            <span className="text-xs font-mono tabular-nums text-foreground text-right truncate">
                {value}
            </span>
        </div>
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
