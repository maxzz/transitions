import { useSnapshot } from "valtio";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { appSettings, setShowHeroPage } from "@/store/1-ui-settings";
import { useAppPageNav } from "@/components/0-all/8-page-navigation";

export function HeroOptOut() {
    const { showHeroPage } = useSnapshot(appSettings.heroPage);
    const { navigatePage } = useAppPageNav();

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
                                navigatePage("visualizer");
                            }
                        }
                    }
                />

                Don't show this page again
            </Label>
        </div>
    );
}
