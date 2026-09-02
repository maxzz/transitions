import { calcGeneratorDuration, spring } from "motion";
import type { EngineId, EngineParamsMap, MotionParams, ReactSpringParams } from "./9-types";

export const MAX_DURATION_MS = 30_000;

/**
 * Physics engines detect rest inside a frame, so their last recorded frame lands up to one
 * (rafz-capped) frame after the exact rest time. The plot is laid out with this much extra room.
 */
export const SETTLE_HEADROOM_MS = 64;

/**
 * Exact duration of the engine's own timeline for the given parameters, computed the way the
 * engine itself does, so it is known before the run starts and does not depend on frame timing.
 */
export function estimateDurationMs(engineId: EngineId, params: EngineParamsMap[EngineId]): number {
    switch (engineId) {
        case "gsap":
            return clampDuration((params as EngineParamsMap["gsap"]).duration * 1000);
        case "motion":
            return clampDuration(motionSpringDurationMs(params as MotionParams));
        case "spring":
            return clampDuration(reactSpringDurationMs(params as ReactSpringParams));
    }
}

/** Time range the recorded graph is laid out for, decided before the run starts. */
export function getPlotDurationMs(engineId: EngineId, params: EngineParamsMap[EngineId]): number {
    const exact = estimateDurationMs(engineId, params);
    return engineId === "gsap" ? exact : Math.min(MAX_DURATION_MS, exact + SETTLE_HEADROOM_MS);
}

export function formatDuration(durationMs: number): string {
    return durationMs < 1000
        ? `${Math.round(durationMs)} ms`
        : `${(durationMs / 1000).toFixed(2)} s`;
}

/** Motion resolves its spring analytically and fixes the duration up front by stepping the generator. */
export function motionSpringDurationMs(params: MotionParams): number {
    return calcGeneratorDuration(spring({ keyframes: [0, 1], ...params }));
}

/**
 * Replica of react-spring's `SpringValue.advance` physics for a 0 → 1 move: semi-implicit Euler in
 * 1 ms steps, at rest once |velocity| <= precision / 10 and |target - position| <= precision.
 * Returns the physics time (ms) at which react-spring reports rest.
 */
export function reactSpringDurationMs(params: ReactSpringParams): number {
    const to = 1;
    const { tension, friction, clamp } = params;
    if (!(tension > 0)) return 0;

    const mass = params.mass > 0 ? params.mass : 0.0001;
    const precision = params.precision || 0.001;
    const restVelocity = precision / 10;
    let velocity = Number.isFinite(params.velocity) ? params.velocity : 0;
    let position = 0;

    for (let stepsDone = 0; stepsDone <= MAX_DURATION_MS; stepsDone += 1) {
        if (Math.abs(velocity) <= restVelocity && Math.abs(to - position) <= precision) {
            return stepsDone;
        }
        if (clamp && position >= to) {
            velocity = 0;
            position = to;
        }
        const acceleration = (-tension * 0.000001 * (position - to) - friction * 0.001 * velocity) / mass;
        velocity += acceleration;
        position += velocity;
        if (!Number.isFinite(position)) return stepsDone;
    }

    return MAX_DURATION_MS;
}

function clampDuration(durationMs: number): number {
    if (!Number.isFinite(durationMs)) return MAX_DURATION_MS;
    return Math.min(MAX_DURATION_MS, Math.max(1, durationMs));
}
