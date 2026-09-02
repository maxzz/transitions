import type { EngineDefinition } from "./9-types";
import type { GsapParams } from "./9-1-3-types-gsap";

export const gsapDefaults: GsapParams = {
    duration: 1.2,
    ease: "elastic",
    direction: "out",
    elasticAmplitude: 1,
    elasticPeriod: 0.3,
    backOvershoot: 1.7,
    steps: 8,
};

export const gsapDefinition: EngineDefinition<GsapParams> = {
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
