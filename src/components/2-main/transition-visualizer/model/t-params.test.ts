import { describe, expect, it } from "vitest";
import { engineDefinitions, getValidEngineParams, springDefaults } from "./1-definitions";

describe("persisted engine params", () => {
    it("falls back to defaults when stored data is missing", () => {
        expect(getValidEngineParams(engineDefinitions.spring, undefined)).toEqual(springDefaults);
    });

    it("keeps known values and clamps numbers to the field range", () => {
        expect(getValidEngineParams(engineDefinitions.spring, {
            mass: 8,
            tension: 900,
            clamp: true,
            extra: "ignore",
        })).toEqual({
            ...springDefaults,
            mass: 8,
            tension: 400,
            clamp: true,
        });
    });

    it("ignores invalid gsap ease values", () => {
        expect(getValidEngineParams(engineDefinitions.gsap, {
            ease: "not-an-ease",
            duration: 0.8,
        })).toMatchObject({
            ease: "elastic",
            duration: 0.8,
        });
    });
});
