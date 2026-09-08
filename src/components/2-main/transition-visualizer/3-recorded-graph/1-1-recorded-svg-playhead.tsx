import { useRef, type PointerEvent } from "react";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { interpolateSampleValue } from "../model/3-samples";
import { mapPlotPoint, mapPlotTime, nearestPlotTime, type GraphPlot } from "../model/5-graph-plot";
import type { SamplePoint } from "../model/9-types";
import { previewMotion, seekPlayback } from "../state/preview-motion";

const POINT_STROKE = 1.5;
const PLAYHEAD_STROKE = 1.5;
const PLAYHEAD_DOT_RADIUS = 5;
const PLAYHEAD_HALO_RADIUS = 9;
const PLAYHEAD_GRAB_RADIUS = 14;

/**
 * Vertical playhead plus the intersection marker. Always shown on a recorded curve,
 * including at the first and last samples. The disk may overflow the plot edge so
 * it stays complete at time zero and at settle, without shifting the time axis.
 */
export function RecordingPlayhead({ plot, samples }: { plot: GraphPlot; samples: readonly SamplePoint[]; }) {
    const { graphClickToDrag } = useSnapshot(appSettings);
    const { value, elapsedMs } = useSnapshot(previewMotion);

    if (!samples.length) {
        return null;
    }

    const last = samples.at(-1);
    const onCurve = last !== undefined && elapsedMs <= last.elapsedMs;
    const playheadValue = onCurve ? interpolateSampleValue(samples, elapsedMs) ?? value : value;
    const { x, y } = mapPlotPoint(plot, elapsedMs, playheadValue);

    return (<>
        <g aria-hidden="true" data-graph-playhead="true" className="pointer-events-none">
            <line
                className="stroke-primary"
                x1={x}
                x2={x}
                y1={plot.top}
                y2={plot.bottom}
                strokeWidth={PLAYHEAD_STROKE}
            />
            <circle className="fill-primary/30" cx={x} cy={y} r={PLAYHEAD_HALO_RADIUS} />
            <circle
                className="fill-primary stroke-background"
                cx={x}
                cy={y}
                r={PLAYHEAD_DOT_RADIUS}
                strokeWidth={POINT_STROKE}
            />
        </g>
        {graphClickToDrag
            ? <PlayheadGrabHandle plot={plot} samples={samples} x={x} y={y} />
            : <PlotScrubTrack plot={plot} samples={samples} />
        }
    </>);
}

function PlotScrubTrack({ plot, samples }: { plot: GraphPlot; samples: readonly SamplePoint[]; }) {

    const seekToPointer = (event: PointerEvent<SVGRectElement>) => {
        const point = clientToSvgPoint(event);
        if (!point) {
            return;
        }
        seekPlayback(samples, nearestPlotTime(plot, samples, point.x, point.y));
    };

    return (
        <rect
            className="touch-none cursor-pointer"
            x={plot.left - PLAYHEAD_HALO_RADIUS}
            y={plot.top}
            width={plot.right - plot.left + PLAYHEAD_HALO_RADIUS * 2}
            height={plot.bottom - plot.top}
            fill="transparent"
            aria-hidden="true"
            data-graph-scrub="hover"
            onPointerDown={
                (event) => {
                    seekToPointer(event);
                    try {
                        event.currentTarget.setPointerCapture(event.pointerId);
                    } catch {
                        // Synthetic or already-released pointers still seek on down.
                    }
                }
            }
            onPointerMove={
                (event) => {
                    seekToPointer(event);
                }
            }
        />
    );
}

function PlayheadGrabHandle({ plot, samples, x, y }: { plot: GraphPlot; samples: readonly SamplePoint[]; x: number; y: number; }) {
    const draggingRef = useRef(false);

    const seekAlongTime = (event: PointerEvent<SVGCircleElement>) => {
        const point = clientToSvgPoint(event);
        if (!point) return;
        seekPlayback(samples, mapPlotTime(plot, point.x));
    };

    const endDrag = () => {
        draggingRef.current = false;
    };

    return (
        <circle
            className="touch-none cursor-grab active:cursor-grabbing"
            cx={x}
            cy={y}
            r={PLAYHEAD_GRAB_RADIUS}
            fill="transparent"
            aria-hidden="true"
            data-graph-scrub="grab"
            onPointerDown={
                (event) => {
                    draggingRef.current = true;
                    try {
                        event.currentTarget.setPointerCapture(event.pointerId);
                    } catch {
                        // Capture is optional; the drag flag still tracks this press.
                    }
                }
            }
            onPointerMove={
                (event) => {
                    if (!draggingRef.current) return;
                    seekAlongTime(event);
                }
            }
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        />
    );
}

function clientToSvgPoint(event: PointerEvent<SVGGraphicsElement>): { x: number; y: number; } | null {
    const svg = event.currentTarget.ownerSVGElement;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
}
