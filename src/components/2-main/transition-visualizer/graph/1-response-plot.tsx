import { useAtomValue } from "jotai";
import { formatDuration } from "../model/duration";
import { activeDefinitionAtom } from "../state/atoms";
import { graphAtom, HEIGHT, LEFT, PLOT_HEIGHT, PLOT_WIDTH, TOP, WIDTH } from "./a-graph-atoms";

const POINT_RADIUS = 10;
const POINT_STROKE = 2.5;

export function ResponsePlot() {
    const definition = useAtomValue(activeDefinitionAtom);
    const graph = useAtomValue(graphAtom);

    return (
        <div className="p-3 min-h-0 sm:p-6 flex-1">
            <svg className="h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="response-graph-title response-graph-description">

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

                {[0, 0.25, 0.5, 0.75, 1].map(
                    (ratio) => (
                        <line
                            className="stroke-border"
                            strokeWidth="1"
                            x1={LEFT + ratio * PLOT_WIDTH}
                            x2={LEFT + ratio * PLOT_WIDTH}
                            y1={TOP}
                            y2={TOP + PLOT_HEIGHT}
                            key={ratio}
                        />
                    )
                )}
                {[0, 0.25, 0.5, 0.75, 1].map(
                    (ratio) => (
                        <line
                            className="stroke-border"
                            strokeWidth="1"
                            x1={LEFT}
                            x2={LEFT + PLOT_WIDTH}
                            y1={TOP + ratio * PLOT_HEIGHT}
                            y2={TOP + ratio * PLOT_HEIGHT}
                            key={ratio}
                        />
                    )
                )}

                <line
                    className="stroke-muted-foreground"
                    strokeDasharray="5 5"
                    x1={LEFT}
                    x2={LEFT + PLOT_WIDTH}
                    y1={graph.toY(0)}
                    y2={graph.toY(0)}
                />
                <line
                    className="stroke-primary"
                    strokeDasharray="5 5"
                    x1={LEFT}
                    x2={LEFT + PLOT_WIDTH}
                    y1={graph.toY(1)}
                    y2={graph.toY(1)}
                />

                {graph.hasCurve && (<>
                    <path d={graph.area} fill="url(#response-area-fill)" />
                    <polyline
                        className="stroke-primary"
                        points={graph.line}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    <g aria-hidden="true">
                        {graph.points.map(
                            (point, index) => (
                                <circle
                                    className="fill-primary stroke-background"
                                    strokeWidth={POINT_STROKE}
                                    cx={point.x}
                                    cy={point.y}
                                    r={POINT_RADIUS}
                                    key={`${point.x}-${index}`}
                                />
                            )
                        )}
                    </g>
                </>)}

                <g className="font-mono text-[12px] fill-muted-foreground">
                    <text x={LEFT} y={HEIGHT - 19}>
                        0 ms
                    </text>

                    <text x={LEFT + PLOT_WIDTH} y={HEIGHT - 19} textAnchor="end">
                        {formatDuration(graph.duration)}
                    </text>

                    <text x={LEFT - 10} y={graph.toY(1) + 4} textAnchor="end">
                        1
                    </text>
                    <text x={LEFT - 10} y={graph.toY(0) + 4} textAnchor="end">
                        0
                    </text>
                </g>
            </svg>
        </div>
    );
}
