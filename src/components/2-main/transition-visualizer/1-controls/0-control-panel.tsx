import { useAtomValue, useSetAtom } from "jotai";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import { Slider } from "@/ui/shadcn/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/shadcn/select";
import { type ParamField } from "../model/9-types";
import { activeDefinitionAtom, activeEngineAtom, activeParamsAtom, applyPresetAtom, updateParamAtom } from "../state/atoms";
import { CodeSnippetButton } from "./button-code-snippet";
import { EngineTabs } from "./1-tabs-engine";
import { PlayStopButton } from "./button-stop-motion";

export function Pane_LeftControls() {
    return (
        <aside className="w-full h-max lg:h-auto lg:min-h-0 lg:min-w-60 border-b border-border lg:border-r lg:border-b-0 overflow-hidden flex flex-col [grid-area:a]">
            <div className="p-2 border-b border-border">
                <EngineTabs />
            </div>

            <div className="flex flex-col lg:flex-1 lg:min-h-0">
                <Control_Preset />
                <Control_Options />

                <div className="shrink-0 p-2">
                    <CodeSnippetButton />
                </div>
            </div>

            <div className="p-2 bg-muted/20 border-t border-border">
                <PlayStopButton className="w-full" />
            </div>
        </aside>
    );
}

type ControlValues = Record<string, number | string | boolean>;

function Control_Options() {
    const engineId = useAtomValue(activeEngineAtom);
    const definition = useAtomValue(activeDefinitionAtom);
    const params = useAtomValue(activeParamsAtom) as unknown as ControlValues;
    const updateParam = useSetAtom(updateParamAtom);
    const fields = definition.fields as readonly ParamField<ControlValues>[];

    const update = (key: string, value: number | string | boolean) => {
        updateParam({ engineId, key, value });
    };

    return (
        <div className="flex-1 p-2 min-h-0 overflow-y-auto grid grid-cols-[auto_minmax(0,1fr)_3.75rem] gap-2 content-start">
            {fields.map(
                (field) => {
                    if (field.visible && !field.visible(params)) {
                        return null;
                    }
                    if (field.kind === "number") {
                        return (
                            <Control_Number
                                key={field.key}
                                field={field}
                                value={params[field.key] as number}
                                onChange={(value) => update(field.key, value)}
                            />
                        );
                    }
                    else if (field.kind === "boolean") {
                        return (
                            <Control_Boolean
                                key={field.key}
                                field={field}
                                value={params[field.key] as boolean}
                                onChange={(value) => update(field.key, value)}
                            />
                        );
                    } else {
                        return (
                            <Control_Select
                                key={field.key}
                                field={field}
                                value={params[field.key] as string}
                                onChange={(value) => update(field.key, value)}
                            />
                        );
                    }
                }
            )}
        </div>
    );
}

const controlRowClasses = "col-span-3 grid grid-cols-subgrid items-center";

function Control_Number({ field, value, onChange }: { field: Extract<ParamField<ControlValues>, { kind: "number"; }>; value: number; onChange: (value: number) => void; }) {
    const id = `transition-${field.key}`;
    const sliderMin = field.scale === "log" ? Math.log10(field.min) : field.min;
    const sliderMax = field.scale === "log" ? Math.log10(field.max) : field.max;
    const sliderValue = field.scale === "log" ? Math.log10(Math.max(field.min, value)) : value;
    const sliderStep = field.scale === "log" ? (sliderMax - sliderMin) / 200 : field.step;

    return (
        <div className={controlRowClasses} title={field.description}>
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
                className="p-1 h-7 w-full text-[12px] font-mono tabular-nums scale-85 origin-right"
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={value}
                onChange={(event) => { if (Number.isFinite(event.currentTarget.valueAsNumber)) { onChange(event.currentTarget.valueAsNumber); } }}
                id={id}
            />
        </div>
    );
}

function Control_Boolean({ field, value, onChange }: { field: Extract<ParamField<ControlValues>, { kind: "boolean"; }>; value: boolean; onChange: (value: boolean) => void; }) {
    return (
        <div className={controlRowClasses} title={field.description}>
            <Label className="h-6 truncate col-span-3 flex items-center gap-2">
                <Checkbox checked={value} onCheckedChange={(checked) => onChange(checked === true)} />
                <span className="truncate">{field.label}</span>
            </Label>
        </div>
    );
}

function Control_Select({ field, value, onChange }: { field: Extract<ParamField<ControlValues>, { kind: "select"; }>; value: string; onChange: (value: string) => void; }) {
    const id = `transition-${field.key}`;
    return (
        <div className={controlRowClasses} title={field.description}>
            <Label className="truncate" htmlFor={id}>
                {field.label}
            </Label>

            <div className="min-w-0 col-span-2">
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
        </div>
    );
}

function Control_Preset() {
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
