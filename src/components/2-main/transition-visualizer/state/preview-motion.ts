import { proxy } from "valtio";
import { interpolateSampleValue } from "../model/3-samples";
import type { SamplePoint } from "../model/9-types";

/**
 * Live progress of the running animation, shared by every preview scene and the graph playhead.
 *
 * The playback clock mutates this proxy on every frame, so it is kept in Valtio rather than Jotai:
 * a mutable scalar written imperatively from an animation loop maps directly onto a proxy,
 * and any preview component can subscribe with `useSnapshot` without being wired through
 * refs or props. Discrete UI choices (engine, params, scene) stay in the Jotai atoms.
 *
 * `value` is the normalized engine output: 0 = start, 1 = target. It may overshoot below 0 or above 1.
 * `elapsedMs` is the playback clock, used to place the graph playhead without rebuilding the plot.
 * `speed` is the playback rate from 0 (paused) to 1 (real time).
 */
export const previewMotion = proxy({
    value: 0,
    elapsedMs: 0,
    speed: 1,
});

export function setPreviewValue(value: number, elapsedMs?: number) {
    previewMotion.value = Number.isFinite(value) ? value : 0;
    if (elapsedMs !== undefined) {
        previewMotion.elapsedMs = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
    }
}

export function setPreviewSpeed(speed: number) {
    previewMotion.speed = Number.isFinite(speed) ? Math.min(1, Math.max(0, speed)) : 1;
}

export function getPreviewValue(): number {
    return previewMotion.value;
}

export function resetPreviewValue() {
    previewMotion.value = 0;
    previewMotion.elapsedMs = 0;
}

export function seekPlayback(samples: readonly SamplePoint[], elapsedMs: number) {
    const durationMs = samples.at(-1)?.elapsedMs ?? 0;
    const next = Number.isFinite(elapsedMs) ? Math.min(durationMs, Math.max(0, elapsedMs)) : 0;
    setPreviewValue(interpolateSampleValue(samples, next) ?? 0, next);
}
