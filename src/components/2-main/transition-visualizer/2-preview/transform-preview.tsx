import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { VisualizationMode } from "../model/types";
import type { MechanicalSpringHandle } from "./mechanical-spring";

type TransformMode = Exclude<VisualizationMode, "spring">;

const modeLabels: Record<TransformMode, string> = {
    translateY: "Vertical translation",
    scale: "Scale",
    rotate: "Rotation",
    opacity: "Opacity",
};

export const TransformPreview = forwardRef<
    MechanicalSpringHandle,
    { mode: TransformMode }
>(function TransformPreview({ mode }, ref) {
    const targetRef = useRef<SVGGElement>(null);
    const valueRef = useRef<SVGTextElement>(null);
    const currentValueRef = useRef(0);

    const setValue = useCallback((value: number) => {
        currentValueRef.current = value;
        const target = targetRef.current;
        if (!target) return;

        if (mode === "translateY") {
            target.setAttribute("transform", `translate(0 ${170 * (1 - value)})`);
        } else if (mode === "scale") {
            const scale = 0.5 + 0.5 * value;
            target.setAttribute("transform", `translate(350 275) scale(${scale}) translate(-350 -275)`);
        } else if (mode === "rotate") {
            target.setAttribute("transform", `rotate(${-90 * value} 350 275)`);
        } else {
            target.style.opacity = String(value);
        }

        if (valueRef.current) valueRef.current.textContent = value.toFixed(3);
    }, [mode]);
    const getValue = useCallback(() => currentValueRef.current, []);

    useImperativeHandle(ref, () => ({ getValue, setValue }), [getValue, setValue]);
    useLayoutEffect(() => setValue(0), [setValue]);

    return (
        <svg
            className="h-full w-full text-foreground"
            viewBox="0 0 700 550"
            role="img"
            aria-labelledby="transform-preview-title transform-preview-description"
        >
            <title id="transform-preview-title">{modeLabels[mode]} response preview</title>
            <desc id="transform-preview-description">
                The selected animation engine maps its normalized output to {modeLabels[mode].toLowerCase()}.
            </desc>

            <defs>
                <linearGradient id="transform-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="var(--chart-1)" />
                    <stop offset="1" stopColor="var(--chart-3)" />
                </linearGradient>
                <pattern id="opacity-checker" width="32" height="32" patternUnits="userSpaceOnUse">
                    <rect width="32" height="32" className="fill-background" />
                    <path d="M0 0H16V16H0ZM16 16H32V32H16Z" className="fill-muted" />
                </pattern>
            </defs>

            {mode === "translateY" && (
                <>
                    <line
                        x1="110"
                        x2="590"
                        y1="190"
                        y2="190"
                        className="stroke-muted-foreground"
                        strokeDasharray="7 7"
                        strokeWidth="2"
                    />
                    <text x="590" y="177" textAnchor="end" className="font-mono text-[13px] fill-muted-foreground">
                        target
                    </text>
                </>
            )}

            {mode === "opacity" && (
                <rect
                    x="185"
                    y="110"
                    width="330"
                    height="330"
                    rx="18"
                    fill="url(#opacity-checker)"
                    className="stroke-border"
                    strokeWidth="4"
                />
            )}

            <g ref={targetRef}>
                {mode === "translateY" && (
                    <g>
                        <path d="M350 110V166" className="stroke-primary" strokeLinecap="round" strokeWidth="7" />
                        <path d="m326 145 24 24 24-24" fill="none" className="stroke-primary" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
                        <circle cx="350" cy="245" r="64" fill="url(#transform-fill)" className="stroke-foreground" strokeWidth="5" />
                    </g>
                )}
                {mode === "scale" && (
                    <rect
                        x="205"
                        y="130"
                        width="290"
                        height="290"
                        rx="20"
                        fill="url(#transform-fill)"
                        className="stroke-foreground"
                        strokeWidth="6"
                    />
                )}
                {mode === "rotate" && (
                    <rect
                        x="230"
                        y="155"
                        width="240"
                        height="240"
                        rx="18"
                        fill="url(#transform-fill)"
                        className="stroke-foreground"
                        strokeWidth="6"
                    />
                )}
                {mode === "opacity" && (
                    <rect
                        x="185"
                        y="110"
                        width="330"
                        height="330"
                        rx="18"
                        fill="url(#transform-fill)"
                        className="stroke-foreground"
                        strokeWidth="5"
                    />
                )}
            </g>

            <g className="font-mono text-[15px]">
                <text x="100" y="520" className="fill-muted-foreground">progress</text>
                <text ref={valueRef} x="600" y="520" textAnchor="end" className="fill-foreground">0.000</text>
            </g>
        </svg>
    );
});
