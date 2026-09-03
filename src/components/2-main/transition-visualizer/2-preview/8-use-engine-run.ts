import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { interpolateSampleValue } from "../model/3-samples";
import {
    completeRunAtom,
    hydrateCurveAtom,
    registerStopActiveRun,
    requestRunAtom,
    runResultAtom,
    runStatusAtom,
    runTokenAtom,
} from "../state/atoms";
import { getPreviewValue, previewMotion, resetPreviewValue, setPreviewValue } from "../state/preview-motion";

const REPLAY_FROM_INITIAL_DELAY_MS = 500;
const RETURN_TO_INITIAL_DELAY_MS = 1_000;

/**
 * Plays the precomputed solver curve. The plot is sampled offline when parameters change;
 * this hook only advances a playback clock (scaled by `previewMotion.speed`) and writes
 * the interpolated value into the preview scenes and playhead.
 */
export function useEngineRun() {
    const status = useAtomValue(runStatusAtom);
    const token = useAtomValue(runTokenAtom);
    const result = useAtomValue(runResultAtom);
    const completeRun = useSetAtom(completeRunAtom);
    const requestRun = useSetAtom(requestRunAtom);
    const hydrateCurve = useSetAtom(hydrateCurveAtom);
    const { autoRecordResponse, returnToInitialPosition } = useSnapshot(appSettings);

    useEffect(
        () => {
            hydrateCurve();
        },
        [hydrateCurve]);

    useEffect(
        () => {
            if (!autoRecordResponse) return;
            requestRun();
        },
        [autoRecordResponse, requestRun]);

    useEffect(
        () => {
            if (status !== "settled" || result?.stopped || !returnToInitialPosition) return undefined;
            const timer = setTimeout(() => {
                if (appSettings.returnToInitialPosition) resetPreviewValue();
            }, RETURN_TO_INITIAL_DELAY_MS);
            return () => clearTimeout(timer);
        },
        [status, token, result?.stopped, returnToInitialPosition]);

    useEffect(
        () => {
            if (status !== "running") return undefined;

            const shouldDelayReplay = !appSettings.returnToInitialPosition && getPreviewValue() !== 0;
            let cancelled = false;
            let replayTimer: ReturnType<typeof setTimeout> | null = null;
            let frame = 0;
            let lastNow = 0;
            const samples = result?.samples ?? [];
            const durationMs = samples.at(-1)?.elapsedMs ?? 0;

            const applyTime = (elapsedMs: number) => {
                const value = interpolateSampleValue(samples, elapsedMs) ?? 0;
                setPreviewValue(value, elapsedMs);
            };

            const finish = (stopped = false) => {
                completeRun({
                    token,
                    stopped,
                    elapsedMs: previewMotion.elapsedMs,
                });
            };

            const tick = (now: number) => {
                if (cancelled) return;
                const dt = lastNow === 0 ? 0 : now - lastNow;
                lastNow = now;
                const next = previewMotion.elapsedMs + dt * previewMotion.speed;
                if (next >= durationMs) {
                    applyTime(durationMs);
                    finish();
                    return;
                }
                applyTime(next);
                frame = requestAnimationFrame(tick);
            };

            const launch = () => {
                replayTimer = null;
                if (cancelled) return;
                resetPreviewValue();
                if (durationMs <= 0) {
                    finish();
                    return;
                }
                applyTime(0);
                lastNow = 0;
                frame = requestAnimationFrame(tick);
            };

            const stop = () => {
                if (cancelled) return;
                cancelled = true;
                if (replayTimer !== null) clearTimeout(replayTimer);
                cancelAnimationFrame(frame);
                finish(true);
            };

            registerStopActiveRun(stop);
            if (shouldDelayReplay) {
                resetPreviewValue();
                replayTimer = setTimeout(launch, REPLAY_FROM_INITIAL_DELAY_MS);
            } else {
                launch();
            }

            return () => {
                cancelled = true;
                if (replayTimer !== null) clearTimeout(replayTimer);
                cancelAnimationFrame(frame);
                registerStopActiveRun(null);
            };
        },
        [status, token, result, completeRun]);
}
