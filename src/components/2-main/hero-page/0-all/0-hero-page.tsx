import { useEffect, useRef } from "react";
import { MotionConfig, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ButtonThemeToggle } from "@/components/1-header/8-btn-theme-toggle";
import { HERO_DESCRIPTION } from "../model/1-copy";
import { playTypewriter } from "../model/3-typewriter";
import { HeroLogo } from "../1-content/1-hero-logo";
import { HeroDescription } from "../1-content/2-hero-description";
import { HeroOptOut } from "../1-content/3-hero-opt-out";

const pageVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.55,
            ease: "easeOut" as const,
            when: "beforeChildren" as const,
            delayChildren: 0.35,
        },
    },
};

export function HeroPage() {
    const typed = useMotionValue("");
    const shouldReduceMotion = useReducedMotion();
    const stopTypingRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            stopTypingRef.current?.();
        };
    }, []);

    function startDescription() {
        stopTypingRef.current?.();
        stopTypingRef.current = playTypewriter(
            HERO_DESCRIPTION,
            (value) => typed.set(value),
            { reducedMotion: shouldReduceMotion === true },
        );
    }

    return (
        <MotionConfig reducedMotion="user">
            <motion.section
                className="relative min-h-0 w-full h-full bg-background overflow-hidden flex flex-col"
                initial="hidden"
                animate="show"
                variants={pageVariants}
                aria-labelledby="hero-page-title"
            >
                <div className="absolute top-3 right-3">
                    <ButtonThemeToggle />
                </div>

                <div className="px-6 min-h-0 flex-1 flex flex-col items-center justify-center">
                    <HeroLogo onReady={startDescription} />
                    <HeroDescription typed={typed} />
                </div>

                <HeroOptOut />
            </motion.section>
        </MotionConfig>
    );
}
