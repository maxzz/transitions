import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/ui/shadcn/button";
import { CircleStop, Play } from "lucide-react";
import { requestRunAtom, runStatusAtom, stopRunAtom } from "../state/atoms";

export function PlayStopButton({ className }: { className?: string }) {
    const status = useAtomValue(runStatusAtom);

    return status === "running"
        ? <StopMotionButton className={className} />
        : <PlayMotionButton className={className} />;
}

export function StopMotionButton({ className }: { className?: string }) {
    const status = useAtomValue(runStatusAtom);
    const stopRun = useSetAtom(stopRunAtom);

    return (
        <Button
            className={className}
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

function PlayMotionButton({ className }: { className?: string }) {
    const requestRun = useSetAtom(requestRunAtom);

    return (
        <Button className={className} size="sm" onClick={requestRun}>
            <Play data-icon="inline-start" />
            Play
        </Button>
    );
}
