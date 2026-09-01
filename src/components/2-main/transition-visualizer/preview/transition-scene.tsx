import { forwardRef } from "react";
import { useAtomValue } from "jotai";
import { visualizationModeAtom } from "../state/atoms";
import { MechanicalSpring, type MechanicalSpringHandle } from "./mechanical-spring";
import { TransformPreview } from "./transform-preview";

export const TransitionScene = forwardRef<
    MechanicalSpringHandle,
    { clamped?: boolean; mass?: number }
>(function TransitionScene({ clamped = false, mass }, ref) {
    const mode = useAtomValue(visualizationModeAtom);

    return mode === "spring"
        ? <MechanicalSpring ref={ref} clamped={clamped} mass={mass} />
        : <TransformPreview key={mode} ref={ref} mode={mode} />;
});
