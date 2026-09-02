import { formatGsapEase } from "../engines/gsap";
import type { EngineId, EngineParamsMap } from "./9-types";

export function formatSnippetNumber(value: number): string {
    if (Number.isInteger(value)) return String(value);
    return String(Number.parseFloat(value.toPrecision(6)));
}

export function formatEngineSnippet(engineId: EngineId, params: EngineParamsMap[EngineId]): string {
    if (engineId === "react-spring") {
        const spring = params as EngineParamsMap["react-spring"];
        return formatObject([
            ["mass", formatSnippetNumber(spring.mass)],
            ["tension", formatSnippetNumber(spring.tension)],
            ["friction", formatSnippetNumber(spring.friction)],
            ["precision", formatSnippetNumber(spring.precision)],
            ["velocity", formatSnippetNumber(spring.velocity)],
            ["clamp", String(spring.clamp)],
        ]);
    }

    if (engineId === "motion") {
        const spring = params as EngineParamsMap["motion"];
        return formatObject([
            ["type", "\"spring\""],
            ["stiffness", formatSnippetNumber(spring.stiffness)],
            ["damping", formatSnippetNumber(spring.damping)],
            ["mass", formatSnippetNumber(spring.mass)],
            ["velocity", formatSnippetNumber(spring.velocity)],
            ["restSpeed", formatSnippetNumber(spring.restSpeed)],
            ["restDelta", formatSnippetNumber(spring.restDelta)],
        ]);
    }

    const gsap = params as EngineParamsMap["gsap"];
    return formatObject([
        ["duration", formatSnippetNumber(gsap.duration)],
        ["ease", JSON.stringify(formatGsapEase(gsap))],
    ]);
}

function formatObject(entries: readonly [string, string][]): string {
    const body = entries.map(([key, value]) => `  ${key}: ${value},`).join("\n");
    return `{\n${body}\n}`;
}
