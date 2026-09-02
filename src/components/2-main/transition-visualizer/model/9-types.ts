import type { SpringParams } from "./9-1-1-types-spring";
import type { MotionParams } from "./9-1-2-types-motion";
import type { GsapEaseDirection, GsapEaseFamily, GsapParams } from "./9-1-3-types-gsap";

export type { GsapEaseDirection, GsapEaseFamily, GsapParams, MotionParams, SpringParams as ReactSpringParams };

export type EngineId = "spring" | "motion" | "gsap";

export type VisualizationMode = "spring" | "translateY" | "scale" | "rotate" | "opacity";

export type RunStatus = "idle" | "running" | "settled";

export type SamplePoint = {
    elapsedMs: number;
    value: number;
};

export type RunResult = {
    engineId: EngineId;
    durationMs: number;
    plotDurationMs?: number;
    samples: SamplePoint[];
    stopped?: boolean;
};

export type EngineParamsMap = {
    spring: SpringParams;
    motion: MotionParams;
    gsap: GsapParams;
};

export type NumberField<P> = {
    kind: "number";
    key: keyof P & string;
    label: string;
    min: number;
    max: number;
    step: number;
    scale?: "linear" | "log";
    description?: string;
    visible?: (params: P) => boolean;
};

export type BooleanField<P> = {
    kind: "boolean";
    key: keyof P & string;
    label: string;
    description?: string;
    visible?: (params: P) => boolean;
};

export type SelectField<P> = {
    kind: "select";
    key: keyof P & string;
    label: string;
    options: readonly { label: string; value: string }[];
    description?: string;
    visible?: (params: P) => boolean;
};

export type ParamField<P> = NumberField<P> | BooleanField<P> | SelectField<P>;

export type EnginePreset<P> = {
    id: string;
    label: string;
    params: P;
};

export type EngineDefinition<P> = {
    id: EngineId;
    label: string;
    subtitle: string;
    fields: readonly ParamField<P>[];
    presets: readonly EnginePreset<P>[];
    defaultParams: P;
};

export type EngineRun = {
    cancel: () => void;
};

export type EngineRunCallbacks = {
    onFrame: (sample: SamplePoint) => void;
    onRest: () => void;
};

export type EngineAdapter<P> = {
    id: EngineId;
    run: (params: P, callbacks: EngineRunCallbacks) => EngineRun;
};
