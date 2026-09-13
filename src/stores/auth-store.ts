import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthState = {
    session: Session | null;
    user: User | null;
    initialized: boolean;
    setSession: (session: Session | null) => void;
};

let didInitAuth = false;

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    initialized: false,
    setSession: (session) =>
        set({
            session,
            user: session?.user ?? null,
            initialized: true,
        }),
}));

// Registra onAuthStateChange una sola vez. Cubre login, logout, refresh de token y de página.
export function initAuth() {
    if (didInitAuth) {
        return;
    }

    didInitAuth = true;

    supabase.auth.onAuthStateChange((_event, session) => {
        useAuthStore.getState().setSession(session);
    });
}
