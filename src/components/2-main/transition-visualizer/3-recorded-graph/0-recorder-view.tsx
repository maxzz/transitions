import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { Label } from "@/ui/shadcn/label";
import { Slider } from "@/ui/shadcn/slider";
import { formatDuration } from "../model/2-duration";
import { activeDefinitionAtom } from "../state/atoms";
import { previewMotion, seekPlayback, setPreviewSpeed } from "../state/preview-motion";
import { graphSamplesAtom, isRecordingAtom } from "./a-graph-atoms";
import { RecordedSvg } from "./1-recorded-svg";
import { GraphOptionsPopover, RecordingIndicator } from "./2-graph-options-popover";

export function ResponseGraph() {
    return (
        <div className="relative h-full min-h-0 bg-muted/20 flex flex-col">
            <GraphHeader />
            <RecordedSvg />
            <PlaybackControls />
        </div>
    );
}

function GraphHeader() {
    const definition = useAtomValue(activeDefinitionAtom);
    const recording = useAtomValue(isRecordingAtom);

    return (
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
            <div>
                <h2 className="text-sm font-semibold">Recorded response</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {definition.label} · solver samples
                </p>
            </div>
            <div className="relative flex items-center">
                <RecordingIndicator recording={recording} />
                <GraphOptionsPopover />
            </div>
        </div>
    );
}

function PlaybackControls() {
    const samples = useAtomValue(graphSamplesAtom);
    const { elapsedMs, speed } = useSnapshot(previewMotion);
    const durationMs = samples.at(-1)?.elapsedMs ?? 0;
    const hasCurve = samples.length > 0;

    return (
        <div className="px-5 py-2.5 bg-background border-t border-border flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
                <PlaybackSlider
                    id="graph-timeline"
                    label="Timeline"
                    valueLabel={formatDuration(elapsedMs)}
                    min={0}
                    max={Math.max(durationMs, 1)}
                    step={1}
                    value={Math.min(elapsedMs, durationMs)}
                    disabled={!hasCurve}
                    onChange={(next) => seekPlayback(samples, next)}
                />
                <PlaybackSlider
                    id="graph-speed"
                    label="Speed"
                    valueLabel={speed.toFixed(2)}
                    min={0}
                    max={1}
                    step={0.01}
                    value={speed}
                    onChange={setPreviewSpeed}
                />
            </div>
        </div>
    );
}

function PlaybackSlider({
    id,
    label,
    valueLabel,
    min,
    max,
    step,
    value,
    disabled,
    onChange,
}: {
    id: string;
    label: string;
    valueLabel: string;
    min: number;
    max: number;
    step: number;
    value: number;
    disabled?: boolean;
    onChange: (value: number) => void;
}) {
    return (
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.75rem] items-center gap-2">
            <Label className="font-mono text-[10px] text-muted-foreground truncate uppercase tracking-wider" htmlFor={id}>
                {label}
            </Label>
            <Slider
                id={id}
                aria-label={label}
                aria-valuetext={valueLabel}
                min={min}
                max={max}
                step={step}
                value={[value]}
                disabled={disabled}
                onValueChange={([next]) => {
                    if (next === undefined) return;
                    onChange(next);
                }}
            />
            <span className="font-mono tabular-nums text-[11px] text-foreground text-right truncate">
                {valueLabel}
            </span>
        </div>
    );
}
