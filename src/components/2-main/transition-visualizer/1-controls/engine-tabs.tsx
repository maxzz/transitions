import { useAtomValue, useSetAtom } from "jotai";
import { Tabs, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";
import { engineIds, engineDefinitions } from "../model/definitions";
import type { EngineId } from "../model/9-types";
import { activeEngineAtom, selectEngineAtom } from "../state/atoms";

export function EngineTabs() {
    const engineId = useAtomValue(activeEngineAtom);
    const selectEngine = useSetAtom(selectEngineAtom);

    return (
        <Tabs
            value={engineId}
            onValueChange={(value) => selectEngine(value as EngineId)}
        >
            <TabsList className="h-9 w-full grid grid-cols-3">
                {engineIds.map((id) => (
                    <TabsTrigger key={id} className="h-full" value={id}>
                        {engineDefinitions[id].label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
