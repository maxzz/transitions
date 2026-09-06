import { type MouseEvent, useMemo } from "react";
import { useSetAtom } from "jotai";
import { togglePauseResumeAtom, togglePlayStopAtom } from "../state/atoms";
import { usePreviewValue } from "./1-preview-frame";

/**
 * Mechanical spring: a mass hangs from a coil and settles on the target line.
 * The coil stiffness (wraps) follows the tension and the load size follows the mass.
 */
export function MechanicalSpringSvg({ clamped = false, mass, tension }: { clamped?: boolean; mass?: number; tension?: number; }) {
    const value = usePreviewValue();
    const togglePauseResume = useSetAtom(togglePauseResumeAtom);
    const displacement = getSpringDisplacement(value);

    return (
        <svg
            className="h-full w-full text-foreground select-none cursor-pointer"
            viewBox="0 0 700 650"
            role="img"
            aria-labelledby="mechanical-spring-title mechanical-spring-description"
            onClick={togglePauseResume}
        >
            <Part_Backdrop />

            <Part_Ceiling />

            {/* Target line */}
            <line
                className="stroke-muted-foreground stroke-[1.5]"
                strokeDasharray="3 3"
                x1="90"
                y1="250"
                x2="610"
                y2="250"
            />
            <text x="610" y="241" textAnchor="end" className="font-mono text-[13px] fill-muted-foreground">
                target 1.0
            </text>

            <Part_Spring tension={tension} displacement={displacement} />

            {clamped && (
                <path className="stroke-destructive" strokeWidth="3" d="M285 250 H415 M300 250 v14 M325 250 v14 M350 250 v14 M375 250 v14 M400 250 v14" />
            )}

            <g transform={`translate(0 ${displacement})`}>
                <Part_Load mass={mass} />
            </g>

            <g className="font-mono text-[15px]">
                <text x="100" y="620" className="fill-muted-foreground">progress</text>
                <text x="600" y="620" textAnchor="end" className="fill-foreground">{value.toFixed(3)}</text>
            </g>
        </svg>
    );
}

function Part_Spring({ tension, displacement }: { tension?: number; displacement: number; }) {
    const springPath = useMemo(() => getSpringSvgPath(tension), [tension]);
    const springScale = (SPRING_BOTTOM_Y - SPRING_TOP_Y + displacement) / (SPRING_BOTTOM_Y - SPRING_TOP_Y);

    return (
        <g transform={`translate(0 ${SPRING_TOP_Y}) scale(1 ${springScale}) translate(0 -${SPRING_TOP_Y})`}>
            <path
                className="stroke-primary"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                d={springPath}
            />
        </g>
    );
}

function Part_Ceiling() {
    return (<>
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
    </>);
}

function Part_Load({ mass }: { mass?: number; }) {
    const togglePlayStop = useSetAtom(togglePlayStopAtom);
    const loadWidth = getLoad_Width(mass);
    const loadHeight = getLoad_Height(mass);
    const loadX = SPRING_CENTER_X - loadWidth / 2;
    const loadCenterY = SPRING_BOTTOM_Y + loadHeight / 2;

    function onLoadClick(event: MouseEvent<SVGGElement>) {
        event.stopPropagation();
        togglePlayStop();
    }

    return (
        <g className="cursor-pointer" onClick={onLoadClick}>
            {/* Mass */}
            <rect
                className="stroke-foreground"
                fill="url(#mass-fill)"
                height={loadHeight}
                strokeWidth="2"
                x={loadX}
                y={SPRING_BOTTOM_Y}
                rx="10"
                width={loadWidth}
            />

            {/* m {mass} */}
            <text x={SPRING_CENTER_X} y={loadCenterY} textAnchor="middle" className="font-serif text-[17px] fill-foreground italic">m</text>
        </g>
    );
}

//---------------------------------------------------------------------------
// Spring coil

/** Side-view coil: alternating cubic Bézier C-shapes, not a sampled polyline. */
export function getSpringSvgPath(tension?: number): string {
    const wraps = getSpringWraps(tension);
    const coilTopY = SPRING_TOP_Y + SPRING_STEM_HEIGHT;
    const coilHeight = SPRING_BOTTOM_Y - SPRING_STEM_HEIGHT - coilTopY;
    const halfWraps = wraps * 2;
    const step = coilHeight / halfWraps;
    const commands = [
        `M ${SPRING_CENTER_X} ${SPRING_TOP_Y}`,
        `L ${SPRING_CENTER_X} ${coilTopY}`,
    ];

    for (let index = 0; index < halfWraps; index += 1) {
        const sideX = SPRING_CENTER_X + (index % 2 === 0 ? SPRING_RADIUS : -SPRING_RADIUS);
        const y0 = coilTopY + index * step;
        const y1 = y0 + step;
        const c1y = y0 + step * COIL_CONTROL_PULL;
        const c2y = y1 - step * COIL_CONTROL_PULL;

        commands.push(`C ${sideX.toFixed(2)} ${c1y.toFixed(2)}, ${sideX.toFixed(2)} ${c2y.toFixed(2)}, ${SPRING_CENTER_X.toFixed(2)} ${y1.toFixed(2)}`);
    }

    commands.push(`L ${SPRING_CENTER_X} ${SPRING_BOTTOM_Y}`);
    return commands.join(" ");
}

const SPRING_TOP_Y = 75;
const SPRING_BOTTOM_Y = 250;
const SPRING_CENTER_X = 350;
const SPRING_RADIUS = 35;
const SPRING_STEM_HEIGHT = 13;
const COIL_CONTROL_PULL = 0.22;

export function getSpringWraps(tension?: number): number {
    const resolvedTension = tension === undefined || !Number.isFinite(tension) ? DEFAULT_SPRING_TENSION : tension;
    const clampedTension = Math.min(MAX_SPRING_TENSION, Math.max(MIN_SPRING_TENSION, resolvedTension));
    const normalizedTension = (clampedTension - MIN_SPRING_TENSION) / (MAX_SPRING_TENSION - MIN_SPRING_TENSION);

    return Math.round(MIN_SPRING_WRAPS + normalizedTension * (MAX_SPRING_WRAPS - MIN_SPRING_WRAPS));
}

const DEFAULT_SPRING_TENSION = 170;
const MIN_SPRING_TENSION = 30;
const MAX_SPRING_TENSION = 400;
const MIN_SPRING_WRAPS = 2;
const MAX_SPRING_WRAPS = 18;

export function getSpringDisplacement(value: number): number {
    const resolvedValue = Number.isFinite(value) ? value : 0;
    const displacement = SPRING_TRAVEL * (1 - resolvedValue);

    return Math.min(MAX_SPRING_DISPLACEMENT, Math.max(MIN_SPRING_DISPLACEMENT, displacement));
}

const SPRING_TRAVEL = 105;
const MIN_SPRING_DISPLACEMENT = -150;
const MAX_SPRING_DISPLACEMENT = 145;

//---------------------------------------------------------------------------
// Load

export function getLoad_Height(mass?: number): number {
    return interpolateLoadSize(mass, MIN_LOAD_HEIGHT, MAX_LOAD_HEIGHT, DEFAULT_LOAD_HEIGHT);
}

export function getLoad_Width(mass?: number): number {
    return interpolateLoadSize(mass, MIN_LOAD_WIDTH, MAX_LOAD_WIDTH, DEFAULT_LOAD_WIDTH);
}

const MIN_LOAD_WIDTH = 100;
const MIN_LOAD_HEIGHT = 120;
const MAX_LOAD_WIDTH = 240;
const MAX_LOAD_HEIGHT = 250;
const DEFAULT_LOAD_WIDTH = 120;
const DEFAULT_LOAD_HEIGHT = 170;

function interpolateLoadSize(mass: number | undefined, min: number, max: number, fallback: number): number {
    if (mass === undefined || !Number.isFinite(mass)) {
        return fallback;
    }

    const clampedMass = Math.min(MAX_MASS, Math.max(MIN_MASS, mass));
    const normalizedMass = (clampedMass - MIN_MASS) / (MAX_MASS - MIN_MASS);

    return min + normalizedMass * (max - min);
}

const MIN_MASS = 0.1;
const MAX_MASS = 20;

//---------------------------------------------------------------------------

function Part_Backdrop() {
    // That <rect> is an invisible click target for the whole preview.
    // ------------------------------------------------------------------------------------------------
    // The SVG listens for onClick={togglePauseResume} and shows cursor-pointer, but empty SVG space usually 
    // does not receive pointer events. Only painted shapes (the coil, mass, lines, text) would be clickable.

    // The rect matches the 700×650 viewBox and uses fill-transparent, so it fills the canvas without drawing anything. 
    // Clicks in the gaps still hit this rect and bubble to the SVG, which pauses or resumes playback. The mass still 
    // has its own click handler (stopPropagation + play/stop), so those clicks do not go through this backdrop.
    return (<>
        <title id="mechanical-spring-title">
            Mechanical spring response preview
        </title>

        <desc id="mechanical-spring-description">
            A suspended mass moves toward an equilibrium line while the selected animation engine runs.
        </desc>
        
        <rect width="700" height="650" className="fill-transparent" />
    </>);
}
