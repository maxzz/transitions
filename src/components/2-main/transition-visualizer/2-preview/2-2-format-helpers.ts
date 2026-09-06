//---------------------------------------------------------------------------
// 2-1-2-preview-translate.tsx

// The pill is 60% of the frame height, so one frame height equals 100 / 0.6 of the pill's own height.
const PILL_HEIGHT_RATIO = 0.6;

export function getTranslateOffsetPercent(value: number): number {
    return -(value * 100) / PILL_HEIGHT_RATIO;
}

export function formatTranslateProgress(value: number): string {
    return value.toFixed(2);
}

//---------------------------------------------------------------------------
// 2-1-3-preview-scale.tsx

const MIN_SCALE = 0.5;

export function getScaleFactor(value: number): number {
    return MIN_SCALE + value * (1 - MIN_SCALE);
}

export function formatScaleProgress(value: number): string {
    return value.toFixed(2);
}

//---------------------------------------------------------------------------
// 2-1-4-preview-rotate.tsx

const FULL_ROTATION_DEGREES = 90;

export function getRotationDegrees(value: number): number {
    return -value * FULL_ROTATION_DEGREES;
}

export function formatRotateProgress(value: number): string {
    return `${Math.round(value * FULL_ROTATION_DEGREES)}°`;
}

//---------------------------------------------------------------------------
// 2-1-5-preview-opacity.tsx

export function getLegendMarkerTopPercent(value: number): number {
    return (1 - value) * 100;
}

export function formatOpacityProgress(value: number): string {
    return `${Math.round(value * 100)}%`;
}
