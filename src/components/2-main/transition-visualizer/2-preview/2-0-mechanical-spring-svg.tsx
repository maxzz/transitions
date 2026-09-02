import { useMemo } from "react";
import { usePreviewValue } from "./1-preview-frame";

/**
 * Mechanical spring: a mass hangs from a coil and settles on the target line.
 * The coil stiffness (wraps) follows the tension and the load size follows the mass.
 */
export function MechanicalSpring({ clamped = false, mass, tension }: { clamped?: boolean; mass?: number; tension?: number; }) {
    const value = usePreviewValue();
    const springPath = useMemo(() => getMechanicalSpringPath(tension), [tension]);
    const loadHeight = getMechanicalLoadHeight(mass);
    const loadCenterY = LOAD_TOP_Y + loadHeight / 2;
    const displacement = getMechanicalSpringDisplacement(value);
    const springScale = (SPRING_BOTTOM_Y - SPRING_TOP_Y + displacement) / (SPRING_BOTTOM_Y - SPRING_TOP_Y);

    return (
        <svg className="h-full w-full text-foreground" viewBox="0 0 700 650" role="img" aria-labelledby="mechanical-spring-title mechanical-spring-description">
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
                className="stroke-muted-foreground"
                strokeDasharray="7 7"
                strokeWidth="2"
                x1="90"
                y1="250"
                x2="610"
                y2="250"
            />
            <text x="610" y="241" textAnchor="end" className="font-mono text-[13px] fill-muted-foreground">
                target 1.0
            </text>

            <g transform={`translate(0 ${SPRING_TOP_Y}) scale(1 ${springScale}) translate(0 -${SPRING_TOP_Y})`}>
                <path
                    className="stroke-primary"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    d={springPath}
                />
            </g>

            {clamped && (
                <path className="stroke-destructive" strokeWidth="3" d="M285 250 H415 M300 250 v14 M325 250 v14 M350 250 v14 M375 250 v14 M400 250 v14" />
            )}

            <g transform={`translate(0 ${displacement})`}>
                <rect
                    className="stroke-foreground"
                    fill="url(#mass-fill)"
                    height={loadHeight}
                    strokeWidth="5"
                    x="205"
                    y={LOAD_TOP_Y}
                    rx="10"
                    width="290"
                />
                <path
                    className="stroke-foreground"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="5"
                    d="M300 285 V270 C300 243 400 243 400 270 V285"
                />

                <circle className="fill-background/80 stroke-foreground" strokeWidth="4" cx="350" cy={loadCenterY} r="17" />

                <path
                    className="stroke-foreground"
                    strokeLinecap="round"
                    strokeWidth="4"
                    d={`M350 ${loadCenterY - 16} V${loadCenterY + 17}`}
                />
            </g>

            <g className="font-mono text-[15px]">
                <text x="100" y="620" className="fill-muted-foreground">progress</text>
                <text x="600" y="620" textAnchor="end" className="fill-foreground">{value.toFixed(3)}</text>
            </g>
        </svg>
    );
}

const LOAD_TOP_Y = 278;
const SPRING_TOP_Y = 75;
const SPRING_BOTTOM_Y = 250;
const SPRING_CENTER_X = 350;
const SPRING_RADIUS = 35;
const SPRING_STEM_HEIGHT = 13;
const MIN_SPRING_TENSION = 30;
const MAX_SPRING_TENSION = 400;
const MIN_SPRING_WRAPS = 2;
const MAX_SPRING_WRAPS = 18;
const DEFAULT_SPRING_TENSION = 170;
const SAMPLES_PER_WRAP = 12;
const SPRING_TRAVEL = 105;
const MIN_SPRING_DISPLACEMENT = -150;
const MAX_SPRING_DISPLACEMENT = 145;
const MIN_LOAD_HEIGHT = 50;
const MAX_LOAD_HEIGHT = 210;
const DEFAULT_LOAD_HEIGHT = 150;
const MIN_MASS = 0.1;
const MAX_MASS = 20;

export function getMechanicalSpringWraps(tension?: number): number {
    const resolvedTension = tension === undefined || !Number.isFinite(tension) ? DEFAULT_SPRING_TENSION : tension;
    const clampedTension = Math.min(MAX_SPRING_TENSION, Math.max(MIN_SPRING_TENSION, resolvedTension));
    const normalizedTension = (clampedTension - MIN_SPRING_TENSION) / (MAX_SPRING_TENSION - MIN_SPRING_TENSION);

    return Math.round(MIN_SPRING_WRAPS + normalizedTension * (MAX_SPRING_WRAPS - MIN_SPRING_WRAPS));
}

export function getMechanicalSpringPath(tension?: number): string {
    const wraps = getMechanicalSpringWraps(tension);
    const coilTopY = SPRING_TOP_Y + SPRING_STEM_HEIGHT;
    const coilBottomY = SPRING_BOTTOM_Y - SPRING_STEM_HEIGHT;
    const sampleCount = wraps * SAMPLES_PER_WRAP;
    const commands = [
        `M ${SPRING_CENTER_X} ${SPRING_TOP_Y}`,
        `L ${SPRING_CENTER_X} ${coilTopY}`,
    ];

    for (let index = 1; index <= sampleCount; index += 1) {
        const progress = index / sampleCount;
        const x = SPRING_CENTER_X
            + Math.sin(progress * wraps * Math.PI * 2) * SPRING_RADIUS;
        const y = coilTopY + progress * (coilBottomY - coilTopY);
        commands.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
    }

    commands.push(`L ${SPRING_CENTER_X} ${SPRING_BOTTOM_Y}`);
    return commands.join(" ");
}

export function getMechanicalSpringDisplacement(value: number): number {
    const resolvedValue = Number.isFinite(value) ? value : 0;
    const displacement = SPRING_TRAVEL * (1 - resolvedValue);

    return Math.min(
        MAX_SPRING_DISPLACEMENT,
        Math.max(MIN_SPRING_DISPLACEMENT, displacement),
    );
}

export function getMechanicalLoadHeight(mass?: number): number {
    if (mass === undefined || !Number.isFinite(mass)) return DEFAULT_LOAD_HEIGHT;
    const clampedMass = Math.min(MAX_MASS, Math.max(MIN_MASS, mass));
    const normalizedMass = Math.log(clampedMass / MIN_MASS) / Math.log(MAX_MASS / MIN_MASS);
    return MIN_LOAD_HEIGHT + normalizedMass * (MAX_LOAD_HEIGHT - MIN_LOAD_HEIGHT);
}
