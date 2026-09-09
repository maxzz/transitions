import { PreviewFrame, PreviewMovingPart, PreviewMovingSvg, PreviewProgress, usePreviewValue } from "./1-preview-frame";
import { formatOpacityProgress, getLegendMarkerTopPercent } from "./2-2-format-helpers";

/**
 * Opacity: a solid layer fades in over the frame, from transparent (progress 0) to opaque (progress 1).
 * A vertical legend next to the frame shows the same progress as a marker sliding up a gradient bar;
 * overshoot moves the marker past the bar ends while the layer itself stays clamped by the browser.
 */
export function OpacityPreview() {
    const value = usePreviewValue();

    return (
        <div className="relative size-3/4 flex items-center gap-(--preview-gap,1.5rem)">
            <div className="self-stretch flex-1 relative bg-chart-1 rounded-sm">
                <PreviewMovingPart className="size-full">
                    <div
                        className="size-full bg-background will-change-[opacity] rounded-sm"
                        style={{ opacity: value }}
                    />
                </PreviewMovingPart>

                <PreviewFrame />
                <PreviewProgress>{formatOpacityProgress(value)}</PreviewProgress>
            </div>

            <OpacityLegend value={value} />
        </div>
    );
}

function OpacityLegend({ value }: { value: number; }) {
    return (
        <div className="shrink-0 relative w-(--preview-legend,2.5rem) h-full" aria-hidden>
            <div className={legendClasses} />

            {/* Zero-width track spanning the bar interior; the marker's `top` is a percentage of it. */}
            <div className="absolute inset-x-1/2 inset-y-0.75">
                <PreviewMovingSvg
                    className={markerClasses}
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
                </PreviewMovingSvg>
            </div>
        </div>
    );
}

const legendClasses = "\
size-full \
bg-chart-1 \
bg-linear-to-t from-background/0 to-background \
border-(length:--preview-stroke,3px) \
border-foreground \
rounded-sm \
";

const markerClasses = "\
absolute left-0 w-(--preview-marker,5rem) h-[calc(var(--preview-marker,5rem)/5)] -translate-x-1/2 -translate-y-1/2 \
";