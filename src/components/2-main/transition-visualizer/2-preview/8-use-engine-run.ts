import { type RefObject, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { runEngine } from "../engines";
import { decimateSamples, sanitizeSamples } from "../model/3-samples";
import { type EngineRun, type SamplePoint } from "../model/9-types";
import { type MechanicalSpringHandle } from "./2-mechanical-spring-svg";
import { activeEngineAtom, completeRunAtom, paramsByEngineAtom, publishLiveSamplesAtom, registerStopActiveRun, requestRunAtom, runStatusAtom, runTokenAtom } from "../state/atoms";

gsap.registerPlugin(useGSAP);

const LIVE_PUBLISH_MS = 48;
const REPLAY_FROM_INITIAL_DELAY_MS = 500;
const RETURN_TO_INITIAL_DELAY_MS = 1_000;

export function useEngineRun(scopeRef: RefObject<HTMLDivElement | null>, sceneRef: RefObject<MechanicalSpringHandle | null>) {
    const engineId = useAtomValue(activeEngineAtom);
    const paramsByEngine = useAtomValue(paramsByEngineAtom);
    const status = useAtomValue(runStatusAtom);
    const token = useAtomValue(runTokenAtom);
    const completeRun = useSetAtom(completeRunAtom);
    const publishLiveSamples = useSetAtom(publishLiveSamplesAtom);
    const requestRun = useSetAtom(requestRunAtom);
    const { autoRecordResponse } = useSnapshot(appSettings);
    const activeParams = paramsByEngine[engineId];

    /**
     * startRun is a local function whose return type is (() => void) | undefined.
     * That matches how React effects work: the effect callback may return a cleanup function, or nothing.
     * If status !== "running", it returns undefined and does not start a run. It doesn't start a run because the engine is not running.
     * If a run starts, it returns a cleanup function (the one at the bottom) that cancels timers, stops the engine, and unregisters the stop handler.
     * useEffect and useGSAP both do return startRun(), so that cleanup runs when the engine, params, or run token change, or when the preview unmounts.
     * @returns (() => void) | undefined
     */
    const startRun = (): (() => void) | undefined => {
        if (status !== "running") return undefined;

        const shouldDelayReplay = !appSettings.returnToInitialPosition && (sceneRef.current?.getValue() ?? 0) !== 0;
        let cancelled = false;
        let lastPublishAt = 0;
        let replayTimer: ReturnType<typeof setTimeout> | null = null;
        let returnTimer: ReturnType<typeof setTimeout> | null = null;
        let run: EngineRun | null = null;
        const samples: SamplePoint[] = [];
        sceneRef.current?.setValue(0);

        const publishLive = (force = false) => {
            const now = performance.now();
            if (!force && now - lastPublishAt < LIVE_PUBLISH_MS) return;
            lastPublishAt = now;
            publishLiveSamples({ token, samples: samples.slice() });
        };

        const finish = (stopped = false) => {
            const cleanSamples = decimateSamples(sanitizeSamples(samples));
            completeRun({
                token,
                result: {
                    engineId,
                    durationMs: cleanSamples.at(-1)?.elapsedMs ?? 0,
                    samples: cleanSamples,
                    stopped,
                },
            });
        };

        const launchRun = () => {
            replayTimer = null;
            if (cancelled) return;

            run = runEngine(engineId, activeParams, {
                onFrame(sample) {
                    if (cancelled) return;
                    sceneRef.current?.setValue(sample.value);
                    samples.push(sample);
                    publishLive();
                },
                onRest() {
                    if (cancelled) return;
                    finish();
                    if (appSettings.returnToInitialPosition) {
                        returnTimer = setTimeout(() => {
                            returnTimer = null;
                            if (!cancelled && appSettings.returnToInitialPosition) {
                                sceneRef.current?.setValue(0);
                            }
                        }, RETURN_TO_INITIAL_DELAY_MS);
                    }
                },
            });
        };

        const stop = () => {
            if (cancelled) return;
            cancelled = true;
            if (replayTimer !== null) clearTimeout(replayTimer);
            run?.cancel();
            finish(true);
        };

        registerStopActiveRun(stop);
        if (shouldDelayReplay) {
            replayTimer = setTimeout(launchRun, REPLAY_FROM_INITIAL_DELAY_MS);
        } else {
            launchRun();
        }

        return () => {
            cancelled = true;
            if (replayTimer !== null) clearTimeout(replayTimer);
            if (returnTimer !== null) clearTimeout(returnTimer);
            run?.cancel();
            registerStopActiveRun(null);
        };
    };

    useEffect(
        () => {
            if (!autoRecordResponse) return;
            requestRun();
        },
        [autoRecordResponse, requestRun]);

    useEffect(
        () => {
            if (engineId === "gsap") return undefined;
            return startRun();
        },
        [engineId, activeParams, token]);

    useGSAP(
        () => {
            if (engineId !== "gsap") return undefined;
            return startRun();
        },
        {
            scope: scopeRef,
            dependencies: [engineId, activeParams, token],
            revertOnUpdate: true,
        },
    );
}
