import { type AnimationDefinition } from "motion/react";
import { motion } from "motion/react";
import hummingbird from "@/assets/icons/logo.svg";
import { HERO_EYEBROW, HERO_TITLE } from "../model/1-copy";

const logoVariants = {
    hidden: { opacity: 0, scale: 0.88 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring" as const,
            bounce: 0.2,
            visualDuration: 0.45,
        },
    },
};

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
                type="button"
                className="cursor-pointer"
                onClick={() => window.location.reload()}
                aria-label="Reload hero page"
                title="Reload hero page"
            >
                <img
                    className="size-24 sm:size-28"
                    src={hummingbird}
                    alt=""
                    width={112}
                    height={112}
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
