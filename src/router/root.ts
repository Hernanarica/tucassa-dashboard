import { createBrowserRouter, redirect } from 'react-router'
import { Home } from '@/pages/Home'
import { SignIn } from '@/pages/SignIn'
import { requireAuth, requireGuest } from './guards'
import { RouteError } from './RouteError'

export const routes = [
  {
    loader: requireGuest,
    ErrorBoundary: RouteError,
    children: [{ path: 'signin', Component: SignIn }],
  },
  {
    path: '/',
    loader: requireAuth,
    Component: Home,
    ErrorBoundary: RouteError,
  },
  {
    path: '*',
    loader: () => redirect('/'),
  },
]

export const router = createBrowserRouter(routes)
