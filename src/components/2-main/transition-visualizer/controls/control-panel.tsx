import { useAtomValue, useSetAtom } from "jotai";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui/shadcn/select";
import type { ParamField } from "../model/types";
import {
    activeDefinitionAtom,
    activeEngineAtom,
    activeParamsAtom,
    applyPresetAtom,
    updateParamAtom,
} from "../state/atoms";

type ControlValues = Record<string, number | string | boolean>;

export function ControlPanel() {
    const engineId = useAtomValue(activeEngineAtom);
    const definition = useAtomValue(activeDefinitionAtom);
    const params = useAtomValue(activeParamsAtom) as unknown as ControlValues;
    const applyPreset = useSetAtom(applyPresetAtom);
    const updateParam = useSetAtom(updateParamAtom);
    const fields = definition.fields as readonly ParamField<ControlValues>[];
    const selectedPreset = definition.presets.find(({ params: presetParams }) =>
        Object.entries(presetParams).every(([key, value]) => params[key] === value),
    )?.id ?? "custom";

    const update = (key: string, value: number | string | boolean) => {
        updateParam({ engineId, key, value });
    };

    return (
        <div className="min-h-0 flex flex-col">
            <div className="p-4 border-b border-border">
                <Label className="mb-2 text-muted-foreground" htmlFor="transition-preset">
                    Preset
                </Label>
                <Select
                    value={selectedPreset}
                    onValueChange={(presetId) => {
                        if (presetId !== "custom") applyPreset({ engineId, presetId });
                    }}
                >
                    <SelectTrigger id="transition-preset" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {selectedPreset === "custom" && (
                            <SelectItem value="custom">Custom</SelectItem>
                        )}
                        {definition.presets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                                {preset.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="p-4 min-h-0 overflow-y-auto flex-1 space-y-5">
                {fields.map((field) => {
                    if (field.visible && !field.visible(params)) return null;
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
                })}
            </div>
        </div>
    );
}

function NumberControl({
    field,
    value,
    onChange,
}: {
    field: Extract<ParamField<ControlValues>, { kind: "number" }>;
    value: number;
    onChange: (value: number) => void;
}) {
    const id = `transition-${field.key}`;
    const sliderMin = field.scale === "log" ? Math.log10(field.min) : field.min;
    const sliderMax = field.scale === "log" ? Math.log10(field.max) : field.max;
    const sliderValue = field.scale === "log" ? Math.log10(Math.max(field.min, value)) : value;
    const sliderStep = field.scale === "log" ? (sliderMax - sliderMin) / 200 : field.step;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={id}>{field.label}</Label>
                <Input
                    id={id}
                    className="h-7 w-24 font-mono tabular-nums"
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    onChange={(event) => {
                        if (Number.isFinite(event.currentTarget.valueAsNumber)) {
                            onChange(event.currentTarget.valueAsNumber);
                        }
                    }}
                />
            </div>
            <input
                className="h-2 w-full bg-muted accent-primary rounded-full appearance-none cursor-pointer"
                type="range"
                aria-label={`${field.label} slider`}
                aria-valuetext={value.toString()}
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={sliderValue}
                onChange={(event) => {
                    const next = Number(event.currentTarget.value);
                    onChange(field.scale === "log" ? Number((10 ** next).toPrecision(6)) : next);
                }}
            />
            {field.description && (
                <p className="text-[11px] leading-relaxed text-muted-foreground">{field.description}</p>
            )}
        </div>
    );
}

function BooleanControl({
    field,
    value,
    onChange,
}: {
    field: Extract<ParamField<ControlValues>, { kind: "boolean" }>;
    value: boolean;
    onChange: (value: boolean) => void;
}) {
    const id = `transition-${field.key}`;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <Checkbox
                    id={id}
                    checked={value}
                    onCheckedChange={(checked) => onChange(checked === true)}
                />
                <Label htmlFor={id}>{field.label}</Label>
            </div>
            {field.description && (
                <p className="pl-6 text-[11px] leading-relaxed text-muted-foreground">{field.description}</p>
            )}
        </div>
    );
}

function SelectControl({
    field,
    value,
    onChange,
}: {
    field: Extract<ParamField<ControlValues>, { kind: "select" }>;
    value: string;
    onChange: (value: string) => void;
}) {
    const id = `transition-${field.key}`;
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{field.label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="w-full">
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
