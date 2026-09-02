import { reactSpringAdapter } from "./react-spring";
import { motionAdapter } from "./motion";
import { gsapAdapter } from "./gsap";

import { type EngineId, type EngineParamsMap, type EngineRun, type EngineRunCallbacks } from "../model/9-types";

export function runEngine<K extends EngineId>(
    engineId: K,
    params: EngineParamsMap[K],
    callbacks: EngineRunCallbacks,
): EngineRun {
    switch (engineId) {
        case "spring":
            return reactSpringAdapter.run(params as EngineParamsMap["spring"], callbacks);
        case "motion":
            return motionAdapter.run(params as EngineParamsMap["motion"], callbacks);
        case "gsap":
            return gsapAdapter.run(params as EngineParamsMap["gsap"], callbacks);
    }
}
