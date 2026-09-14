import { useState } from "react";
import { type MotionValue, motion, useMotionValueEvent } from "motion/react";
import { HERO_DESCRIPTION } from "../model/1-copy";

export function HeroDescription({ typed }: { typed: MotionValue<string>; }) {
    const [showCaret, setShowCaret] = useState(() => typed.get() !== HERO_DESCRIPTION);

    useMotionValueEvent(typed, "change", (value) => {
        setShowCaret(value !== HERO_DESCRIPTION);
    });

    return (
        <p
            className="mt-6 max-w-xl min-h-24 text-sm sm:text-base text-muted-foreground text-center leading-relaxed contain-[layout]"
            aria-label={HERO_DESCRIPTION}
        >
            <motion.span aria-hidden>{typed}</motion.span>
            {showCaret && (
                <motion.span
                    className="ml-0.5 w-[0.55ch] inline-block text-primary"
                    aria-hidden
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                >
                    ▌
                </motion.span>
            )}
        </p>
    );
}
