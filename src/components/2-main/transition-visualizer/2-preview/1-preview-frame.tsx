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
 * Outline that marks the animation boundaries of a scene.
 * It is stacked above the animated content so the boundary stays readable where the content overflows it.
 */
export function PreviewFrame({ className, filled, ...rest }: HTMLAttributes<HTMLDivElement> & { filled?: boolean; }) {
    return (
        <div
            className={cn("absolute inset-0 border-(length:--preview-stroke,3px) border-foreground rounded-sm pointer-events-none", filled && "bg-chart-1", className)}
            aria-hidden
            {...rest}
        />
    );
}

/** Numeric readout in the bottom-right corner of a scene. */
export function PreviewProgress({ className, children }: { className?: string; children: ReactNode; }) {
    return (
        <span className={cn("absolute right-(--preview-pad,0.75rem) bottom-(--preview-pad,0.5rem) text-(length:--preview-label,1.25rem) font-mono tabular-nums text-foreground leading-none z-10", className)}>
            {children}
        </span>
    );
}
