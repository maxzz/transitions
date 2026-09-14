import { type AnimationDefinition, type Transition, type Variants } from "motion/react";
import { motion } from "motion/react";
import hummingbird from "@/assets/icons/logo.svg";
import { HERO_EYEBROW, HERO_TITLE } from "../model/1-copy";

export function HeroLogo({ onReady }: { onReady: () => void; }) {
    return (
        <motion.div
            className="flex flex-col items-center will-change-transform"
            variants={logoVariants}
            onAnimationComplete={(definition: AnimationDefinition) => {
                if (definition === "show") {
                    onReady();
                }
            }}
        >
            <button
                className="cursor-pointer"
                onClick={() => window.location.reload()}
                title="Reload hero page"
                aria-label="Reload hero page"
                type="button"
            >
                <motion.img
                    className="size-24 sm:size-28 will-change-transform"
                    src={hummingbird}
                    alt="Hummingbird logo"
                    width={112}
                    height={112}
                    whileHover={{
                        scaleX: [null, 0.9, 0.95, 1, -0.9, -0.95, -1],
                        transition: logoHoverTransition,
                    }}
                />
            </button>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {HERO_EYEBROW}
            </p>

            <h1 id="hero-page-title" className="mt-1 px-4 max-w-full text-3xl sm:text-5xl uppercase tracking-tight text-[#70a749] text-center scale-y-75">
                {HERO_TITLE}
            </h1>
        </motion.div>
    );
}

const logoHoverDuration = 0.2 + 0.7 + 0.1 + 0.2 + 0.7 + 0.1;

const logoHoverTransition: Transition = {
    duration: logoHoverDuration,
    times: [0, 0.2 / logoHoverDuration, 0.5 / logoHoverDuration, 1],
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
};

const logoVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.88,
    },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            bounce: 0.2,
            visualDuration: 0.45,
        },
    },
};
