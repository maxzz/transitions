import { useSnapshot } from "valtio";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { appSettings, openPage, setShowHeroPage } from "@/store/1-ui-settings";

export function HeroOptOut() {
    const { showHeroPage } = useSnapshot(appSettings.heroPage);

    return (
        <div className="px-6 pb-4 w-full flex items-center justify-center">
            <Label className="text-xs font-normal text-muted-foreground cursor-pointer">
                <Checkbox
                    checked={!showHeroPage}
                    onCheckedChange={
                        (checked) => {
                            const skipNextTime = checked === true;
                            setShowHeroPage(!skipNextTime);
                            if (skipNextTime) {
                                openPage("visualizer");
                            }
                        }
                    }
                />

                Don't show this page again
            </Label>
        </div>
    );
}
