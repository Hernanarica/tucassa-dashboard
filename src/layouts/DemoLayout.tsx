import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { HomeIcon, ImageIcon, TagsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';

const navItems = [
    { to: '/', label: 'Casas', icon: HomeIcon },
    { to: '/banners', label: 'Banners', icon: ImageIcon },
    { to: '/categories', label: 'Categorías', icon: TagsIcon },
] as const;

export function DemoLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const session = useAuthStore((state) => state.session);
    const initialized = useAuthStore((state) => state.initialized);
    const email = useAuthStore((state) => state.user?.email ?? null);
    const [signOutError, setSignOutError] = useState<string | null>(null);

    useEffect(() => {
        if (initialized && !session) {
            void navigate('/signin', { replace: true });
        }
    }, [initialized, session, navigate]);

    async function handleSignOut() {
        setSignOutError(null);
        const { error } = await supabase.auth.signOut();

        if (error) {
            setSignOutError(error.message);
        }
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link to="/">Tu Cassa</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Secciones</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname === item.to}
                                            tooltip={item.label}
                                        >
                                            <Link to={item.to}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <div className="flex flex-col gap-2 px-2 pb-2">
                        {email ? (
                            <p className="truncate text-xs text-sidebar-foreground/70">{email}</p>
                        ) : null}
                        <Button variant="outline" onClick={handleSignOut}>
                            Cerrar sesión
                        </Button>
                        {signOutError ? (
                            <p className="text-xs text-destructive">{signOutError}</p>
                        ) : null}
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-12 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                </header>
                <div className="flex flex-1 flex-col p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
