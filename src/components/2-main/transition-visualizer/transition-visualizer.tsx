import { useAtomValue, useSetAtom } from "jotai";
import { useSnapshot } from "valtio";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { appSettings } from "@/store/1-ui-settings";
import { Button } from "@/ui/shadcn/button";
import { cn } from "@/utils/classnames";
import { ControlPanel } from "./controls/control-panel";
import { DisplayModeControl } from "./controls/display-mode-control";
import { EngineTabs } from "./controls/engine-tabs";
import { VisualizationModeControl } from "./controls/visualization-mode-control";
import { ResponseGraph } from "./graph/response-graph";
import { PreviewStage } from "./preview/preview-stage";
import {
    activeDefinitionAtom,
    backToPreviewAtom,
    requestRunAtom,
    runStatusAtom,
} from "./state/atoms";

export function TransitionVisualizer() {
    const { visualizerDisplay } = useSnapshot(appSettings);
    const definition = useAtomValue(activeDefinitionAtom);
    const status = useAtomValue(runStatusAtom);
    const requestRun = useSetAtom(requestRunAtom);
    const backToPreview = useSetAtom(backToPreviewAtom);

    return (
        <section className="mx-auto min-h-0 w-full max-w-[1440px] flex flex-1 flex-col gap-4">
            <div className="sm:flex-row sm:items-end flex flex-col justify-between gap-3">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                        Transition laboratory
                    </p>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
                        {definition.label} visualizer
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Tune native animation parameters, run the same mechanical response, and inspect the recorded curve.
                    </p>
                </div>
                <DisplayModeControl />
            </div>

            <div className="min-h-0 bg-background lg:grid-cols-[15rem_minmax(0,1fr)] border border-border rounded-xl shadow-sm overflow-hidden grid flex-1">
                <aside className="min-h-0 lg:border-r lg:border-b-0 border-b border-border flex flex-col">
                    <div className="p-2 border-b border-border">
                        <EngineTabs />
                    </div>
                    <ControlPanel />
                    <div className="mt-auto p-2 bg-muted/20 border-t border-border">
                        {status === "settled" ? (
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" variant="outline" onClick={backToPreview}>
                                    <ArrowLeft data-icon="inline-start" />
                                    Back
                                </Button>
                                <Button size="sm" onClick={requestRun}>
                                    <RotateCcw data-icon="inline-start" />
                                    Replay
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full"
                                size="sm"
                                disabled={status === "running"}
                                onClick={requestRun}
                            >
                                <Play data-icon="inline-start" />
                                {status === "running" ? "Recording…" : "Run transition"}
                            </Button>
                        )}
                    </div>
                </aside>

                <div className="min-h-0 flex flex-col">
                    <div
                        className={cn(
                            "min-h-0 flex-1",
                            visualizerDisplay === "split" && "lg:grid-cols-2 grid",
                        )}
                    >
                        <div
                            className={cn("min-h-0", visualizerDisplay === "graph" && "hidden")}
                            aria-hidden={visualizerDisplay === "graph"}
                        >
                            <PreviewStage />
                        </div>
                        {visualizerDisplay !== "mechanical" && (
                            <div
                                className={cn(
                                    "min-h-0",
                                    visualizerDisplay === "split" && "lg:border-l lg:border-border",
                                )}
                            >
                                <ResponseGraph />
                            </div>
                        )}
                    </div>
                    <div className="p-2 bg-muted/20 border-t border-border flex items-center justify-center">
                        <VisualizationModeControl />
                    </div>
                </div>
            </div>
        </section>
    );
}
