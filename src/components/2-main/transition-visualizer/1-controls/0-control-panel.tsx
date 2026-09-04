import { useAtomValue, useSetAtom } from "jotai";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import { Slider } from "@/ui/shadcn/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui/shadcn/select";
import type { ParamField } from "../model/9-types";
import {
    activeDefinitionAtom,
    activeEngineAtom,
    activeParamsAtom,
    applyPresetAtom,
    updateParamAtom,
} from "../state/atoms";
import { CodeSnippetButton } from "./button-code-snippet";

type ControlValues = Record<string, number | string | boolean>;

export function Pane_Controls() {
    const engineId = useAtomValue(activeEngineAtom);
    const definition = useAtomValue(activeDefinitionAtom);
    const params = useAtomValue(activeParamsAtom) as unknown as ControlValues;
    const updateParam = useSetAtom(updateParamAtom);
    const fields = definition.fields as readonly ParamField<ControlValues>[];

    const update = (key: string, value: number | string | boolean) => {
        updateParam({ engineId, key, value });
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <PresetControl />

            <div className="flex-1 p-2 min-h-0 overflow-y-auto space-y-3">
                {fields.map(
                    (field) => {
                        if (field.visible && !field.visible(params)) {
                            return null;
                        }
                        if (field.kind === "number") {
                            return (
                                <NumberControl
                                    key={field.key}
                                    field={field}
                                    value={params[field.key] as number}
                                    onChange={(value) => update(field.key, value)}
                                />
                            );
                        }
                        if (field.kind === "boolean") {
                            return (
                                <BooleanControl
                                    key={field.key}
                                    field={field}
                                    value={params[field.key] as boolean}
                                    onChange={(value) => update(field.key, value)}
                                />
                            );
                        }
                        return (
                            <SelectControl
                                key={field.key}
                                field={field}
                                value={params[field.key] as string}
                                onChange={(value) => update(field.key, value)}
                            />
                        );
                    }
                )}
            </div>

            <div className="shrink-0 p-2">
                <CodeSnippetButton />
            </div>
        </div>
    );
}

function NumberControl({ field, value, onChange }: { field: Extract<ParamField<ControlValues>, { kind: "number"; }>; value: number; onChange: (value: number) => void; }) {
    const id = `transition-${field.key}`;
    const sliderMin = field.scale === "log" ? Math.log10(field.min) : field.min;
    const sliderMax = field.scale === "log" ? Math.log10(field.max) : field.max;
    const sliderValue = field.scale === "log" ? Math.log10(Math.max(field.min, value)) : value;
    const sliderStep = field.scale === "log" ? (sliderMax - sliderMin) / 200 : field.step;

    return (
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.75rem] items-center gap-2" title={field.description}>
            <Label className="truncate" htmlFor={id}>
                {field.label}
            </Label>

            <Slider
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={[sliderValue]}
                onValueChange={([next]) => { if (next !== undefined) { onChange(field.scale === "log" ? Number((10 ** next).toPrecision(6)) : next); } }}
                aria-label={`${field.label} slider`}
                aria-valuetext={value.toString()}
            />

            <Input
                id={id}
                className="px-1 h-6 w-full font-mono tabular-nums text-[11px]"
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={value}
                onChange={(event) => { if (Number.isFinite(event.currentTarget.valueAsNumber)) { onChange(event.currentTarget.valueAsNumber); } }}
            />
        </div>
    );
}

function BooleanControl({ field, value, onChange }: { field: Extract<ParamField<ControlValues>, { kind: "boolean"; }>; value: boolean; onChange: (value: boolean) => void; }) {
    return (
        <Label className="h-6 flex items-center gap-2 truncate" title={field.description}>
            <Checkbox checked={value} onCheckedChange={(checked) => onChange(checked === true)} />
            <span className="truncate">{field.label}</span>
        </Label>
    );
}

function SelectControl({ field, value, onChange }: { field: Extract<ParamField<ControlValues>, { kind: "select"; }>; value: string; onChange: (value: string) => void; }) {
    const id = `transition-${field.key}`;
    return (
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2" title={field.description}>
            <Label className="truncate" htmlFor={id}>
                {field.label}
            </Label>
            
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="h-7 min-w-0 w-full">
                    <SelectValue />
                </SelectTrigger>

                <SelectContent>
                    {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function PresetControl() {
    const engineId = useAtomValue(activeEngineAtom);
    const definition = useAtomValue(activeDefinitionAtom);
    const params = useAtomValue(activeParamsAtom) as unknown as ControlValues;
    const applyPreset = useSetAtom(applyPresetAtom);
    const selectedPreset = definition.presets.find(({ params: presetParams }) => Object.entries(presetParams).every(([key, value]) => params[key] === value))?.id ?? "custom";

    return (
        <div className="p-2 border-b border-border flex items-center gap-2">
            <Label className="shrink-0 w-14 text-muted-foreground" htmlFor="transition-preset">
                Preset
            </Label>

            <Select value={selectedPreset} onValueChange={(presetId) => { if (presetId !== "custom") applyPreset({ engineId, presetId }); }}>
                <SelectTrigger className="flex-1 h-7 min-w-0" id="transition-preset">
                    <SelectValue />
                </SelectTrigger>

                <SelectContent>
                    {selectedPreset === "custom" && (
                        <SelectItem value="custom">Custom</SelectItem>
                    )}

                    {definition.presets.map(
                        (preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                                {preset.label}
                            </SelectItem>
                        )
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
