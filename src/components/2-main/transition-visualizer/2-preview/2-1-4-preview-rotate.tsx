import { PreviewFrame, PreviewProgress, usePreviewValue } from "./1-preview-frame";
import { formatRotateProgress, getRotationDegrees } from "./2-2-format-helpers";

/**
 * Rotation: a wide card turns a quarter turn counter-clockwise, from landscape (progress 0)
 * to portrait (progress 1). Its corners leave the frame while it turns.
 */
export function RotatePreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-3/4 bg-chart-1 rounded-sm flex items-center justify-center">
            <div
                className={rotateClasses}
                style={{ transform: `rotate(${getRotationDegrees(value)}deg)` }}
            />

            <PreviewFrame />
            <PreviewProgress>{formatRotateProgress(value)}</PreviewProgress>
        </div>
    );
}

const rotateClasses = "\
w-[90%] \
h-1/2 \
bg-background \
will-change-transform \
border-(length:--preview-stroke-thick,5px) \
border-foreground \
rounded-sm \
";
