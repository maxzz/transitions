import { forwardRef } from "react";
import { useAtomValue } from "jotai";
import { visualizationModeAtom } from "../state/atoms";
import { MechanicalSpring, type MechanicalSpringHandle } from "./mechanical-spring";
import { TransformPreview } from "./transform-preview";

export const TransitionScene = forwardRef<
    MechanicalSpringHandle,
    { clamped?: boolean }
>(function TransitionScene({ clamped = false }, ref) {
    const mode = useAtomValue(visualizationModeAtom);

    return mode === "spring"
        ? <MechanicalSpring ref={ref} clamped={clamped} />
        : <TransformPreview key={mode} ref={ref} mode={mode} />;
});
