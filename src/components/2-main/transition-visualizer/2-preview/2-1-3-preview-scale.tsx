import { PreviewFrame, PreviewProgress, usePreviewValue } from "./1-preview-frame";
import { formatScaleProgress, getScaleFactor } from "./2-2-format-helpers";

/**
 * Scale: a square grows from half the frame (progress 0) to the full frame (progress 1).
 * Two static outlines mark both sizes; overshoot pushes the square past the outer frame.
 */
export function ScalePreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-3/4 bg-chart-1 rounded-sm">
            <div
                className={scaleClasses}
                style={{ transform: `scale(${getScaleFactor(value)})` }}
            />

            <PreviewFrame />
            <div aria-hidden className={frameClasses} />
            <PreviewProgress>{formatScaleProgress(value)}</PreviewProgress>
        </div>
    );
}

const scaleClasses = "\
size-full \
bg-background \
will-change-transform \
border-(length:--preview-stroke-thick,5px) \
border-foreground \
rounded-sm \
";

const frameClasses = "\
absolute inset-1/4 \
border-(length:--preview-stroke,3px) \
border-foreground \
rounded-sm \
pointer-events-none \
";
