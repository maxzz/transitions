import { useEffect, type RefObject } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useSnapshot } from "valtio";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { appSettings } from "@/store/1-ui-settings";
import { runEngine } from "../engines";
import { decimateSamples, sanitizeSamples } from "../model/samples";
import type { EngineRun, SamplePoint } from "../model/types";
import {
    activeEngineAtom,
    completeRunAtom,
    paramsByEngineAtom,
    publishLiveSamplesAtom,
    registerStopActiveRun,
    requestRunAtom,
    runStatusAtom,
    runTokenAtom,
} from "../state/atoms";
import type { MechanicalSpringHandle } from "./mechanical-spring";

gsap.registerPlugin(useGSAP);

const LIVE_PUBLISH_MS = 48;

export function useEngineRun(
    scopeRef: RefObject<HTMLDivElement | null>,
    sceneRef: RefObject<MechanicalSpringHandle | null>,
) {
    const engineId = useAtomValue(activeEngineAtom);
    const paramsByEngine = useAtomValue(paramsByEngineAtom);
    const status = useAtomValue(runStatusAtom);
    const token = useAtomValue(runTokenAtom);
    const completeRun = useSetAtom(completeRunAtom);
    const publishLiveSamples = useSetAtom(publishLiveSamplesAtom);
    const requestRun = useSetAtom(requestRunAtom);
    const { autoRecordResponse } = useSnapshot(appSettings);
    const activeParams = paramsByEngine[engineId];

    const startRun = (): (() => void) | undefined => {
        if (status !== "running") return undefined;

        let cancelled = false;
        let lastPublishAt = 0;
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

        const run: EngineRun = runEngine(engineId, activeParams, {
            onFrame(sample) {
                if (cancelled) return;
                sceneRef.current?.setValue(sample.value);
                samples.push(sample);
                publishLive();
            },
            onRest() {
                if (cancelled) return;
                finish();
            },
        });

        const stop = () => {
            if (cancelled) return;
            cancelled = true;
            run.cancel();
            finish(true);
        };

        registerStopActiveRun(stop);

        return () => {
            cancelled = true;
            run.cancel();
            registerStopActiveRun(null);
        };
    };

    useEffect(() => {
        if (!autoRecordResponse) return;
        requestRun();
    }, [autoRecordResponse, requestRun]);

    useEffect(() => {
        if (engineId === "gsap") return undefined;
        return startRun();
    }, [engineId, activeParams, status, token]);

    useGSAP(
        () => {
            if (engineId !== "gsap") return undefined;
            return startRun();
        },
        {
            scope: scopeRef,
            dependencies: [engineId, activeParams, status, token],
            revertOnUpdate: true,
        },
    );
}
