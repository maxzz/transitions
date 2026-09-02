import { animate, type AnimationPlaybackControls } from "motion/react";
import type { EngineAdapter, MotionParams } from "../model/9-types";

export const motionAdapter: EngineAdapter<MotionParams> = {
    id: "motion",
    run(params, callbacks) {
        let cancelled = false;
        let controls: AnimationPlaybackControls | null = null;
        // `controls.time` is the timeline position the value was resolved for, so it is jitter-free
        // compared to reading the wall clock inside the callback.
        const elapsedMs = () => (controls ? controls.time * 1000 : 0);

        callbacks.onFrame({ elapsedMs: 0, value: 0 });
        controls = animate(0, 1, {
            type: "spring",
            ...params,
            onUpdate(value) {
                if (cancelled) return;
                callbacks.onFrame({ elapsedMs: elapsedMs(), value });
            },
            onComplete() {
                if (cancelled) return;
                callbacks.onFrame({ elapsedMs: elapsedMs(), value: 1 });
                callbacks.onRest();
            },
        });

        return {
            cancel() {
                cancelled = true;
                controls?.stop();
            },
        };
    },
};
