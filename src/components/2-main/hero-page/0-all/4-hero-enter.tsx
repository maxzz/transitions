import { motion } from "motion/react";
import { Button } from "@/ui/shadcn/button";
import { HERO_CONTINUE_LABEL } from "../model/1-copy";
import { openPage } from "@/store/1-ui-settings";

const enterVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut" as const,
        },
    },
};

export function HeroEnter() {
    return (
        <motion.div variants={enterVariants}>
            <Button
                type="button"
                size="lg"
                className={enterButtonClasses}
                onClick={() => openPage("visualizer")}
            >
                <span
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-b from-white/60 to-transparent dark:from-white/20 rounded-full pointer-events-none"
                />
                <span className="relative">{HERO_CONTINUE_LABEL}</span>
            </Button>
        </motion.div>
    );
}

const enterButtonClasses = "\
relative isolate \
mt-6 px-10 h-12 \
text-base font-semibold \
text-[#2d5a1c] \
bg-white/70 \
hover:bg-white/85 \
dark:text-[#e8f6dc] \
dark:bg-white/16 \
dark:hover:bg-white/24 \
dark:border-white/25 \
backdrop-blur-xl backdrop-saturate-150 \
border border-white/80 \
rounded-full \
shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(45,90,28,0.06),0_8px_24px_rgba(45,90,28,0.12)] \
dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.35),0_10px_28px_rgba(0,0,0,0.45)] \
overflow-hidden \
cursor-pointer";
