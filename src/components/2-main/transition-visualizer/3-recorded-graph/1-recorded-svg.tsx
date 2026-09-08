import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { useResizeObserver } from "@/utils/util-hooks/use-resize-observer";
import { buildGraphPlot, getGraphSize, type GraphPlot } from "../model/5-graph-plot";
import type { SamplePoint } from "../model/9-types";
import { activeDefinitionAtom } from "../state/atoms";
import { RecordingPlayhead } from "./1-1-recorded-svg-playhead";
import { graphDataAtom } from "./a-graph-atoms";

const CURVE_STROKE = 2.5;
const POINT_STROKE = 1.5;
const TICK_LENGTH = 5;
const TICK_LABEL_GAP = 9;

/**
 * The plot box is sized from the graph pane (`cqi`/`cqb`), then measured so the
 * SVG viewBox matches that container. Tick labels scale with the same container.
 */
export function RecordedView() {
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

function RecordedSvg({ plot, samples, showGraphPoints, title }: { plot: GraphPlot; samples: readonly SamplePoint[]; showGraphPoints: boolean; title: string; }) {
    return (
        <svg
            className="block size-full overflow-visible"
            width={plot.width}
            height={plot.height}
            viewBox={`0 0 ${plot.width} ${plot.height}`}
            role="img"
            aria-labelledby="response-graph-title response-graph-description"
        >
            <RecordedTitle title={title} />

            <defs>
                <linearGradient id="response-area-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--chart-2)" stopOpacity="0.45" />
                    <stop offset="1" stopColor="var(--chart-2)" stopOpacity="0.03" />
                </linearGradient>
                <clipPath id="response-plot-clip">
                    <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} />
                </clipPath>
            </defs>

            <GridAndAxes plot={plot} />

            {plot.hasCurve && (
                <g clipPath="url(#response-plot-clip)">
                    <path d={plot.areaPath} fill="url(#response-area-fill)" />
                    <path
                        className="stroke-primary"
                        d={plot.linePath}
                        strokeWidth={CURVE_STROKE}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {showGraphPoints && (
                        <g aria-hidden="true">
                            {plot.points.map(
                                (point, index) => (
                                    <circle
                                        className="fill-primary stroke-background"
                                        strokeWidth={POINT_STROKE}
                                        cx={point.x}
                                        cy={point.y}
                                        r={plot.pointRadius}
                                        key={index}
                                    />
                                )
                            )}
                        </g>
                    )}
                </g>
            )}

            <RecordingPlayhead plot={plot} samples={samples} />
        </svg>
    );
}

function GridAndAxes({ plot }: { plot: GraphPlot; }) {
    return (
        <>
            <g className="stroke-border" strokeWidth="1">
                {plot.xTicks.map(
                    (tick) => (
                        <line x1={tick.position} x2={tick.position} y1={plot.top} y2={plot.bottom} key={`x${tick.label}`} />
                    )
                )}
                {plot.yTicks.map(
                    (tick) => (
                        <line x1={plot.left} x2={plot.right} y1={tick.position} y2={tick.position} key={`y${tick.label}`} />
                    )
                )}
                <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} fill="none" />
            </g>

            <g className="stroke-muted-foreground/70" strokeWidth="1.5" strokeDasharray="6 5">
                <line x1={plot.left} x2={plot.right} y1={plot.zeroY} y2={plot.zeroY} />
                <line className="stroke-primary" x1={plot.left} x2={plot.right} y1={plot.targetY} y2={plot.targetY} />
            </g>

            <g className="stroke-muted-foreground/60" strokeWidth="1">
                {plot.xTicks.map(
                    (tick) => (
                        <line x1={tick.position} x2={tick.position} y1={plot.bottom} y2={plot.bottom + TICK_LENGTH} key={`x${tick.label}`} />
                    )
                )}
                {plot.yTicks.map(
                    (tick) => (
                        <line x1={plot.left - TICK_LENGTH} x2={plot.left} y1={tick.position} y2={tick.position} key={`y${tick.label}`} />
                    )
                )}
            </g>

            <g className="text-(length:--graph-label,0.75rem) font-mono tabular-nums fill-muted-foreground">
                {plot.xTicks.map(
                    (tick, index, all) => (
                        <text
                            x={tick.position}
                            y={plot.bottom + TICK_LENGTH + TICK_LABEL_GAP}
                            dominantBaseline="hanging"
                            textAnchor={index === 0 ? "start" : index === all.length - 1 ? "end" : "middle"}
                            key={`x${tick.label}`}
                        >
                            {tick.label}
                        </text>
                    )
                )}
                {plot.yTicks.map(
                    (tick) => (
                        <text
                            x={plot.left - TICK_LENGTH - TICK_LABEL_GAP + 2}
                            y={tick.position}
                            dominantBaseline="central"
                            textAnchor="end"
                            key={`y${tick.label}`}
                        >
                            {tick.label}
                        </text>
                    )
                )}
            </g>
        </>
    );
}

function RecordedTitle({ title }: { title: string; }) {
    return (
        <>
            <title id="response-graph-title">{title} transition response graph</title>
            <desc id="response-graph-description">
                Displacement over actual elapsed time, including any overshoot.
            </desc>
        </>
    );
}
