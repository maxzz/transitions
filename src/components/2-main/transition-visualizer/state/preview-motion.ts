import { proxy } from "valtio";

/**
 * Live progress of the running animation, shared by every preview scene.
 *
 * The engines mutate this proxy on every frame, so it is kept in Valtio rather than Jotai:
 * a mutable scalar written imperatively from an animation loop maps directly onto a proxy,
 * and any preview component can subscribe with `useSnapshot` without being wired through
 * refs or props. Discrete UI choices (engine, params, scene) stay in the Jotai atoms.
 *
 * `value` is the normalized engine output: 0 = start, 1 = target. It may overshoot below 0 or above 1.
 */
export const previewMotion = proxy({
    value: 0,
});

export function setPreviewValue(value: number) {
    previewMotion.value = Number.isFinite(value) ? value : 0;
}

export function getPreviewValue(): number {
    return previewMotion.value;
}

export function resetPreviewValue() {
    previewMotion.value = 0;
}
