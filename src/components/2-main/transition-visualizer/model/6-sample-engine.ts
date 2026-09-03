import { gsap } from "gsap";
import { spring } from "motion";
import { formatGsapEase } from "../engines/3-gsap";
import { decimateSamples, sanitizeSamples } from "./3-samples";
import { MAX_DURATION_MS, getPlotDurationMs, integrateReactSpring } from "./2-duration";
import type { EngineId, EngineParamsMap, GsapParams, MotionParams, ReactSpringParams, RunResult, SamplePoint } from "./9-types";

/** Offline sample stride. Dense enough for a smooth path; `decimateSamples` caps the plot. */
export const SAMPLE_STEP_MS = 8;

/** Walk the active engine's own solver and return a full 0 → rest curve. */
export function sampleEngine<K extends EngineId>(engineId: K, params: EngineParamsMap[K]): SamplePoint[] {
    switch (engineId) {
        case "gsap":
            return sampleGsap(params as GsapParams);
        case "motion":
            return sampleMotion(params as MotionParams);
        case "spring":
            return sampleReactSpring(params as ReactSpringParams);
    }
}

export function buildRecordedResult<K extends EngineId>(engineId: K, params: EngineParamsMap[K]): RunResult {
    const samples = decimateSamples(sanitizeSamples(sampleEngine(engineId, params)));
    const durationMs = Math.max(samples.at(-1)?.elapsedMs ?? 0, 1);
    return {
        engineId,
        durationMs,
        plotDurationMs: getPlotDurationMs(engineId, params),
        samples,
    };
}

function sampleReactSpring(params: ReactSpringParams): SamplePoint[] {
    const samples: SamplePoint[] = [];
    let lastEmitted = -SAMPLE_STEP_MS;
    let last: SamplePoint = { elapsedMs: 0, value: 0 };

    integrateReactSpring(params, (elapsedMs, value) => {
        last = { elapsedMs, value };
        if (elapsedMs === 0 || elapsedMs - lastEmitted >= SAMPLE_STEP_MS) {
            samples.push(last);
            lastEmitted = elapsedMs;
        }
    });

    if (samples.at(-1)?.elapsedMs !== last.elapsedMs) {
        samples.push(last);
    }

    return samples;
}

function sampleMotion(params: MotionParams): SamplePoint[] {
    const generator = spring({ keyframes: [0, 1], ...params });
    const samples: SamplePoint[] = [];

    for (let elapsedMs = 0; elapsedMs <= MAX_DURATION_MS; elapsedMs += SAMPLE_STEP_MS) {
        const { done, value } = generator.next(elapsedMs);
        samples.push({ elapsedMs, value: Number.isFinite(value) ? value : 0 });
        if (done) break;
    }

    return samples;
}

function sampleGsap(params: GsapParams): SamplePoint[] {
    const durationMs = Math.max(1, params.duration * 1000);
    const ease = gsap.parseEase(formatGsapEase(params));
    const samples: SamplePoint[] = [];

    for (let elapsedMs = 0; elapsedMs < durationMs; elapsedMs += SAMPLE_STEP_MS) {
        samples.push({ elapsedMs, value: ease(elapsedMs / durationMs) });
    }
    samples.push({ elapsedMs: durationMs, value: ease(1) });

    return samples;
}
