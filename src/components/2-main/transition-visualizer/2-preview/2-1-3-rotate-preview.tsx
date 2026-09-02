import { PreviewFrame, PreviewProgress, usePreviewValue } from "./1-preview-frame";

/**
 * Rotation: a wide card turns a quarter turn counter-clockwise, from landscape (progress 0)
 * to portrait (progress 1). Its corners leave the frame while it turns.
 */
export function RotatePreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-2/3 bg-chart-1 rounded-sm flex items-center justify-center">
            <div
                className="w-[90%] h-1/2 bg-background will-change-transform border-[5px] border-foreground rounded-sm"
                style={{ transform: `rotate(${getRotationDegrees(value)}deg)` }}
            />

            <PreviewFrame />
            <PreviewProgress>{formatRotateProgress(value)}</PreviewProgress>
        </div>
    );
}

const FULL_ROTATION_DEGREES = 90;

export function getRotationDegrees(value: number): number {
    return -value * FULL_ROTATION_DEGREES;
}

export function formatRotateProgress(value: number): string {
    return `${Math.round(value * FULL_ROTATION_DEGREES)}°`;
}
