import { PreviewFrame, PreviewProgress, usePreviewValue } from "./1-preview-frame";

/**
 * Vertical translation: a pill travels the full height of the frame.
 * It starts centered on the bottom edge and ends centered on the top edge, so half of it
 * always sits outside the frame at rest. Overshoot carries it further out.
 */
export function TranslatePreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-1/2 flex items-end justify-center">
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

// The pill is 60% of the frame height, so one frame height equals 100 / 0.6 of the pill's own height.
const PILL_HEIGHT_RATIO = 0.6;

export function getTranslateOffsetPercent(value: number): number {
    return -(value * 100) / PILL_HEIGHT_RATIO;
}

export function formatTranslateProgress(value: number): string {
    return value.toFixed(2);
}
