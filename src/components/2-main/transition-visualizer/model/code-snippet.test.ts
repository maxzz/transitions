import { describe, expect, it } from "vitest";
import { gsapDefaults, motionDefaults, reactSpringDefaults } from "./definitions";
import { formatEngineSnippet, formatSnippetNumber } from "./code-snippet";

describe("formatEngineSnippet", () => {
    it("formats a React Spring config object", () => {
        expect(formatEngineSnippet("react-spring", reactSpringDefaults)).toBe(
            [
                "{",
                "  mass: 1,",
                "  tension: 170,",
                "  friction: 26,",
                "  precision: 0.01,",
                "  velocity: 0,",
                "  clamp: false,",
                "}",
            ].join("\n"),
        );
    });

    it("formats a Motion spring transition", () => {
        expect(formatEngineSnippet("motion", motionDefaults)).toContain("type: \"spring\"");
        expect(formatEngineSnippet("motion", motionDefaults)).toContain("stiffness: 100,");
    });

    it("formats a GSAP tween with the composed ease", () => {
        expect(formatEngineSnippet("gsap", gsapDefaults)).toBe(
            [
                "{",
                "  duration: 1.2,",
                "  ease: \"elastic.out(1,0.3)\",",
                "}",
            ].join("\n"),
        );
    });
});

describe("formatSnippetNumber", () => {
    it("keeps integers and trims float noise", () => {
        expect(formatSnippetNumber(170)).toBe("170");
        expect(formatSnippetNumber(0.00323594)).toBe("0.00323594");
        expect(formatSnippetNumber(1.2)).toBe("1.2");
    });
});
