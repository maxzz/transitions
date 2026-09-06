import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/ui/shadcn/button";
import { Pause, Play, SquareStop } from "lucide-react";
import { requestRunAtom, runStatusAtom, stopRunAtom } from "../state/atoms";
import { classNames } from "@/utils/classnames";
import { IconPlayStop } from "@/ui/icons";

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
    const running = status === "running";
    return (
        <Button
            className={classNames(className, running ? "hover:bg-destructive/10" : "opacity-50")}
            size="icon-sm"
            variant="outline"
            onClick={() => running && stopRun()}
            title="Stop motion (if running)"
        >
            <IconPlayStop className={classNames("size-4", running ?  "stroke-destructive! fill-destructive/60!" : "opacity-50")} />
        </Button>
    );
}
