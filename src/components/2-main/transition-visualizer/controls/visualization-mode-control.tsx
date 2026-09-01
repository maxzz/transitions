import { useAtom } from "jotai";
import {
    Blend,
    MoveVertical,
    RotateCw,
    Scaling,
    Waves,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import type { VisualizationMode } from "../model/types";
import { visualizationModeAtom } from "../state/atoms";

const visualizationOptions: readonly {
    value: VisualizationMode;
    label: string;
    Icon: LucideIcon;
}[] = [
    { value: "spring", label: "Mechanical spring", Icon: Waves },
    { value: "translateY", label: "Vertical translation", Icon: MoveVertical },
    { value: "scale", label: "Scale", Icon: Scaling },
    { value: "rotate", label: "Rotation", Icon: RotateCw },
    { value: "opacity", label: "Opacity", Icon: Blend },
];

export function VisualizationModeControl() {
    const [mode, setMode] = useAtom(visualizationModeAtom);

    return (
        <div
            className="p-1 bg-muted/70 border border-border rounded-lg inline-flex items-center gap-1"
            role="radiogroup"
            aria-label="Preview visualization"
        >
            {visualizationOptions.map(({ value, label, Icon }) => {
                const selected = mode === value;
                return (
                    <Button
                        key={value}
                        className="size-7"
                        variant={selected ? "default" : "ghost"}
                        size="icon-sm"
                        role="radio"
                        aria-checked={selected}
                        aria-label={label}
                        title={label}
                        onClick={() => setMode(value)}
                    >
                        <Icon />
                    </Button>
                );
            })}
        </div>
    );
}
