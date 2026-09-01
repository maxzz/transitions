import type { SamplePoint } from "./types";

export type SampleBounds = {
    durationMs: number;
    minValue: number;
    maxValue: number;
};

export function sanitizeSamples(samples: readonly SamplePoint[]): SamplePoint[] {
    const clean: SamplePoint[] = [];

    for (const sample of samples) {
        if (!Number.isFinite(sample.elapsedMs) || !Number.isFinite(sample.value)) continue;

        const point = {
            elapsedMs: Math.max(0, sample.elapsedMs),
            value: sample.value,
        };
        const previous = clean.at(-1);

        if (previous && point.elapsedMs < previous.elapsedMs) continue;
        if (previous && point.elapsedMs === previous.elapsedMs) {
            clean[clean.length - 1] = point;
        } else {
            clean.push(point);
        }
    }

    if (clean.length === 0 || clean[0].elapsedMs > 0) {
        clean.unshift({ elapsedMs: 0, value: clean[0]?.value ?? 0 });
    }

    return clean;
}

export function decimateSamples(samples: readonly SamplePoint[], maxPoints = 600): SamplePoint[] {
    if (samples.length <= maxPoints || maxPoints < 4) return [...samples];

    const result: SamplePoint[] = [samples[0]];
    const interior = samples.slice(1, -1);
    const bucketCount = Math.max(1, Math.floor((maxPoints - 2) / 2));
    const bucketSize = interior.length / bucketCount;

    for (let bucket = 0; bucket < bucketCount; bucket += 1) {
        const start = Math.floor(bucket * bucketSize);
        const end = Math.min(interior.length, Math.floor((bucket + 1) * bucketSize));
        const points = interior.slice(start, Math.max(start + 1, end));
        if (points.length === 0) continue;

        let min = points[0];
        let max = points[0];
        for (const point of points) {
            if (point.value < min.value) min = point;
            if (point.value > max.value) max = point;
        }

        if (min.elapsedMs <= max.elapsedMs) {
            result.push(min);
            if (max !== min) result.push(max);
        } else {
            result.push(max);
            if (max !== min) result.push(min);
        }
    }

    result.push(samples.at(-1)!);
    return result;
}

export function getSampleBounds(samples: readonly SamplePoint[]): SampleBounds {
    if (samples.length === 0) {
        return { durationMs: 0, minValue: 0, maxValue: 1 };
    }

    let minValue = samples[0].value;
    let maxValue = samples[0].value;
    for (const sample of samples) {
        minValue = Math.min(minValue, sample.value);
        maxValue = Math.max(maxValue, sample.value);
    }

    minValue = Math.min(minValue, 0, 1);
    maxValue = Math.max(maxValue, 0, 1);

    if (maxValue - minValue < 0.000001) {
        minValue -= 0.5;
        maxValue += 0.5;
    }

    return {
        durationMs: samples.at(-1)?.elapsedMs ?? 0,
        minValue,
        maxValue,
    };
}
