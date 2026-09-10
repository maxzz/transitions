import { useSnapshot } from "valtio";
import { Button } from "@/ui/shadcn/button";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { HERO_CONTINUE_LABEL, HERO_OPT_OUT_LABEL } from "../model/1-copy";
import { appSettings, openPage, setShowHeroPage } from "@/store/1-ui-settings";

export function HeroOptOut() {
    const { showHeroPage } = useSnapshot(appSettings.heroPage);

    return (
        <div className="px-6 pb-8 w-full flex flex-col items-center justify-center gap-4">
            <Label className="text-xs font-normal text-muted-foreground cursor-pointer">
                <Checkbox
                    checked={!showHeroPage}
                    onCheckedChange={(checked) => {
                        const skipNextTime = checked === true;
                        setShowHeroPage(!skipNextTime);
                        if (skipNextTime) {
                            openPage("visualizer");
                        }
                    }}
                />
                {HERO_OPT_OUT_LABEL}
            </Label>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPage("visualizer")}
            >
                {HERO_CONTINUE_LABEL}
            </Button>
        </div>
    );
}
