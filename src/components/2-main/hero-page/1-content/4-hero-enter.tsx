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
                className="relative isolate mt-6 px-10 h-12 text-base font-semibold text-white bg-[#70a749] hover:bg-[#5d8d3c] border-0 rounded-(--hero-enter-radius) shadow-md [--hero-enter-radius:9999px] [--hero-enter-inset:3px] cursor-pointer"
                onClick={() => openPage("visualizer")}
            >
                <span
                    aria-hidden
                    className="absolute inset-(--hero-enter-inset) border-2 border-white rounded-[calc(var(--hero-enter-radius)-var(--hero-enter-inset))] pointer-events-none"
                />
                {HERO_CONTINUE_LABEL}
            </Button>
        </motion.div>
    );
}
