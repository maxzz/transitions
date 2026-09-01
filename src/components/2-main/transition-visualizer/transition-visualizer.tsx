import { useAtomValue, useSetAtom } from "jotai";
import { useSnapshot } from "valtio";
import { Play } from "lucide-react";
import { appSettings } from "@/store/1-ui-settings";
import { Button } from "@/ui/shadcn/button";
import { cn } from "@/utils/classnames";
import { CodeSnippetButton } from "./controls/code-snippet-button";
import { ControlPanel } from "./controls/control-panel";
import { DisplayModeControl } from "./controls/display-mode-control";
import { EngineTabs } from "./controls/engine-tabs";
import { StopMotionButton } from "./controls/stop-motion-button";
import { ResponseGraph } from "./graph/response-graph";
import { PreviewStage } from "./preview/preview-stage";
import {
    activeDefinitionAtom,
    requestRunAtom,
    runStatusAtom,
} from "./state/atoms";

export function TransitionVisualizer() {
    const { visualizerDisplay } = useSnapshot(appSettings);
    const definition = useAtomValue(activeDefinitionAtom);
    const status = useAtomValue(runStatusAtom);
    const requestRun = useSetAtom(requestRunAtom);

    return (
        <section className="mx-auto min-h-0 w-full max-w-[1440px] flex flex-1 flex-col gap-4">
            <div className="shrink-0 sm:flex-row sm:items-end flex flex-col justify-between gap-3">
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

            <div className="min-h-0 bg-background lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] border border-border rounded-xl shadow-sm overflow-hidden grid grid-rows-[auto_minmax(0,1fr)] flex-1">
                <aside className="min-h-0 lg:border-r lg:border-b-0 border-b border-border overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-border">
                        <EngineTabs />
                    </div>
                    <ControlPanel />
                    <div className="p-2 bg-muted/20 border-t border-border flex items-center gap-2">
                        {status === "running" ? (
                            <StopMotionButton className="min-w-0 flex-1" />
                        ) : (
                            <Button className="min-w-0 flex-1" size="sm" onClick={requestRun}>
                                <Play data-icon="inline-start" />
                                Play
                            </Button>
                        )}
                        <CodeSnippetButton />
                    </div>
                </aside>

                <div
                    className={cn(
                        "h-full min-h-0 overflow-auto",
                        visualizerDisplay === "split" && "lg:grid-cols-2 lg:grid-rows-1 grid grid-rows-2",
                    )}
                >
                    <div
                        className={cn(
                            "h-full min-h-48",
                            visualizerDisplay === "graph" && "hidden",
                        )}
                        aria-hidden={visualizerDisplay === "graph"}
                    >
                        <PreviewStage />
                    </div>
                    {visualizerDisplay !== "mechanical" && (
                        <div
                            className={cn(
                                "h-full min-h-48",
                                visualizerDisplay === "split" && "lg:border-l lg:border-border",
                            )}
                        >
                            <ResponseGraph />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
