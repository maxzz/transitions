import { SpringValue } from "@react-spring/web";
import type { EngineAdapter, ReactSpringParams } from "../model/9-types";

export const reactSpringAdapter: EngineAdapter<ReactSpringParams> = {
    id: "spring",
    run(params, callbacks) {
        const startedAt = performance.now();
        const progress = new SpringValue(0);
        let cancelled = false;

        callbacks.onFrame({ elapsedMs: 0, value: 0 });
        void progress.start({
            from: 0,
            to: 1,
            reset: true,
            config: params,
            onChange: (result) => {
                if (cancelled) return;
                const value = typeof result.value === "number" ? result.value : progress.get();
                callbacks.onFrame({ elapsedMs: performance.now() - startedAt, value });
            },
            onRest: () => {
                if (cancelled) return;
                callbacks.onFrame({ elapsedMs: performance.now() - startedAt, value: progress.get() });
                callbacks.onRest();
            },
        });

        return {
            cancel() {
                cancelled = true;
                progress.stop(true);
            },
        };
    },
};
