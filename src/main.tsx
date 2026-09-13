import { TooltipProvider } from '@/components/ui/tooltip';
import { initAuth } from '@/stores/auth-store';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './router/root';

initAuth();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TooltipProvider>
            <RouterProvider router={router} />
        </TooltipProvider>
    </StrictMode>
);
