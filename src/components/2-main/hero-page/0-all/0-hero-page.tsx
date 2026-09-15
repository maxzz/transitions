import { useEffect, useRef, useState } from "react";
import { MotionConfig, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ButtonThemeToggle } from "@/components/1-header/8-btn-theme-toggle";
import { Section3_Footer } from "@/components/3-footer";
import { shouldSkipHeroEnterMotion } from "@/components/0-all/8-page-navigation";
import { HERO_DESCRIPTION } from "../model/1-messages";
import { playTypewriter } from "../model/8-typewriter";
import { HeroLogo } from "./1-hero-logo";
import { HeroDescription } from "./2-hero-description";
import { HeroOptOut } from "./3-hero-opt-out";
import { HeroEnter } from "./4-hero-enter";

export function HeroPage() {
    const typed = useMotionValue("");
    const shouldReduceMotion = useReducedMotion();
    const stopTypingRef = useRef<(() => void) | null>(null);
    const startedTypewriterRef = useRef(false);
    const [skipEnterMotion] = useState(shouldSkipHeroEnterMotion);

    useEffect(
        () => {
            return () => {
                stopTypingRef.current?.();
            };
        },
        []);

    function startDescription() {
        if (startedTypewriterRef.current) {
            return;
        }
        startedTypewriterRef.current = true;
        stopTypingRef.current?.();
        stopTypingRef.current = playTypewriter(HERO_DESCRIPTION, (value) => typed.set(value), { reducedMotion: shouldReduceMotion === true });
    }

    useEffect(
        () => {
            if (skipEnterMotion) {
                startDescription();
            }
        },
        [skipEnterMotion]);

    return (
        <MotionConfig reducedMotion="user">
            <motion.section
                className="relative min-h-0 w-full h-full overflow-hidden flex flex-col main-section-bg"
                initial={skipEnterMotion ? false : "hidden"}
                animate="show"
                variants={pageVariants}
                aria-labelledby="hero-page-title"
            >
                <div className="absolute top-3 right-3">
                    <ButtonThemeToggle />
                </div>

                <div className="px-6 min-h-0 flex-1 flex flex-col items-center justify-center">
                    <HeroLogo onReady={startDescription} />
                    <HeroEnter />
                    <HeroDescription typed={typed} />
                </div>

                <HeroOptOut />
                <Section3_Footer />
            </motion.section>
        </MotionConfig>
    );
}

const pageVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.55,
            ease: "easeOut" as const,
            when: "beforeChildren" as const,
            //delayChildren: 0.35,
        },
    },
};
