import { type MouseEvent, useMemo } from "react";
import { useSetAtom } from "jotai";
import { togglePauseResumeAtom, togglePlayStopAtom } from "../state/atoms";
import { usePreviewValue } from "./1-preview-frame";
import {
    getLoad_Height,
    getLoad_Width,
    getSpringDisplacement,
    getSpringSvgLayers,
    SPRING_BOTTOM_Y,
    SPRING_CENTER_X,
    SPRING_TOP_Y,
} from "./3-1-spring-svg-math";

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
    const layers = useMemo(() => getSpringSvgLayers(tension), [tension]);
    const springScale = (SPRING_BOTTOM_Y - SPRING_TOP_Y + displacement) / (SPRING_BOTTOM_Y - SPRING_TOP_Y);

    return (
        <g transform={`translate(0 ${SPRING_TOP_Y}) scale(1 ${springScale}) translate(0 -${SPRING_TOP_Y})`}>
            <CoilStroke className="stroke-[color-mix(in_oklch,var(--primary),black_26%)]" d={layers.far} />
            <CoilStroke className="stroke-primary" d={layers.near} />
        </g>
    );
}

function CoilStroke({ className, d }: { className: string; d: string; }) {
    return (
        <path
            className={className}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            d={d}
        />
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
