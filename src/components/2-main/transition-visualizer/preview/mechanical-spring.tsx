import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";

export type MechanicalSpringHandle = {
    setValue: (value: number) => void;
};

export const MechanicalSpring = forwardRef<MechanicalSpringHandle, { clamped?: boolean }>(
    function MechanicalSpring({ clamped = false }, ref) {
        const springRef = useRef<SVGGElement>(null);
        const massRef = useRef<SVGGElement>(null);
        const valueRef = useRef<SVGTextElement>(null);

        const setValue = useCallback((value: number) => {
            const displacement = 105 * (1 - value);
            const springScale = (175 + displacement) / 175;

            springRef.current?.setAttribute(
                "transform",
                `translate(0 75) scale(1 ${springScale}) translate(0 -75)`,
            );
            massRef.current?.setAttribute("transform", `translate(0 ${displacement})`);
            if (valueRef.current) valueRef.current.textContent = value.toFixed(3);
        }, []);

        useImperativeHandle(ref, () => ({ setValue }), [setValue]);
        useLayoutEffect(() => setValue(0), [setValue]);

        return (
            <svg
                className="h-full w-full text-foreground"
                viewBox="0 0 700 550"
                role="img"
                aria-labelledby="mechanical-spring-title mechanical-spring-description"
            >
                <title id="mechanical-spring-title">Mechanical spring response preview</title>
                <desc id="mechanical-spring-description">
                    A suspended mass moves toward an equilibrium line while the selected animation engine runs.
                </desc>

                <defs>
                    <linearGradient id="mass-fill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="var(--chart-1)" />
                        <stop offset="1" stopColor="var(--chart-3)" />
                    </linearGradient>
                    <pattern id="anchor-hatch" width="12" height="12" patternUnits="userSpaceOnUse">
                        <path d="M-3 12 12-3M3 15 15 3" className="stroke-muted-foreground/40" strokeWidth="2" />
                    </pattern>
                </defs>

                <rect x="100" y="44" width="500" height="30" rx="4" fill="url(#anchor-hatch)" />
                <line x1="100" y1="75" x2="600" y2="75" className="stroke-foreground" strokeWidth="4" />

                <line
                    x1="90"
                    y1="250"
                    x2="610"
                    y2="250"
                    className="stroke-muted-foreground"
                    strokeDasharray="7 7"
                    strokeWidth="2"
                />
                <text x="610" y="241" textAnchor="end" className="font-mono text-[13px] fill-muted-foreground">
                    target 1.0
                </text>

                <g ref={springRef}>
                    <path
                        d="M350 75 L350 88 L315 99 L385 110 L315 121 L385 132 L315 143 L385 154 L315 165 L385 176 L315 187 L385 198 L315 209 L385 220 L350 232 L350 250"
                        fill="none"
                        className="stroke-primary"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="4"
                        vectorEffect="non-scaling-stroke"
                    />
                </g>

                {clamped && (
                    <path
                        d="M285 250 H415 M300 250 v14 M325 250 v14 M350 250 v14 M375 250 v14 M400 250 v14"
                        className="stroke-destructive"
                        strokeWidth="3"
                    />
                )}

                <g ref={massRef}>
                    <path
                        d="M315 250 V278 H385 V250"
                        fill="none"
                        className="stroke-foreground"
                        strokeLinejoin="round"
                        strokeWidth="7"
                    />
                    <rect
                        x="205"
                        y="278"
                        width="290"
                        height="150"
                        rx="10"
                        fill="url(#mass-fill)"
                        className="stroke-foreground"
                        strokeWidth="5"
                    />
                    <circle cx="350" cy="353" r="17" className="fill-background/80 stroke-foreground" strokeWidth="4" />
                    <path d="M350 337 V370" className="stroke-foreground" strokeLinecap="round" strokeWidth="4" />
                </g>

                <g className="font-mono text-[15px]">
                    <text x="100" y="520" className="fill-muted-foreground">progress</text>
                    <text ref={valueRef} x="600" y="520" textAnchor="end" className="fill-foreground">0.000</text>
                </g>
            </svg>
        );
    },
);
