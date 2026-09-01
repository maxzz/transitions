import { useEffect, type RefObject } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { runEngine } from "../engines";
import { decimateSamples, sanitizeSamples } from "../model/samples";
import type { EngineRun, SamplePoint } from "../model/types";
import {
    activeEngineAtom,
    completeRunAtom,
    paramsByEngineAtom,
    runStatusAtom,
    runTokenAtom,
} from "../state/atoms";
import type { MechanicalSpringHandle } from "./mechanical-spring";

gsap.registerPlugin(useGSAP);

export function useEngineRun(
    scopeRef: RefObject<HTMLDivElement | null>,
    sceneRef: RefObject<MechanicalSpringHandle | null>,
) {
    const engineId = useAtomValue(activeEngineAtom);
    const paramsByEngine = useAtomValue(paramsByEngineAtom);
    const status = useAtomValue(runStatusAtom);
    const token = useAtomValue(runTokenAtom);
    const completeRun = useSetAtom(completeRunAtom);
    const activeParams = paramsByEngine[engineId];

    const startRun = (): (() => void) | undefined => {
        if (status !== "running") return undefined;

        let cancelled = false;
        const samples: SamplePoint[] = [];
        sceneRef.current?.setValue(0);

        const run: EngineRun = runEngine(engineId, activeParams, {
            onFrame(sample) {
                if (cancelled) return;
                sceneRef.current?.setValue(sample.value);
                samples.push(sample);
            },
            onRest() {
                if (cancelled) return;
                const cleanSamples = decimateSamples(sanitizeSamples(samples));
                completeRun({
                    token,
                    result: {
                        engineId,
                        durationMs: cleanSamples.at(-1)?.elapsedMs ?? 0,
                        samples: cleanSamples,
                    },
                });
            },
        });

        return () => {
            cancelled = true;
            run.cancel();
        };
    };

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
