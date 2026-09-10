import { useSnapshot } from "valtio";
import { Toaster } from '@/ui/shadcn/sonner';
import { AllDialogs } from './1-globals';
import { Header } from '../1-header';
import { HeroPage } from '../2-main/hero-page';
import { MainBody } from '../2-main';
import { Section3_Footer } from '../3-footer';
import { appSettings } from '@/store/1-ui-settings';

export function App() {
    const { currentPage } = useSnapshot(appSettings.heroPage);

    return (<>
        <Toaster />
        <AllDialogs />

        {currentPage === "hero"
            ? (
                <main className="h-dvh text-xs bg-background overflow-hidden">
                    <HeroPage />
                </main>
            )
            : (
                <main className="h-dvh text-xs bg-background overflow-hidden grid grid-rows-[auto_1fr_auto]">
                    <Header />
                    <MainBody />
                    <Section3_Footer />
                </main>
            )
        }
    </>);
}
