import { atom, useAtomValue, useSetAtom } from "jotai";
import { subscribeKey } from "valtio/utils";
import { appSettings, type VisualizerDisplay } from "@/store/1-ui-settings";
import { Tabs } from "@/ui/shadcn/tabs";
import { AnimatedTabsList, AnimatedTabsTrigger } from "@/ui/local-ui/5-animated-tabs";

const displayOptions: readonly { value: VisualizerDisplay; label: string; }[] = [
    { value: "mechanical", label: "Mechanical" },
    { value: "split", label: "Both" },
    { value: "graph", label: "Graph" },
];

const visualizerDisplayValueAtom = atom(appSettings.visualizerDisplay);

visualizerDisplayValueAtom.onMount = (setAtom) =>
    subscribeKey(appSettings, "visualizerDisplay", setAtom);

const visualizerDisplayAtom = atom(
    (get) => get(visualizerDisplayValueAtom),
    (_get, set, value: VisualizerDisplay) => {
        appSettings.visualizerDisplay = value;
        set(visualizerDisplayValueAtom, value);
    },
);

export function PreviewSelectorTab() {
    const visualizerDisplay = useAtomValue(visualizerDisplayAtom);
    const setVisualizerDisplay = useSetAtom(visualizerDisplayAtom);

    return (
        <Tabs
            value={visualizerDisplay}
            onValueChange={(value) => setVisualizerDisplay(value as VisualizerDisplay)}
            aria-label="Visualizer display"
        >
            <AnimatedTabsList layoutId="preview-selector-tabs" className="h-9">
                {displayOptions.map((option) => (
                    <AnimatedTabsTrigger
                        key={option.value}
                        className="min-w-16 h-full"
                        value={option.value}
                        valueAtom={visualizerDisplayAtom}
                    >
                        {option.label}
                    </AnimatedTabsTrigger>
                ))}
            </AnimatedTabsList>
        </Tabs>
    );
}
