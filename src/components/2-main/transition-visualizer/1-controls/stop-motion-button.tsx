import { useAtomValue, useSetAtom } from "jotai";
import { CircleStop } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import { cn } from "@/utils/classnames";
import { runStatusAtom, stopRunAtom } from "../state/atoms";

export function StopMotionButton({ className }: { className?: string }) {
    const status = useAtomValue(runStatusAtom);
    const stopRun = useSetAtom(stopRunAtom);

    return (
        <Button
            className={cn(className)}
            size="sm"
            variant="outline"
            disabled={status !== "running"}
            onClick={stopRun}
        >
            <CircleStop data-icon="inline-start" />
            Stop motion
        </Button>
    );
}
