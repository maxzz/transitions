import { gsap } from "gsap";
import type { EngineAdapter, GsapParams } from "../model/9-types";

export function formatGsapEase(params: GsapParams): string {
    if (params.ease === "none") return "none";
    if (params.ease === "steps") return `steps(${Math.round(params.steps)})`;
    if (params.ease === "elastic") {
        return `elastic.${params.direction}(${params.elasticAmplitude},${params.elasticPeriod})`;
    }
    if (params.ease === "back") {
        return `back.${params.direction}(${params.backOvershoot})`;
    }
    return `${params.ease}.${params.direction}`;
}

export const gsapAdapter: EngineAdapter<GsapParams> = {
    id: "gsap",
    run(params, callbacks) {
        const startedAt = performance.now();
        const target = { progress: 0 };
        let cancelled = false;

        callbacks.onFrame({ elapsedMs: 0, value: 0 });
        const tween = gsap.to(target, {
            progress: 1,
            duration: params.duration,
            ease: formatGsapEase(params),
            onUpdate() {
                if (cancelled) return;
                callbacks.onFrame({
                    elapsedMs: performance.now() - startedAt,
                    value: target.progress,
                });
            },
            onComplete() {
                if (cancelled) return;
                callbacks.onFrame({
                    elapsedMs: performance.now() - startedAt,
                    value: target.progress,
                });
                callbacks.onRest();
            },
        });

        return {
            cancel() {
                cancelled = true;
                tween.kill();
            },
        };
    },
};
