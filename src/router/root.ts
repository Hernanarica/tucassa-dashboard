import { DemoLayout } from '@/layouts/DemoLayout';
import { Banners } from '@/pages/Banners';
import { Categories } from '@/pages/Categories';
import { Home } from '@/pages/Home';
import { Houses } from '@/pages/Houses';
import { SignIn } from '@/pages/SignIn';
import { createBrowserRouter, redirect } from 'react-router';
import { requireAuth, requireGuest } from './guards';
import { RouteError } from './RouteError';

export const routes = [
    {
        loader: requireGuest,
        ErrorBoundary: RouteError,
        children: [{ path: 'signin', Component: SignIn }],
    },
    {
        path: '/',
        loader: requireAuth,
        Component: DemoLayout,
        ErrorBoundary: RouteError,
        children: [
            { index: true, Component: Home },
            { path: 'banners', Component: Banners },
            { path: 'houses', Component: Houses },
            { path: 'categories', Component: Categories },
        ],
    },
    {
        path: '*',
        loader: () => redirect('/'),
    },
];

export const router = createBrowserRouter(routes);
