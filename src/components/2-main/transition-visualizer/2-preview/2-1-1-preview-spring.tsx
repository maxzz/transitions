import { useAtomValue } from "jotai";
import { MechanicalSpringSvg } from "./3-spring-svg";
import { activeEngineAtom, paramsByEngineAtom } from "../state/atoms";

export function MechanicalSpringScene() {
    const engineId = useAtomValue(activeEngineAtom);
    const params = useAtomValue(paramsByEngineAtom);
    const clamped = engineId === "spring" && params.spring.clamp;
    const activeParams = params[engineId];
    const mass = "mass" in activeParams ? activeParams.mass : undefined;
    const tension = "tension" in activeParams ? activeParams.tension : "stiffness" in activeParams ? activeParams.stiffness : undefined;

    return <MechanicalSpringSvg clamped={clamped} mass={mass} tension={tension} />;
}
