import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/0-all/0-app.tsx';
import '@/assets/styles/index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
