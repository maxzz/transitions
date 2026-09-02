import { describe, expect, it } from "vitest";
import { SPRING_FIRST_FRAME_MS, SPRING_MAX_FRAME_MS, advanceSpringClock } from "./1-spring";

describe("react-spring physics clock", () => {
    it("charges a fixed first frame no matter how late it arrives", () => {
        expect(advanceSpringClock(0, null, 590)).toBe(Math.ceil(SPRING_FIRST_FRAME_MS));
    });

    it("advances by the whole-millisecond frame delta afterwards", () => {
        expect(advanceSpringClock(17, 1000, 1016.7)).toBe(17 + 17);
        expect(advanceSpringClock(17, 1000, 1008.3)).toBe(17 + 9);
    });

    it("caps a janky frame the way rafz does", () => {
        expect(advanceSpringClock(100, 1000, 1400)).toBe(100 + SPRING_MAX_FRAME_MS);
    });
});
