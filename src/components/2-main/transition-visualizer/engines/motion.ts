import { animate } from "motion/react";
import type { EngineAdapter, MotionParams } from "../model/types";

export const motionAdapter: EngineAdapter<MotionParams> = {
    id: "motion",
    run(params, callbacks) {
        const startedAt = performance.now();
        let cancelled = false;

        callbacks.onFrame({ elapsedMs: 0, value: 0 });
        const controls = animate(0, 1, {
            type: "spring",
            ...params,
            onUpdate(value) {
                if (cancelled) return;
                callbacks.onFrame({ elapsedMs: performance.now() - startedAt, value });
            },
            onComplete() {
                if (cancelled) return;
                callbacks.onFrame({ elapsedMs: performance.now() - startedAt, value: 1 });
                callbacks.onRest();
            },
        });

        return {
            cancel() {
                cancelled = true;
                controls.stop();
            },
        };
    },
};
