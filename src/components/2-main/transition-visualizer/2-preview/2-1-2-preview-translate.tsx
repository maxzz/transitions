import { PreviewFrame, PreviewProgress, usePreviewValue } from "./1-preview-frame";
import { formatTranslateProgress, getTranslateOffsetPercent } from "./2-2-format-helpers";

/**
 * Vertical translation: a pill travels the full height of the frame.
 * It starts centered on the bottom edge and ends centered on the top edge, so half of it
 * always sits outside the frame at rest. Overshoot carries it further out.
 */
export function TranslatePreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-3/5 flex items-end justify-center">
            <div aria-hidden className="absolute inset-0 bg-chart-1 rounded-sm" />

            <div
                className="relative top-[30%] w-[35%] h-[60%] bg-background will-change-transform border-[5px] border-foreground rounded-[20px]"
                style={{ transform: `translateY(${getTranslateOffsetPercent(value)}%)` }}
            />

            <PreviewFrame />
            <PreviewProgress>{formatTranslateProgress(value)}</PreviewProgress>
        </div>
    );
}
