import { useAtomValue, useSetAtom } from "jotai";
import { Tabs } from "@/ui/shadcn/tabs";
import { TabsListAnimated, TabsTriggerAnimated } from "@/ui/local-ui/5-tabs-animated";
import { engineIds, engineDefinitions } from "../model/1-definitions";
import { type EngineId } from "../model/9-types";
import { activeEngineAtom, selectEngineAtom } from "../state/atoms";

export function EngineTabs() {
    const engineId = useAtomValue(activeEngineAtom);
    const selectEngine = useSetAtom(selectEngineAtom);

    return (
        <Tabs value={engineId} onValueChange={(value) => selectEngine(value as EngineId)}>
            <TabsListAnimated className="h-9 flex items-center" layoutId="engine-tabs">
                {engineIds.map(
                    (id) => (
                        <TabsTriggerAnimated className="h-full" value={id} valueAtom={activeEngineAtom} key={id}>
                            {engineDefinitions[id].label}
                        </TabsTriggerAnimated>
                    )
                )}
            </TabsListAnimated>
        </Tabs>
    );
}
