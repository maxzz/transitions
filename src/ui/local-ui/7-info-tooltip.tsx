import { type ReactNode } from "react";
import { Info } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/shadcn/tooltip";

export function PanelInfoTooltip({ label, children }: { label: string; children: ReactNode; }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size="icon-sm" variant="ghost" aria-label={label}>
                        <Info />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="flex-col items-start gap-0.5">
                    {children}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
