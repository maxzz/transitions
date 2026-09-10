import { animate } from "motion";

const BASE_CHAR_MS = 18;
const SPACE_MS = 28;
const COMMA_MS = 140;
const SENTENCE_MS = 220;
const BREAK_MS = 320;

export function characterDelayMs(char: string, index: number): number {
    const variance = 0.88 + ((index * 37) % 21) / 100;

    if (char === "\n") {
        return Math.round(BREAK_MS * variance);
    }
    if (char === "." || char === "!" || char === "?") {
        return Math.round(SENTENCE_MS * variance);
    }
    if (char === "," || char === ";" || char === ":") {
        return Math.round(COMMA_MS * variance);
    }
    if (char === " ") {
        return Math.round(SPACE_MS * variance);
    }
    return Math.round(BASE_CHAR_MS * variance);
}

export function buildCumulativeDelays(text: string): number[] {
    const cumulative: number[] = [];
    let elapsed = 0;

    for (let index = 0; index < text.length; index++) {
        elapsed += characterDelayMs(text[index]!, index);
        cumulative.push(elapsed);
    }

    return cumulative;
}

export function lengthAtProgress(progress: number, cumulative: readonly number[], totalMs: number): number {
    if (cumulative.length === 0) {
        return 0;
    }
    if (progress >= 1) {
        return cumulative.length;
    }

    const elapsed = progress * totalMs + 1e-6;
    let low = 0;
    let high = cumulative.length;

    while (low < high) {
        const mid = (low + high) >> 1;
        if (cumulative[mid]! <= elapsed) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }

    return low;
}

export function playTypewriter(
    text: string,
    onUpdate: (typed: string) => void,
    options: { reducedMotion?: boolean; } = {},
): () => void {
    if (options.reducedMotion || text.length === 0) {
        onUpdate(text);
        return () => { };
    }

    const cumulative = buildCumulativeDelays(text);
    const totalMs = cumulative.at(-1) ?? 0;
    if (totalMs <= 0) {
        onUpdate(text);
        return () => { };
    }

    onUpdate("");

    const controls = animate(0, 1, {
        duration: totalMs / 1000,
        ease: "linear",
        onUpdate: (progress) => {
            onUpdate(text.slice(0, lengthAtProgress(progress, cumulative, totalMs)));
        },
    });

    return () => {
        controls.stop();
    };
}
