import { useAtomValue, useSetAtom } from "jotai";
import { useSnapshot } from "valtio";
import { Play } from "lucide-react";
import { appSettings } from "@/store/1-ui-settings";
import { Button } from "@/ui/shadcn/button";
import { cn } from "@/utils/classnames";
import { Pane_Controls } from "../1-controls/0-control-panel";
import { PreviewSelectorTab } from "../1-controls/preview-selector-tab";
import { EngineTabs } from "../1-controls/engine-tabs";
import { StopMotionButton } from "../1-controls/stop-motion-button";
import { ResponseGraph } from "../3-recorded-graph/0-recorder-view";
import { PreviewStage } from "../2-preview/0-preview-stage";
import { activeDefinitionAtom, requestRunAtom, runStatusAtom } from "../state/atoms";

export function TransitionVisualizer() {
    const { visualizerDisplay } = useSnapshot(appSettings);
    const isSplit = visualizerDisplay === "split";
    const isGraph = visualizerDisplay === "graph";
    const isMechanical = visualizerDisplay === "mechanical";

    return (
        <section className="flex-1 mx-auto min-h-0 w-full max-w-360 flex flex-col gap-4">
            <VisualizerHeader />

            <div className={mainClasses}>
                <ControlSidebar />

                <div className={cn("h-full min-h-0 overflow-auto", isSplit && "lg:grid-cols-2 lg:grid-rows-1 grid grid-rows-2")}>

                    <div className={cn("h-full min-h-48", isGraph && "hidden")} aria-hidden={isGraph}>
                        <PreviewStage />
                    </div>

                    {!isMechanical && (
                        <div className={cn("h-full min-h-48", isSplit && "lg:border-l lg:border-border")}>
                            <ResponseGraph />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

const mainClasses = "\
flex-1 \
min-h-0 \
\
bg-background border border-border shadow-sm \
rounded-xl \
overflow-hidden \
\
grid \
grid-rows-[auto_minmax(0,1fr)] \
\
lg:grid-cols-[15rem_minmax(0,1fr)] \
lg:grid-rows-[minmax(0,1fr)] \
";

function VisualizerHeader() {
    const definition = useAtomValue(activeDefinitionAtom);

    return (
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

            <PreviewSelectorTab />
        </div>
    );
}

function ControlSidebar() {
    const status = useAtomValue(runStatusAtom);
    const requestRun = useSetAtom(requestRunAtom);

    return (
        <aside className="min-h-0 lg:border-r lg:border-b-0 border-b border-border overflow-hidden flex flex-col">
            <div className="p-2 border-b border-border">
                <EngineTabs />
            </div>

            <Pane_Controls />

            <div className="p-2 bg-muted/20 border-t border-border">
                {status === "running"
                    ? (
                        <StopMotionButton className="w-full" />
                    ) : (
                        <Button className="w-full" size="sm" onClick={requestRun}>
                            <Play data-icon="inline-start" />
                            Play
                        </Button>
                    )
                }
            </div>
        </aside>
    );
}
