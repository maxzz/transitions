import { type HTMLAttributes, type ReactNode } from "react";
import { useSnapshot } from "valtio";
import { cn } from "@/utils/classnames";
import { previewMotion } from "../state/preview-motion";

/**
 * Live normalized progress (0 = start, 1 = target) of the running animation.
 * Re-renders the calling component on every engine frame.
 */
export function usePreviewValue(): number {
    return useSnapshot(previewMotion).value;
}

/**
 * Square stage that fits the available space. Every preview scene renders inside it,
 * so scenes can be dropped anywhere the stage is used without knowing their surroundings.
 */
export function PreviewCanvas({ className, children }: { className?: string; children: ReactNode; }) {
    return (
        <div className="size-full @container-size grid place-items-center">
            <div className={cn(canvasClasses, className)}>
                {children}
            </div>
        </div>
    );
}

const canvasClasses = "\
relative \
w-[min(100cqw,100cqh)] aspect-square \
bg-muted/60 \
border-2 border-border \
rounded-xl \
grid place-items-center \
";

/**
 * Outline that marks the animation boundaries of a scene.
 * It is stacked above the animated content so the boundary stays readable where the content overflows it.
 */
export function PreviewFrame({ className, filled, ...rest }: HTMLAttributes<HTMLDivElement> & { filled?: boolean; }) {
    return (
        <div
            aria-hidden
            className={cn("absolute inset-0 border-[3px] border-foreground rounded-sm pointer-events-none", filled && "bg-chart-1", className)}
            {...rest}
        />
    );
}

/** Numeric readout in the bottom-right corner of a scene. */
export function PreviewProgress({ className, children }: { className?: string; children: ReactNode; }) {
    return (
        <span className={cn("absolute right-3 bottom-2 text-xl font-mono tabular-nums text-foreground leading-none z-10", className)}>
            {children}
        </span>
    );
}
