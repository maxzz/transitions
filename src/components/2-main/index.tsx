import { TransitionVisualizer } from "./transition-visualizer";

export function MainBody() {
    return (
        <main className="px-3 py-4 min-h-0 sm:px-5 sm:py-6 flex flex-col gap-4">
            <TransitionVisualizer />
        </main>
    );
}
