import type { EngineId, EngineParamsMap, MotionParams, ReactSpringParams } from "./9-types";

export const MAX_DURATION_MS = 30_000;

type SpringSimParams = {
    mass: number;
    stiffness: number;
    damping: number;
    restDelta: number;
    restSpeed: number;
    velocity: number;
    clamp: boolean;
};

export function estimateDurationMs(engineId: EngineId, params: EngineParamsMap[EngineId]): number {
    if (engineId === "gsap") {
        return clampDuration((params as EngineParamsMap["gsap"]).duration * 1000);
    }

    if (engineId === "spring") {
        return clampDuration(simulateSpringDurationMs(reactSpringSim(params as ReactSpringParams)));
    }

    return clampDuration(simulateSpringDurationMs(motionSim(params as MotionParams)));
}

export function resolveExpectedDurationMs(
    engineId: EngineId,
    params: EngineParamsMap[EngineId],
    lastExactMs: number,
    lastEngineMs = 0,
): number {
    if (engineId === "gsap") return estimateDurationMs(engineId, params);
    if (lastExactMs > 0) return lastExactMs;

    const simulated = estimateDurationMs(engineId, params);
    if (lastEngineMs > 0 && simulated > lastEngineMs) return lastEngineMs;
    return simulated;
}

export function formatDuration(durationMs: number): string {
    return durationMs < 1000
        ? `${Math.round(durationMs)} ms`
        : `${(durationMs / 1000).toFixed(2)} s`;
}

export function durationKey(engineId: EngineId, params: object): string {
    return `${engineId}:${JSON.stringify(params)}`;
}

function reactSpringSim(params: ReactSpringParams): SpringSimParams {
    return {
        mass: params.mass,
        stiffness: params.tension,
        damping: params.friction,
        restDelta: params.precision,
        restSpeed: params.precision,
        velocity: params.velocity,
        clamp: params.clamp,
    };
}

function motionSim(params: MotionParams): SpringSimParams {
    return {
        mass: params.mass,
        stiffness: params.stiffness,
        damping: params.damping,
        restDelta: params.restDelta,
        restSpeed: params.restSpeed,
        velocity: params.velocity,
        clamp: false,
    };
}

function simulateSpringDurationMs({ mass, stiffness, damping, restDelta, restSpeed, velocity, clamp }: SpringSimParams): number {
    const dt = 0.001;
    const dest = 1;
    const safeMass = Math.max(mass, 0.0001);
    let x = 0;
    let v = velocity;
    let t = 0;

    while (t < MAX_DURATION_MS / 1000) {
        const acceleration = (-stiffness * (x - dest) - damping * v) / safeMass;
        v += acceleration * dt;
        x += v * dt;

        if (clamp && x > dest) {
            x = dest;
            v = 0;
        }

        t += dt;

        if (Math.abs(x - dest) <= restDelta && Math.abs(v) <= restSpeed) break;
    }

    return t * 1000;
}

function clampDuration(durationMs: number): number {
    if (!Number.isFinite(durationMs)) return 1000;
    return Math.min(MAX_DURATION_MS, Math.max(1, durationMs));
}
