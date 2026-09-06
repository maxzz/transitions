import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { cn } from "@/utils/classnames";
import { Pane_LeftControls } from "../1-controls/0-control-panel";
import { PreviewSelectorTab } from "./1-2-tabs-preview-selector";
import { VisualizerPlaybackBar } from "./2-0-playback-bar";
import { ResponseGraph } from "../3-recorded-graph/0-recorder-view";
import { PreviewStage } from "../2-preview/0-preview-stage";
import { activeDefinitionAtom } from "../state/atoms";

export function TransitionVisualizer() {
    const { visualizerDisplay } = useSnapshot(appSettings);
    const isSplit = visualizerDisplay === "split";
    const isGraph = visualizerDisplay === "graph";
    const isMechanical = visualizerDisplay === "mechanical";

    return (
        <section className="flex-1 mx-auto min-h-0 w-full max-w-360 flex flex-col gap-4">
            {/* <VisualizerHeader /> */}

            <div className={cn(shellClasses, isSplit ? splitGridClasses : pairGridClasses, !isSplit && (isGraph ? graphAreas : mechanicalAreas))}>
                <Pane_LeftControls />

                <div className={cn("[grid-area:b] min-w-0 min-h-48 overflow-auto", isGraph && "hidden", !isGraph && "border-t border-border sm:border-t-0", isMechanical && "sm:border-l")} aria-hidden={isGraph}>
                    <PreviewStage />
                </div>

                {!isMechanical && (
                    <div className={cn("[grid-area:c] min-w-0 min-h-48 overflow-auto border-t border-l border-border sm:border-t-0")}>
                        <ResponseGraph />
                    </div>
                )}

                <VisualizerPlaybackBar />
            </div>
        </section>
    );
}

const shellClasses = "\
flex-1 \
min-h-0 \
\
bg-background border border-border shadow-sm \
rounded-sm \
overflow-auto sm:overflow-hidden \
\
grid \
";

const splitGridClasses = "\
grid-cols-2 \
grid-rows-[auto_minmax(12rem,1fr)_auto] \
[grid-template-areas:'a_a'_'b_c'_'d_d'] \
\
sm:grid-cols-[max-content_minmax(0,1fr)_minmax(0,1fr)] \
sm:grid-rows-[minmax(0,1fr)_auto] \
sm:[grid-template-areas:'a_b_c'_'a_d_d'] \
";

const pairGridClasses = "\
grid-cols-1 \
grid-rows-[auto_minmax(0,1fr)_auto] \
\
sm:grid-cols-[max-content_minmax(0,1fr)] \
sm:grid-rows-[minmax(0,1fr)_auto] \
";

const graphAreas = "\
[grid-template-areas:'a'_'c'_'d'] \
sm:[grid-template-areas:'a_c'_'a_d'] \
";

const mechanicalAreas = "\
[grid-template-areas:'a'_'b'_'d'] \
sm:[grid-template-areas:'a_b'_'a_d'] \
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
