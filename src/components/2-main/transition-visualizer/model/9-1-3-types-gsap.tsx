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
