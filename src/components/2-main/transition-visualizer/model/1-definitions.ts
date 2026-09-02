import { clamp } from "@/utils/numbers";
import { type EngineDefinition, type EngineId, type EngineParamsMap, type GsapParams, type MotionParams, type ReactSpringParams } from "./9-types";
import { springDefaults, springDefinition } from "./1-1-definitions-spring";
import { motionDefaults, motionDefinition } from "./1-2-definitions-motion";
import { gsapDefaults, gsapDefinition } from "./1-3-definitions-gsap";

export { gsapDefaults, motionDefaults, springDefaults };

export const engineDefinitions = {
    spring: springDefinition,
    motion: motionDefinition,
    gsap: gsapDefinition,
} as const;

export const engineIds = Object.keys(engineDefinitions) as EngineId[];

export function getDefinition(engineId: EngineId): EngineDefinition<ReactSpringParams | MotionParams | GsapParams> {
    return engineDefinitions[engineId] as EngineDefinition<ReactSpringParams | MotionParams | GsapParams>;
}

export function getValidEngineParams<P>(definition: EngineDefinition<P>, stored: unknown): P {
    const next = { ...definition.defaultParams } as Record<string, unknown>;
    if (!stored || typeof stored !== "object") {
        return next as P;
    }

    const parsed = stored as Record<string, unknown>;
    for (const field of definition.fields) {
        const value = parsed[field.key];
        if (field.kind === "number") {
            if (typeof value === "number" && Number.isFinite(value)) {
                next[field.key] = clamp(value, field.min, field.max);
            }
            continue;
        }
        if (field.kind === "boolean") {
            if (typeof value === "boolean") {
                next[field.key] = value;
            }
            continue;
        }
        if (typeof value === "string" && field.options.some((option) => option.value === value)) {
            next[field.key] = value;
        }
    }

    return next as P;
}

export function getValidParamsByEngine(stored?: Partial<Record<EngineId, unknown>>): EngineParamsMap {
    return {
        spring: getValidEngineParams(engineDefinitions.spring, stored?.spring),
        motion: getValidEngineParams(engineDefinitions.motion, stored?.motion),
        gsap: getValidEngineParams(engineDefinitions.gsap, stored?.gsap),
    };
}
