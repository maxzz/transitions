import type { SampleBounds } from "./3-samples";
import type { SamplePoint } from "./9-types";

export type GraphSize = {
    width: number;
    height: number;
};

export type GraphPoint = {
    x: number;
    y: number;
};

export type GraphTick = {
    position: number;
    label: string;
};

export type GraphData = {
    samples: readonly SamplePoint[];
    bounds: SampleBounds;
    /** Time the x-axis has to cover, before rounding it up to a tick boundary. */
    durationMs: number;
};

export type GraphPlot = GraphSize & {
    /** Plot area edges in pixels. */
    left: number;
    top: number;
    right: number;
    bottom: number;
    xTicks: GraphTick[];
    yTicks: GraphTick[];
    zeroY: number;
    targetY: number;
    linePath: string;
    areaPath: string;
    points: GraphPoint[];
    /** Marker radius, shrunk when samples sit closer together than a full-size marker. */
    pointRadius: number;
    hasCurve: boolean;
};

export const GRAPH_MARGIN = { left: 48, right: 20, top: 14, bottom: 32 } as const;

/** The chart may fill the available height, but never grows taller than this fraction of its width. */
export const MAX_GRAPH_HEIGHT_RATIO = 0.9;

const MIN_X_TICK_GAP_PX = 72;
const MIN_Y_TICK_GAP_PX = 44;
const MAX_POINT_RADIUS = 3.5;
const MIN_POINT_RADIUS = 1.25;
const TICK_MULTIPLIERS = [1, 2, 2.5, 5, 10];
const EPSILON = 1e-9;

export function getGraphSize(width: number | undefined, height: number | undefined): GraphSize | null {
    if (!width || !height || width < 64 || height < 64) return null;
    return {
        width: Math.floor(width),
        height: Math.floor(Math.min(height, width * MAX_GRAPH_HEIGHT_RATIO)),
    };
}

/** Smallest "nice" step (1, 2, 2.5, 5 × 10ⁿ) that splits the range into at most `maxTicks` intervals. */
export function niceStep(range: number, maxTicks: number): number {
    if (!(range > 0) || !(maxTicks >= 1)) return 1;
    const raw = range / maxTicks;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    for (const multiplier of TICK_MULTIPLIERS) {
        const step = multiplier * magnitude;
        if (step >= raw - EPSILON) return step;
    }
    return 10 * magnitude;
}

export function ticksBetween(min: number, max: number, step: number): number[] {
    if (!(step > 0) || max < min) return [];
    const decimals = decimalPlaces(step);
    const first = Math.ceil(min / step - EPSILON);
    const last = Math.floor(max / step + EPSILON);
    const ticks: number[] = [];
    for (let index = first; index <= last; index += 1) {
        ticks.push(Number((index * step).toFixed(decimals)));
    }
    return ticks;
}

/**
 * Time axis rounded up to the next tick boundary so that frame-level jitter in the
 * measured duration does not rescale the plot when a recording completes.
 */
export function getTimeAxis(durationMs: number, maxTicks: number): { max: number; step: number; ticks: number[] } {
    const duration = Number.isFinite(durationMs) ? Math.max(durationMs, 1) : 1;
    const step = niceStep(duration, maxTicks);
    const max = Math.ceil(duration / step - EPSILON) * step;
    return { max, step, ticks: ticksBetween(0, max, step) };
}

export function getValueAxis(bounds: SampleBounds, maxTicks: number): { min: number; max: number; step: number; ticks: number[] } {
    const low = Math.min(bounds.minValue, 0);
    const high = Math.max(bounds.maxValue, 1);
    const pad = Math.max((high - low) * 0.1, 0.06);
    const min = low - pad;
    const max = high + pad;
    const step = niceStep(max - min, maxTicks);
    return { min, max, step, ticks: ticksBetween(min, max, step) };
}

export function formatTimeTick(ms: number, axisMax: number, step: number, withUnit: boolean): string {
    if (axisMax < 1000) {
        return withUnit ? `${ms} ms` : `${ms}`;
    }
    const seconds = (ms / 1000).toFixed(decimalPlaces(step / 1000));
    return withUnit ? `${seconds} s` : seconds;
}

export function formatValueTick(value: number, step: number): string {
    return value.toFixed(decimalPlaces(step));
}

/**
 * Cubic Bézier path through all points using monotone (Fritsch–Carlson style) tangents,
 * so the smooth curve never overshoots between two recorded samples.
 */
export function monotoneCurvePath(points: readonly GraphPoint[]): string {
    const count = points.length;
    if (count === 0) return "";
    if (count === 1) return `M ${px(points[0].x)} ${px(points[0].y)}`;
    if (count === 2) return `M ${px(points[0].x)} ${px(points[0].y)} L ${px(points[1].x)} ${px(points[1].y)}`;

    const tangents = new Array<number>(count);
    for (let index = 1; index < count - 1; index += 1) {
        tangents[index] = interiorSlope(points[index - 1], points[index], points[index + 1]);
    }
    tangents[0] = endSlope(points[0], points[1], tangents[1]);
    tangents[count - 1] = endSlope(points[count - 2], points[count - 1], tangents[count - 2]);

    let path = `M ${px(points[0].x)} ${px(points[0].y)}`;
    for (let index = 0; index < count - 1; index += 1) {
        const from = points[index];
        const to = points[index + 1];
        const dx = (to.x - from.x) / 3;
        path += ` C ${px(from.x + dx)} ${px(from.y + dx * tangents[index])} ${px(to.x - dx)} ${px(to.y - dx * tangents[index + 1])} ${px(to.x)} ${px(to.y)}`;
    }
    return path;
}

export function buildGraphPlot(data: GraphData, size: GraphSize): GraphPlot {
    const { width, height } = size;
    const left = GRAPH_MARGIN.left;
    const top = GRAPH_MARGIN.top;
    const right = Math.max(width - GRAPH_MARGIN.right, left + 1);
    const bottom = Math.max(height - GRAPH_MARGIN.bottom, top + 1);
    const plotWidth = right - left;
    const plotHeight = bottom - top;

    const xAxis = getTimeAxis(data.durationMs, Math.max(2, Math.floor(plotWidth / MIN_X_TICK_GAP_PX)));
    const yAxis = getValueAxis(data.bounds, Math.max(2, Math.floor(plotHeight / MIN_Y_TICK_GAP_PX)));

    const toX = (elapsedMs: number) => left + (elapsedMs / xAxis.max) * plotWidth;
    const toY = (value: number) => top + ((yAxis.max - value) / (yAxis.max - yAxis.min)) * plotHeight;

    const points = data.samples.map((sample) => ({ x: toX(sample.elapsedMs), y: toY(sample.value) }));
    const zeroY = toY(0);
    const linePath = monotoneCurvePath(points);
    const first = points[0];
    const last = points.at(-1);
    const areaPath = first && last && points.length > 1
        ? `${linePath} L ${px(last.x)} ${px(zeroY)} L ${px(first.x)} ${px(zeroY)} Z`
        : "";
    const pointGap = first && last && points.length > 1 ? (last.x - first.x) / (points.length - 1) : Number.POSITIVE_INFINITY;
    const pointRadius = Math.max(MIN_POINT_RADIUS, Math.min(MAX_POINT_RADIUS, pointGap * 0.4));

    return {
        width,
        height,
        left,
        top,
        right,
        bottom,
        xTicks: xAxis.ticks.map((tick, index, all) => ({
            position: toX(tick),
            label: formatTimeTick(tick, xAxis.max, xAxis.step, index === all.length - 1),
        })),
        yTicks: yAxis.ticks.map((tick) => ({ position: toY(tick), label: formatValueTick(tick, yAxis.step) })),
        zeroY,
        targetY: toY(1),
        linePath,
        areaPath,
        points,
        pointRadius,
        hasCurve: points.length > 0,
    };
}

function interiorSlope(previous: GraphPoint, current: GraphPoint, next: GraphPoint): number {
    const h0 = current.x - previous.x;
    const h1 = next.x - current.x;
    if (h0 <= 0 || h1 <= 0) return 0;
    const s0 = (current.y - previous.y) / h0;
    const s1 = (next.y - current.y) / h1;
    if (s0 * s1 <= 0) return 0;
    const weighted = (s0 * h1 + s1 * h0) / (h0 + h1);
    return Math.sign(s0) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(weighted));
}

function endSlope(from: GraphPoint, to: GraphPoint, innerTangent: number): number {
    const h = to.x - from.x;
    if (h <= 0) return innerTangent;
    return (3 * (to.y - from.y) / h - innerTangent) / 2;
}

function decimalPlaces(step: number): number {
    const text = step.toPrecision(12).replace(/0+$/, "");
    const dot = text.indexOf(".");
    return dot === -1 ? 0 : text.length - dot - 1;
}

function px(value: number): string {
    return value.toFixed(1);
}
