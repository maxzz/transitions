import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { getSampleBounds } from "../model/samples";
import { engineDefinitions } from "../model/definitions";
import { runResultAtom, runStatusAtom } from "../state/atoms";

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

export function ResponseGraph() {
    const result = useAtomValue(runResultAtom);
    const status = useAtomValue(runStatusAtom);

    const graph = useMemo(() => {
        if (!result) return null;
        const bounds = getSampleBounds(result.samples);
        const valueRange = bounds.maxValue - bounds.minValue;
        const pad = Math.max(valueRange * 0.12, 0.08);
        const minValue = bounds.minValue - pad;
        const maxValue = bounds.maxValue + pad;
        const duration = Math.max(bounds.durationMs, 1);
        const toX = (elapsedMs: number) => LEFT + (elapsedMs / duration) * PLOT_WIDTH;
        const toY = (value: number) => TOP + ((maxValue - value) / (maxValue - minValue)) * PLOT_HEIGHT;
        const points = result.samples.map((sample) => ({
            x: toX(sample.elapsedMs),
            y: toY(sample.value),
        }));
        const line = points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
        const area = points.length > 0
            ? `M ${points[0].x} ${TOP + PLOT_HEIGHT} L ${points.map(({ x, y }) => `${x} ${y}`).join(" L ")} L ${points.at(-1)!.x} ${TOP + PLOT_HEIGHT} Z`
            : "";

        return { bounds, minValue, maxValue, toY, line, area, points };
    }, [result]);

    const definition = result ? engineDefinitions[result.engineId] : null;
    const overshoot = graph ? Math.max(0, graph.bounds.maxValue - 1) : 0;
    const durationLabel = result?.engineId === "gsap" ? "fixed duration" : "settled after";

    return (
        <div className="h-full min-h-0 bg-muted/20 flex flex-col">
            <div className="px-5 py-4 border-b border-border flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold">Recorded response</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {definition ? `${definition.label} · native frame samples` : "Native frame samples"}
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <AutoRecordControl />
                    {result && (
                        <span className="px-2.5 py-1 font-mono text-[10px] text-muted-foreground bg-background border border-border rounded-full">
                            {result.samples.length} points
                        </span>
                    )}
                </div>
            </div>

            {!result || !graph ? (
                <div className="min-h-0 text-sm text-muted-foreground flex-1 grid place-items-center">
                    {status === "running" ? "Recording response…" : "Run an animation to record its response."}
                </div>
            ) : (
                <>
                    <div className="p-3 min-h-0 sm:p-6 flex-1">
                        <svg
                            className="h-full w-full"
                            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                            role="img"
                            aria-labelledby="response-graph-title response-graph-description"
                        >
                            <title id="response-graph-title">{definition!.label} transition response graph</title>
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

                            <g className="font-mono text-[12px] fill-muted-foreground">
                                <text x={LEFT} y={HEIGHT - 19}>0 ms</text>
                                <text x={LEFT + PLOT_WIDTH} y={HEIGHT - 19} textAnchor="end">
                                    {formatDuration(graph.bounds.durationMs)}
                                </text>
                                <text x={LEFT - 10} y={graph.toY(1) + 4} textAnchor="end">1</text>
                                <text x={LEFT - 10} y={graph.toY(0) + 4} textAnchor="end">0</text>
                            </g>
                        </svg>
                    </div>

                    <div className="px-5 py-3 font-mono text-[11px] text-muted-foreground bg-background sm:grid-cols-4 border-t border-border grid grid-cols-2 gap-3">
                        <span>{durationLabel}: {formatDuration(result.durationMs)}</span>
                        <span>min: {graph.bounds.minValue.toFixed(3)}</span>
                        <span>max: {graph.bounds.maxValue.toFixed(3)}</span>
                        <span>overshoot: {overshoot.toFixed(3)}</span>
                    </div>
                </>
            )}
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

function formatDuration(durationMs: number): string {
    return durationMs < 1000
        ? `${Math.round(durationMs)} ms`
        : `${(durationMs / 1000).toFixed(2)} s`;
}
