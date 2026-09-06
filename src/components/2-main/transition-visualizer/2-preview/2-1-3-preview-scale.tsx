import { PreviewFrame, PreviewProgress, usePreviewValue } from "./1-preview-frame";

/**
 * Scale: a square grows from half the frame (progress 0) to the full frame (progress 1).
 * Two static outlines mark both sizes; overshoot pushes the square past the outer frame.
 */
export function ScalePreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-2/3 bg-chart-1 rounded-sm">
            <div
                className="size-full bg-background will-change-transform border-[5px] border-foreground rounded-sm"
                style={{ transform: `scale(${getScaleFactor(value)})` }}
            />

            <PreviewFrame />
            <div aria-hidden className="absolute inset-1/4 border-[3px] border-foreground rounded-sm pointer-events-none" />
            <PreviewProgress>{formatScaleProgress(value)}</PreviewProgress>
        </div>
    );
}

const MIN_SCALE = 0.5;

export function getScaleFactor(value: number): number {
    return MIN_SCALE + value * (1 - MIN_SCALE);
}

export function formatScaleProgress(value: number): string {
    return value.toFixed(2);
}
