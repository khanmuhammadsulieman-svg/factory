import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Footprints, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const doLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const NavItems = ({ onClick }) => (
        <div className="flex flex-col gap-1">
            {NAV.map((n) => (
                <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    onClick={onClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`
                    }
                >
                    <n.icon className="h-4 w-4" /> {n.label}
                </NavLink>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
                <span className="font-display flex items-center gap-2 font-bold">
                    <Footprints className="h-5 w-5 text-primary" /> Admin
                </span>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-lg border border-border" aria-label="Menu">
                        <Menu className="h-5 w-5" />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 bg-background">
                        <div className="mt-8">
                            <NavItems onClick={() => setOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="mx-auto flex max-w-[1400px]">
                <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border p-4 lg:flex">
                    <span className="font-display flex items-center gap-2 px-2 py-4 font-bold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Footprints className="h-4 w-4" />
                        </span>
                        Store Admin
                    </span>
                    <div className="mt-4 flex-1">
                        <NavItems />
                    </div>
                    <div className="space-y-1 border-t border-border pt-3">
                        <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-primary">
                            <Store className="h-4 w-4" /> View Store
                        </Link>
                        <button
                            onClick={doLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4" /> Logout ({user?.name || 'Admin'})
                        </button>
                    </div>
                </aside>
                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
