import { clamp } from "@/utils/numbers";
import type {
    EngineDefinition,
    EngineId,
    EngineParamsMap,
    GsapParams,
    MotionParams,
    ReactSpringParams,
} from "./types";

export const reactSpringDefaults: ReactSpringParams = {
    mass: 1,
    tension: 170,
    friction: 26,
    precision: 0.01,
    velocity: 0,
    clamp: false,
};

const reactSpringDefinition: EngineDefinition<ReactSpringParams> = {
    id: "react-spring",
    label: "React Spring",
    subtitle: "Tension/friction spring physics",
    defaultParams: reactSpringDefaults,
    presets: [
        { id: "default", label: "Default", params: reactSpringDefaults },
        { id: "gentle", label: "Gentle", params: { ...reactSpringDefaults, tension: 120, friction: 14 } },
        { id: "wobbly", label: "Wobbly", params: { ...reactSpringDefaults, tension: 180, friction: 12 } },
        { id: "stiff", label: "Stiff", params: { ...reactSpringDefaults, tension: 210, friction: 20 } },
        { id: "slow", label: "Slow", params: { ...reactSpringDefaults, tension: 280, friction: 60 } },
        { id: "molasses", label: "Molasses", params: { ...reactSpringDefaults, tension: 280, friction: 120 } },
    ],
    fields: [
        { kind: "number", key: "mass", label: "Mass", min: 0.1, max: 20, step: 0.1 },
        { kind: "number", key: "tension", label: "Tension", min: 1, max: 500, step: 1 },
        { kind: "number", key: "friction", label: "Friction", min: 1, max: 180, step: 1 },
        { kind: "number", key: "precision", label: "Precision", min: 0.001, max: 1, step: 0.001, scale: "log" },
        { kind: "number", key: "velocity", label: "Velocity", min: -0.05, max: 0.05, step: 0.001 },
        { kind: "boolean", key: "clamp", label: "Clamp overshoot", description: "Stop at the target instead of crossing it." },
    ],
};

export const motionDefaults: MotionParams = {
    stiffness: 100,
    damping: 10,
    mass: 1,
    velocity: 0,
    restSpeed: 0.1,
    restDelta: 0.01,
};

const motionDefinition: EngineDefinition<MotionParams> = {
    id: "motion",
    label: "Motion",
    subtitle: "Stiffness/damping spring physics",
    defaultParams: motionDefaults,
    presets: [
        { id: "default", label: "Default", params: motionDefaults },
        { id: "gentle", label: "Gentle", params: { ...motionDefaults, stiffness: 120, damping: 20 } },
        { id: "bouncy", label: "Bouncy", params: { ...motionDefaults, stiffness: 300, damping: 12 } },
        { id: "snappy", label: "Snappy", params: { ...motionDefaults, stiffness: 500, damping: 35 } },
    ],
    fields: [
        { kind: "number", key: "stiffness", label: "Stiffness", min: 1, max: 1000, step: 1 },
        { kind: "number", key: "damping", label: "Damping", min: 1, max: 100, step: 1 },
        { kind: "number", key: "mass", label: "Mass", min: 0.1, max: 20, step: 0.1 },
        { kind: "number", key: "velocity", label: "Velocity", min: -50, max: 50, step: 0.1 },
        { kind: "number", key: "restSpeed", label: "Rest speed", min: 0.001, max: 2, step: 0.001, scale: "log" },
        { kind: "number", key: "restDelta", label: "Rest delta", min: 0.0001, max: 1, step: 0.0001, scale: "log" },
    ],
};

export const gsapDefaults: GsapParams = {
    duration: 1.2,
    ease: "elastic",
    direction: "out",
    elasticAmplitude: 1,
    elasticPeriod: 0.3,
    backOvershoot: 1.7,
    steps: 8,
};

const gsapDefinition: EngineDefinition<GsapParams> = {
    id: "gsap",
    label: "GSAP",
    subtitle: "Duration-based tween easing",
    defaultParams: gsapDefaults,
    presets: [
        { id: "elastic", label: "Elastic", params: gsapDefaults },
        { id: "back", label: "Back", params: { ...gsapDefaults, duration: 0.8, ease: "back" } },
        { id: "bounce", label: "Bounce", params: { ...gsapDefaults, duration: 1, ease: "bounce" } },
        { id: "smooth", label: "Smooth", params: { ...gsapDefaults, duration: 0.7, ease: "power2" } },
        { id: "linear", label: "Linear", params: { ...gsapDefaults, duration: 0.7, ease: "none" } },
    ],
    fields: [
        { kind: "number", key: "duration", label: "Duration", min: 0.1, max: 5, step: 0.05, description: "Seconds" },
        {
            kind: "select",
            key: "ease",
            label: "Ease family",
            options: [
                { label: "None / linear", value: "none" },
                { label: "Power 1", value: "power1" },
                { label: "Power 2", value: "power2" },
                { label: "Power 3", value: "power3" },
                { label: "Power 4", value: "power4" },
                { label: "Back", value: "back" },
                { label: "Bounce", value: "bounce" },
                { label: "Circ", value: "circ" },
                { label: "Elastic", value: "elastic" },
                { label: "Expo", value: "expo" },
                { label: "Sine", value: "sine" },
                { label: "Steps", value: "steps" },
            ],
        },
        {
            kind: "select",
            key: "direction",
            label: "Direction",
            options: [
                { label: "Out", value: "out" },
                { label: "In", value: "in" },
                { label: "In / out", value: "inOut" },
            ],
            visible: ({ ease }) => ease !== "none" && ease !== "steps",
        },
        { kind: "number", key: "elasticAmplitude", label: "Elastic amplitude", min: 0.1, max: 2, step: 0.05, visible: ({ ease }) => ease === "elastic" },
        { kind: "number", key: "elasticPeriod", label: "Elastic period", min: 0.05, max: 1, step: 0.01, visible: ({ ease }) => ease === "elastic" },
        { kind: "number", key: "backOvershoot", label: "Back overshoot", min: 0, max: 5, step: 0.1, visible: ({ ease }) => ease === "back" },
        { kind: "number", key: "steps", label: "Steps", min: 1, max: 30, step: 1, visible: ({ ease }) => ease === "steps" },
    ],
};

export const engineDefinitions = {
    "react-spring": reactSpringDefinition,
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
        "react-spring": getValidEngineParams(engineDefinitions["react-spring"], stored?.["react-spring"]),
        motion: getValidEngineParams(engineDefinitions.motion, stored?.motion),
        gsap: getValidEngineParams(engineDefinitions.gsap, stored?.gsap),
    };
}
