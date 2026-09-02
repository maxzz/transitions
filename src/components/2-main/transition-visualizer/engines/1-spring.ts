import { SpringValue } from "@react-spring/web";
import type { EngineAdapter, ReactSpringParams } from "../model/9-types";

/**
 * react-spring's frame loop (rafz) advances the physics by a fixed 16.667 ms on the first frame
 * and by at most 64 ms on any later frame, integrating in whole 1 ms steps (`Math.ceil(dt)`).
 */
export const SPRING_FIRST_FRAME_MS = 16.667;
export const SPRING_MAX_FRAME_MS = 64;

export function advanceSpringClock(physicsMs: number, lastFrameAt: number | null, now: number): number {
    const dt = lastFrameAt === null ? SPRING_FIRST_FRAME_MS : Math.min(SPRING_MAX_FRAME_MS, now - lastFrameAt);
    return physicsMs + Math.ceil(dt);
}

export const reactSpringAdapter: EngineAdapter<ReactSpringParams> = {
    id: "spring",
    run(params, callbacks) {
        const progress = new SpringValue(0);
        let cancelled = false;
        let started = false;
        // Elapsed time is the physics time the value was integrated to, not the wall clock:
        // a late or dropped frame moves the value by the same (capped) amount react-spring used.
        let physicsMs = 0;
        let lastFrameAt: number | null = null;

        const onFrame = (value: number) => {
            const now = performance.now();
            physicsMs = advanceSpringClock(physicsMs, lastFrameAt, now);
            lastFrameAt = now;
            callbacks.onFrame({ elapsedMs: physicsMs, value });
        };

        callbacks.onFrame({ elapsedMs: 0, value: 0 });
        void progress.start({
            from: 0,
            to: 1,
            reset: true,
            config: params,
            onChange: (result) => {
                if (cancelled || !started) return;
                onFrame(typeof result.value === "number" ? result.value : progress.get());
            },
            onRest: () => {
                if (cancelled) return;
                callbacks.onFrame({ elapsedMs: physicsMs, value: progress.get() });
                callbacks.onRest();
            },
        });
        started = true;

        return {
            cancel() {
                cancelled = true;
                progress.stop(true);
            },
        };
    },
};
