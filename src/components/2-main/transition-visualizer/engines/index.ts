import { gsapAdapter } from "./gsap";
import { motionAdapter } from "./motion";
import { reactSpringAdapter } from "./react-spring";
import type {
    EngineId,
    EngineParamsMap,
    EngineRun,
    EngineRunCallbacks,
} from "../model/types";

export function runEngine<K extends EngineId>(
    engineId: K,
    params: EngineParamsMap[K],
    callbacks: EngineRunCallbacks,
): EngineRun {
    switch (engineId) {
        case "react-spring":
            return reactSpringAdapter.run(params as EngineParamsMap["react-spring"], callbacks);
        case "motion":
            return motionAdapter.run(params as EngineParamsMap["motion"], callbacks);
        case "gsap":
            return gsapAdapter.run(params as EngineParamsMap["gsap"], callbacks);
    }
}
