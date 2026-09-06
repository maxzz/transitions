import { PreviewFrame, PreviewProgress, usePreviewValue } from "./1-preview-frame";

/**
 * Opacity: a solid layer fades in over the frame, from transparent (progress 0) to opaque (progress 1).
 * A vertical legend next to the frame shows the same progress as a marker sliding up a gradient bar;
 * overshoot moves the marker past the bar ends while the layer itself stays clamped by the browser.
 */
export function OpacityPreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-2/3 flex items-center gap-6">
            <div className="self-stretch flex-1 relative bg-chart-1 rounded-sm">
                <div
                    className="size-full bg-background will-change-[opacity] rounded-sm"
                    style={{ opacity: value }}
                />

                <PreviewFrame />
                <PreviewProgress>{formatOpacityProgress(value)}</PreviewProgress>
            </div>

            <OpacityLegend value={value} />
        </div>
    );
}

function OpacityLegend({ value }: { value: number; }) {
    return (
        <div className="shrink-0 relative w-10 h-full" aria-hidden>
            <div className="size-full bg-chart-1 bg-linear-to-t from-background/0 to-background border-[3px] border-foreground rounded-sm" />

            {/* Zero-width track spanning the bar interior; the marker's `top` is a percentage of it. */}
            <div className="absolute inset-x-1/2 inset-y-0.75">
                <svg
                    className="absolute left-0 w-20 h-4 -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${getLegendMarkerTopPercent(value)}%` }}
                    viewBox="0 0 80 16"
                    fill="none"
                >
                    <path
                        className="stroke-foreground"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        d="M3 2.5 L13.5 8 L3 13.5 Z M77 2.5 L66.5 8 L77 13.5 Z"
                    />
                </svg>
            </div>
        </div>
    );
}

export function getLegendMarkerTopPercent(value: number): number {
    return (1 - value) * 100;
}

export function formatOpacityProgress(value: number): string {
    return `${Math.round(value * 100)}%`;
}
