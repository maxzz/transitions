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
                className="mt-6 px-10 h-12 text-base font-semibold text-white bg-[#70a749] hover:bg-[#5d8d3c] rounded-full shadow-md cursor-pointer"
                onClick={() => openPage("visualizer")}
            >
                {HERO_CONTINUE_LABEL}
            </Button>
        </motion.div>
    );
}
