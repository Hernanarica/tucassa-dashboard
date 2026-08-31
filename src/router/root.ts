import { createBrowserRouter } from 'react-router'
import { Home } from '@/pages/Home'
import { SignIn } from '@/pages/SignIn'
import { requireAuth, requireGuest } from './guards'

export const routes = [
  {
    loader: requireGuest,
    children: [{ path: 'signin', Component: SignIn }],
  },
  {
    path: '/',
    loader: requireAuth,
    Component: Home,
  },
]

export const router = createBrowserRouter(routes)
