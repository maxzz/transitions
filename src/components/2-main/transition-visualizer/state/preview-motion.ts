import { animate, motionValue } from "motion";
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

/** Opacity of the moving preview parts while returning to the initial pose. 1 = visible. */
export const previewResetOpacity = motionValue(1);

/** Fade-out duration in seconds before the pose snaps back. */
export const PREVIEW_RESET_FADE_DURATION = 0.3;

let resetFadeToken = 0;

export function setPreviewValue(value: number, elapsedMs?: number) {
    previewMotion.value = Number.isFinite(value) ? value : 0;
    if (elapsedMs !== undefined) {
        previewMotion.elapsedMs = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
    }
}

export function setPreviewSpeed(speed: number) {
    previewMotion.speed = Number.isFinite(speed) ? Math.min(1, Math.max(0, speed)) : 1;
}

/** Pause a running preview (speed 0) or restore real-time playback. */
export function togglePreviewPause() {
    setPreviewSpeed(previewMotion.speed === 0 ? 1 : 0);
}

/** A stopped or newly started run should not stay frozen from a previous pause. */
export function ensurePreviewPlayingSpeed() {
    if (previewMotion.speed === 0) setPreviewSpeed(1);
}

export function getPreviewValue(): number {
    return previewMotion.value;
}

export function resetPreviewValue() {
    cancelPreviewResetFade();
    previewMotion.value = 0;
    previewMotion.elapsedMs = 0;
}

/** Stop an in-flight return fade and show the moving parts again without changing pose. */
export function cancelPreviewResetFade() {
    resetFadeToken += 1;
    previewResetOpacity.jump(1);
}

/**
 * Hide the moving preview parts, snap them to the initial pose, then show them again.
 * Used when "return to initial position" fires after a run settles.
 */
export function fadeResetPreviewToInitial(): Promise<void> {
    if (previewMotion.value === 0) {
        previewMotion.elapsedMs = 0;
        previewResetOpacity.jump(1);
        return Promise.resolve();
    }

    const token = ++resetFadeToken;
    previewResetOpacity.jump(1);

    return animate(previewResetOpacity, 0, {
        type: "tween",
        duration: PREVIEW_RESET_FADE_DURATION,
        ease: "easeOut",
    }).then(
        () => {
            if (token !== resetFadeToken) return;
            previewMotion.value = 0;
            previewMotion.elapsedMs = 0;
            previewResetOpacity.jump(1);
        },
        () => undefined,
    );
}

export function seekPlayback(samples: readonly SamplePoint[], elapsedMs: number) {
    const durationMs = samples.at(-1)?.elapsedMs ?? 0;
    const next = Number.isFinite(elapsedMs) ? Math.min(durationMs, Math.max(0, elapsedMs)) : 0;
    setPreviewValue(interpolateSampleValue(samples, next) ?? 0, next);
}
