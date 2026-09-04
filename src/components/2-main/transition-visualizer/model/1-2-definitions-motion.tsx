import type { EngineDefinition } from "./9-types";
import type { MotionParams } from "./9-1-2-types-motion";

export const motionDefaults: MotionParams = {
    stiffness: 100,
    damping: 10,
    mass: 1,
    velocity: 0,
    restSpeed: 0.1,
    restDelta: 0.01,
};

export const motionDefinition: EngineDefinition<MotionParams> = {
    id: "motion",
    label: "motion",
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
