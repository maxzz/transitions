import { Toaster } from '@/ui/shadcn/sonner';
import { AllDialogs } from './1-globals';
import { Header } from '../1-header';
import { HeroPage } from '../2-main/hero-page';
import { MainBody } from '../2-main';
import { AppPageNavProvider, AppPageViewTransition, useAppPageNav } from './8-page-navigation';

export function App() {
    return (
        <AppPageNavProvider>
            <Toaster />
            <AllDialogs />
            <AppPages />
        </AppPageNavProvider>
    );
}

function AppPages() {
    const { currentPage } = useAppPageNav();

    return (
        <AppPageViewTransition>
            {currentPage === "hero"
                ? (
                    <main className="h-dvh text-xs bg-background overflow-hidden">
                        <HeroPage />
                    </main>
                )
                : (
                    <main className="h-dvh text-xs bg-background overflow-hidden grid grid-rows-[auto_1fr]">
                        <Header />
                        <MainBody />
                    </main>
                )
            }
        </AppPageViewTransition>
    );
}
