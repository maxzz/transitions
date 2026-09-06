import { useAtomValue } from "jotai";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { Slider } from "@/ui/shadcn/slider";
import { formatDuration } from "../model/2-duration";
import { previewMotion, seekPlayback, setPreviewSpeed } from "../state/preview-motion";
import { graphSamplesAtom } from "../3-recorded-graph/a-graph-atoms";
import { PlayMotionButton, StopMotionButton } from "./2-1-play-stop-buttons";

export function VisualizerPlaybackBar() {
    return (
        <div className="[grid-area:d] px-5 py-2.5 bg-background border-t border-border sm:border-l flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <PlayMotionButton />
                <StopMotionButton />
                <ReturnToInitialPosition />
            </div>
            <PlaybackControls />
        </div>
    );
}

function ReturnToInitialPosition() {
    const { returnToInitialPosition } = useSnapshot(appSettings);

    return (
        <Label className="px-2 h-7 flex items-center gap-1" title="Return the preview to its starting position one second after the animation finishes">
            <Checkbox
                checked={returnToInitialPosition}
                onCheckedChange={(checked) => { appSettings.returnToInitialPosition = checked === true; }}
            />
            <div>Return to initial position</div>
        </Label>
    );
}

function PlaybackControls() {
    const samples = useAtomValue(graphSamplesAtom);
    const { elapsedMs, speed } = useSnapshot(previewMotion);
    const durationMs = samples.at(-1)?.elapsedMs ?? 0;
    const hasCurve = samples.length > 0;

    return (
        <div className="min-w-48 flex-1 flex flex-col gap-1.5">
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
    );
}

function PlaybackSlider({ id, label, valueLabel, min, max, step, value, disabled, onChange }: {
    id: string; label: string; valueLabel: string; min: number; max: number; step: number; value: number; disabled?: boolean; onChange: (value: number) => void;
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
