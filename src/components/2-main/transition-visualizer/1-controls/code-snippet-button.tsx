import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Check, Code, Copy } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/ui/shadcn/popover";
import { formatEngineSnippet } from "../model/4-code-snippet";
import { engineDefinitions } from "../model/1-definitions";
import { activeEngineAtom, activeParamsAtom } from "../state/atoms";

const COPIED_MS = 1000;

export function CodeSnippetButton() {
    const engineId = useAtomValue(activeEngineAtom);
    const params = useAtomValue(activeParamsAtom);
    const snippet = formatEngineSnippet(engineId, params);
    const label = engineDefinitions[engineId].label;
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return undefined;
        const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
        return () => window.clearTimeout(timer);
    }, [copied]);

    useEffect(() => {
        setCopied(false);
    }, [snippet]);

    const copySnippet = async () => {
        const copiedText = await copyText(snippet);
        setCopied(copiedText);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                    <Code data-icon="inline-start" />
                    Code
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80" side="top">
                <PopoverHeader className="flex-row items-center justify-between gap-2">
                    <div>
                        <PopoverTitle>{label} settings</PopoverTitle>
                        <PopoverDescription>Paste this into your application code.</PopoverDescription>
                    </div>
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={copied ? "Copied" : "Copy"}
                        title={copied ? "Copied" : "Copy"}
                        onClick={copySnippet}
                    >
                        {copied
                            ? <Check className="text-green-600 dark:text-green-400" />
                            : <Copy />}
                    </Button>
                </PopoverHeader>
                <pre className="p-2.5 max-h-64 font-mono text-[11px] leading-5 bg-muted rounded-md overflow-auto">
                    {snippet}
                </pre>
            </PopoverContent>
        </Popover>
    );
}

async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const copiedText = document.execCommand("copy");
        textarea.remove();
        return copiedText;
    }
}
