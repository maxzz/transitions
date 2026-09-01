export type EngineId = "react-spring" | "motion" | "gsap";

export type VisualizerView = "preview" | "graph";
export type RunStatus = "idle" | "running" | "settled";

export type SamplePoint = {
    elapsedMs: number;
    value: number;
};

export type RunResult = {
    engineId: EngineId;
    durationMs: number;
    samples: SamplePoint[];
};

export type ReactSpringParams = {
    mass: number;
    tension: number;
    friction: number;
    precision: number;
    velocity: number;
    clamp: boolean;
};

export type MotionParams = {
    stiffness: number;
    damping: number;
    mass: number;
    velocity: number;
    restSpeed: number;
    restDelta: number;
};

export type GsapEaseFamily =
    | "none"
    | "power1"
    | "power2"
    | "power3"
    | "power4"
    | "back"
    | "bounce"
    | "circ"
    | "elastic"
    | "expo"
    | "sine"
    | "steps";

export type GsapEaseDirection = "in" | "out" | "inOut";

export type GsapParams = {
    duration: number;
    ease: GsapEaseFamily;
    direction: GsapEaseDirection;
    elasticAmplitude: number;
    elasticPeriod: number;
    backOvershoot: number;
    steps: number;
};

export type EngineParamsMap = {
    "react-spring": ReactSpringParams;
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
