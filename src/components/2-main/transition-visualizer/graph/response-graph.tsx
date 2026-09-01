import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { cn } from "@/utils/classnames";
import { estimateDurationMs, formatDuration } from "../model/duration";
import { getSampleBounds } from "../model/samples";
import {
    activeDefinitionAtom,
    activeEngineAtom,
    activeParamsAtom,
    expectedDurationMsAtom,
    liveSamplesAtom,
    runResultAtom,
    runStatusAtom,
} from "../state/atoms";

const WIDTH = 760;
const HEIGHT = 440;
const LEFT = 58;
const RIGHT = 24;
const TOP = 32;
const BOTTOM = 54;
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;
const POINT_RADIUS = 10;
const POINT_STROKE = 2.5;
const EMPTY_BOUNDS = { durationMs: 0, minValue: 0, maxValue: 1 };

export function ResponseGraph() {
    const result = useAtomValue(runResultAtom);
    const liveSamples = useAtomValue(liveSamplesAtom);
    const expectedDurationMs = useAtomValue(expectedDurationMsAtom);
    const status = useAtomValue(runStatusAtom);
    const definition = useAtomValue(activeDefinitionAtom);
    const engineId = useAtomValue(activeEngineAtom);
    const params = useAtomValue(activeParamsAtom);
    const recording = status === "running";
    const samples = recording ? liveSamples : result?.samples ?? [];

    const graph = useMemo(() => {
        const bounds = samples.length > 0 ? getSampleBounds(samples) : EMPTY_BOUNDS;
        const elapsedMs = samples.at(-1)?.elapsedMs ?? 0;
        const duration = recording
            ? Math.max(expectedDurationMs, elapsedMs, 1)
            : result
                ? Math.max(result.plotDurationMs ?? result.durationMs, 1)
                : Math.max(estimateDurationMs(engineId, params), 1);
        const valueRange = bounds.maxValue - bounds.minValue;
        const pad = Math.max(valueRange * 0.12, 0.08);
        const minValue = bounds.minValue - pad;
        const maxValue = bounds.maxValue + pad;
        const toX = (elapsed: number) => LEFT + (elapsed / duration) * PLOT_WIDTH;
        const toY = (value: number) => TOP + ((maxValue - value) / (maxValue - minValue)) * PLOT_HEIGHT;
        const points = samples.map((sample) => ({
            x: toX(sample.elapsedMs),
            y: toY(sample.value),
        }));
        const line = points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
        const area = points.length > 0
            ? `M ${points[0].x} ${TOP + PLOT_HEIGHT} L ${points.map(({ x, y }) => `${x} ${y}`).join(" L ")} L ${points.at(-1)!.x} ${TOP + PLOT_HEIGHT} Z`
            : "";

        return { bounds, toY, line, area, points, hasCurve: points.length > 0, duration, elapsedMs };
    }, [engineId, expectedDurationMs, params, recording, result, samples]);

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

            <div className="p-3 min-h-0 sm:p-6 flex-1">
                <svg
                    className="h-full w-full"
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    role="img"
                    aria-labelledby="response-graph-title response-graph-description"
                >
                    <title id="response-graph-title">{definition.label} transition response graph</title>
                    <desc id="response-graph-description">
                        Displacement over actual elapsed time, including any overshoot.
                    </desc>

                    <defs>
                        <linearGradient id="response-area-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="var(--chart-2)" stopOpacity="0.55" />
                            <stop offset="1" stopColor="var(--chart-2)" stopOpacity="0.04" />
                        </linearGradient>
                    </defs>

                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <line
                            key={ratio}
                            x1={LEFT + ratio * PLOT_WIDTH}
                            x2={LEFT + ratio * PLOT_WIDTH}
                            y1={TOP}
                            y2={TOP + PLOT_HEIGHT}
                            className="stroke-border"
                            strokeWidth="1"
                        />
                    ))}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <line
                            key={ratio}
                            x1={LEFT}
                            x2={LEFT + PLOT_WIDTH}
                            y1={TOP + ratio * PLOT_HEIGHT}
                            y2={TOP + ratio * PLOT_HEIGHT}
                            className="stroke-border"
                            strokeWidth="1"
                        />
                    ))}

                    <line
                        x1={LEFT}
                        x2={LEFT + PLOT_WIDTH}
                        y1={graph.toY(0)}
                        y2={graph.toY(0)}
                        className="stroke-muted-foreground"
                        strokeDasharray="5 5"
                    />
                    <line
                        x1={LEFT}
                        x2={LEFT + PLOT_WIDTH}
                        y1={graph.toY(1)}
                        y2={graph.toY(1)}
                        className="stroke-primary"
                        strokeDasharray="5 5"
                    />

                    {graph.hasCurve && (
                        <>
                            <path d={graph.area} fill="url(#response-area-fill)" />
                            <polyline
                                points={graph.line}
                                fill="none"
                                className="stroke-primary"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="4"
                            />
                            <g aria-hidden="true">
                                {graph.points.map((point, index) => (
                                    <circle
                                        key={`${point.x}-${index}`}
                                        cx={point.x}
                                        cy={point.y}
                                        r={POINT_RADIUS}
                                        className="fill-primary stroke-background"
                                        strokeWidth={POINT_STROKE}
                                    />
                                ))}
                            </g>
                        </>
                    )}

                    <g className="font-mono text-[12px] fill-muted-foreground">
                        <text x={LEFT} y={HEIGHT - 19}>0 ms</text>
                        <text x={LEFT + PLOT_WIDTH} y={HEIGHT - 19} textAnchor="end">
                            {formatDuration(graph.duration)}
                        </text>
                        <text x={LEFT - 10} y={graph.toY(1) + 4} textAnchor="end">1</text>
                        <text x={LEFT - 10} y={graph.toY(0) + 4} textAnchor="end">0</text>
                    </g>
                </svg>
            </div>

            <div className="px-5 py-3 font-mono text-[11px] text-muted-foreground bg-background sm:grid-cols-4 border-t border-border grid grid-cols-2 gap-3">
                <span>{recording ? "elapsed" : durationLabel}: {durationValue}</span>
                <span>min: {graph.hasCurve ? graph.bounds.minValue.toFixed(3) : "—"}</span>
                <span>max: {graph.hasCurve ? graph.bounds.maxValue.toFixed(3) : "—"}</span>
                <span>overshoot: {graph.hasCurve ? overshoot.toFixed(3) : "—"}</span>
            </div>
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
