import type { EngineDefinition } from "./9-types";
import type { SpringParams } from "./9-1-1-types-spring";

export const springDefaults: SpringParams = {
    mass: 1,
    tension: 170,
    friction: 26,
    precision: 0.01,
    velocity: 0,
    clamp: false,
};

export const springDefinition: EngineDefinition<SpringParams> = {
    id: "spring",
    label: "react-spring",
    subtitle: "Tension/friction spring physics",
    defaultParams: springDefaults,
    presets: [
        { id: "default", label: "Default", params: springDefaults },
        { id: "gentle", label: "Gentle", params: { ...springDefaults, tension: 120, friction: 14 } },
        { id: "wobbly", label: "Wobbly", params: { ...springDefaults, tension: 180, friction: 12 } },
        { id: "stiff", label: "Stiff", params: { ...springDefaults, tension: 210, friction: 20 } },
        { id: "slow", label: "Slow", params: { ...springDefaults, tension: 280, friction: 60 } },
        { id: "molasses", label: "Molasses", params: { ...springDefaults, tension: 280, friction: 120 } },
    ],
    fields: [
        { kind: "number", key: "mass", label: "Mass", min: 0.1, max: 20, step: 0.1 },
        { kind: "number", key: "tension", label: "Tension", min: 30, max: 400, step: 1 },
        { kind: "number", key: "friction", label: "Friction", min: 1, max: 180, step: 1 },
        { kind: "number", key: "precision", label: "Precision", min: 0.001, max: 1, step: 0.001, scale: "log" },
        {
            kind: "number",
            key: "velocity",
            label: "Velocity",
            min: -0.05,
            max: 0.05,
            step: 0.001,
            description: "Initial velocity in target units per millisecond.",
        },
        { kind: "boolean", key: "clamp", label: "Clamp overshoot", description: "Stop at the target instead of crossing it." },
    ],
};
