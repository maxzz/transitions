import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import { ControlPanel } from "./controls/control-panel";
import { EngineTabs } from "./controls/engine-tabs";
import { ResponseGraph } from "./graph/response-graph";
import { PreviewStage } from "./preview/preview-stage";
import {
    activeDefinitionAtom,
    backToPreviewAtom,
    requestRunAtom,
    runStatusAtom,
    viewAtom,
} from "./state/atoms";

export function TransitionVisualizer() {
    const definition = useAtomValue(activeDefinitionAtom);
    const status = useAtomValue(runStatusAtom);
    const view = useAtomValue(viewAtom);
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
            </div>

            <div className="min-h-0 bg-background lg:grid-cols-[20rem_minmax(0,1fr)] border border-border rounded-xl shadow-sm overflow-hidden grid flex-1">
                <aside className="min-h-0 lg:border-r lg:border-b-0 border-b border-border flex flex-col">
                    <div className="p-4 border-b border-border">
                        <EngineTabs />
                    </div>
                    <ControlPanel />
                    <div className="mt-auto p-4 bg-muted/20 border-t border-border">
                        {view === "graph" ? (
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={backToPreview}>
                                    <ArrowLeft data-icon="inline-start" />
                                    Back
                                </Button>
                                <Button onClick={requestRun}>
                                    <RotateCcw data-icon="inline-start" />
                                    Replay
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full"
                                disabled={status === "running"}
                                onClick={requestRun}
                            >
                                <Play data-icon="inline-start" />
                                {status === "running" ? "Recording…" : "Run transition"}
                            </Button>
                        )}
                    </div>
                </aside>

                <div className="min-h-0">
                    {view === "preview" ? <PreviewStage /> : <ResponseGraph />}
                </div>
            </div>
        </section>
    );
}
