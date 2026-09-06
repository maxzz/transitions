import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/ui/shadcn/button";
import { Pause, Play } from "lucide-react";
import { requestRunAtom, runStatusAtom, stopRunAtom } from "../state/atoms";
import { classNames } from "@/utils/classnames";

export function PlayStopButton({ className }: { className?: string }) {
    const status = useAtomValue(runStatusAtom);

    return status === "running"
        ? <StopMotionButton className={className} />
        : <PlayMotionButton className={className} />;
}

export function PlayMotionButton({ className }: { className?: string }) {
    const requestRun = useSetAtom(requestRunAtom);

    return (
        <Button className={className} size="sm" onClick={requestRun}>
            <Play data-icon="inline-start" />
            Play
        </Button>
    );
}

export function StopMotionButton({ className }: { className?: string }) {
    const status = useAtomValue(runStatusAtom);
    const stopRun = useSetAtom(stopRunAtom);

    return (
        <Button
            className={className}
            size="icon-sm"
            variant="outline"
            disabled={status !== "running"}
            onClick={stopRun}
            title="Stop motion"
        >
            <Pause className={classNames("size-4", status !== "running" ? "opacity-50" : "fill-foreground")} />
        </Button>
    );
}
