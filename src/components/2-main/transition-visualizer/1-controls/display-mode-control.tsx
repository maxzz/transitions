import { useSnapshot } from "valtio";
import { appSettings, type VisualizerDisplay } from "@/store/1-ui-settings";
import { Button } from "@/ui/shadcn/button";

const displayOptions: readonly { value: VisualizerDisplay; label: string }[] = [
    { value: "mechanical", label: "Mechanical" },
    { value: "split", label: "Both" },
    { value: "graph", label: "Graph" },
];

export function DisplayModeControl() {
    const { visualizerDisplay } = useSnapshot(appSettings);

    return (
        <div
            className="p-1 bg-muted border border-border rounded-lg inline-flex items-center gap-1"
            role="radiogroup"
            aria-label="Visualizer display"
        >
            {displayOptions.map((option) => {
                const selected = visualizerDisplay === option.value;
                return (
                    <Button
                        key={option.value}
                        className="min-w-16"
                        variant={selected ? "default" : "ghost"}
                        size="xs"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                            appSettings.visualizerDisplay = option.value;
                        }}
                    >
                        {option.label}
                    </Button>
                );
            })}
        </div>
    );
}
