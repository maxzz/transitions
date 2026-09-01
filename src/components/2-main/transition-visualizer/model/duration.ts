import type { EngineId, EngineParamsMap, MotionParams, ReactSpringParams } from "./types";

export const MAX_DURATION_MS = 30_000;
export const DURATION_PAD = 1.08;

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
        const durationMs = (params as EngineParamsMap["gsap"]).duration * 1000;
        return clampDuration(durationMs);
    }

    if (engineId === "react-spring") {
        return clampDuration(simulateSpringDurationMs(reactSpringSim(params as ReactSpringParams)) * DURATION_PAD);
    }

    return clampDuration(simulateSpringDurationMs(motionSim(params as MotionParams)) * DURATION_PAD);
}

export function resolveExpectedDurationMs(
    engineId: EngineId,
    params: EngineParamsMap[EngineId],
    lastDurationMs: number,
): number {
    const simulated = estimateDurationMs(engineId, params);
    if (engineId === "gsap" || lastDurationMs <= 0) return simulated;
    if (lastDurationMs > simulated * 0.35 && lastDurationMs < simulated * 2.8) {
        return lastDurationMs;
    }
    return simulated;
}

export function formatDuration(durationMs: number): string {
    return durationMs < 1000
        ? `${Math.round(durationMs)} ms`
        : `${(durationMs / 1000).toFixed(2)} s`;
}

function reactSpringSim(params: ReactSpringParams): SpringSimParams {
    return {
        mass: params.mass,
        stiffness: params.tension,
        damping: params.friction,
        restDelta: params.precision,
        restSpeed: Math.max(params.precision * 10, 0.01),
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

function simulateSpringDurationMs({
    mass,
    stiffness,
    damping,
    restDelta,
    restSpeed,
    velocity,
    clamp,
}: SpringSimParams): number {
    const dt = 1 / 60;
    const dest = 1;
    let x = 0;
    let v = velocity;
    let t = 0;
    let restFrames = 0;

    while (t < MAX_DURATION_MS / 1000) {
        const acceleration = (-stiffness * (x - dest) - damping * v) / Math.max(mass, 0.0001);
        v += acceleration * dt;
        x += v * dt;

        if (clamp && x > dest) {
            x = dest;
            v = 0;
        }

        t += dt;

        if (Math.abs(x - dest) <= restDelta && Math.abs(v) <= restSpeed) {
            restFrames += 1;
            if (restFrames >= 3) break;
        } else {
            restFrames = 0;
        }
    }

    return t * 1000;
}

function clampDuration(durationMs: number): number {
    if (!Number.isFinite(durationMs)) return 1000;
    return Math.min(MAX_DURATION_MS, Math.max(1, durationMs));
}
