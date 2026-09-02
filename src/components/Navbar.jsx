import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, User, LogOut, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LINKS = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/shop?sale=true', label: 'Sale' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/faq', label: 'FAQ' },
];

const Navbar = () => {
    const { count } = useCart();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    // Auth Modal State ('login', 'signup', or null)
    const [authModal, setAuthModal] = useState(null);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    
    // Visibility Toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Supabase Session State
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const isLoggedIn = !!user;
    const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            setAuthModal(null);
            window.location.reload();
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    }
                }
            });

            if (signUpError) throw signUpError;

            setAuthModal(null);
            window.location.reload();
        } catch (err) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.header
                className="sticky top-0 z-50 w-full bg-background shadow-sm"
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* RUNNING BANNER */}
                <div className="bg-primary text-primary-foreground overflow-hidden py-1.5 text-xs font-medium">
                    <div className="animate-marquee flex w-max whitespace-nowrap">
                        {[0, 1, 2, 3].map((n) => (
                            <span key={n} className="px-8">
                                🚀 Exclusive Factory Deals • Starting from PKR 999 • 🔄 Easy 7-Day Returns •
                            </span>
                        ))}
                    </div>
                </div>

                <nav className="border-b border-border bg-background/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                        <Link to="/" className="flex items-center shrink-0">
                            <img
                                src="https://i.postimg.cc/L4gfnhzc/1000306177.jpg"
                                alt="Factory Outlet"
                                className="h-8 sm:h-10 w-auto object-contain"
                            />
                        </Link>

                        <div className="hidden items-center gap-6 md:flex">
                            {LINKS.map((l) => (
                                <NavLink
                                    key={l.label}
                                    to={l.to}
                                    className={({ isActive }) =>
                                        `text-sm font-medium transition-colors hover:text-primary ${isActive && l.to === '/' ? 'text-primary' : 'text-muted-foreground'}`
                                    }
                                >
                                    {l.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* WhatsApp Support */}
                            <a
                                href="https://wa.me/923351307444"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-all hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600"
                                aria-label="WhatsApp Support"
                                title="Chat on WhatsApp"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                            </a>

                            {/* User Profile / Auth Trigger */}
                            <div className="relative flex flex-col items-center">
                                <button
                                    onClick={() => {
                                        if (isLoggedIn) {
                                            navigate('/my-orders');
                                        } else {
                                            setAuthModal('login');
                                            setError('');
                                        }
                                    }}
                                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:border-primary hover:text-primary text-foreground cursor-pointer"
                                    aria-label="Account"
                                >
                                    <User className="h-4 w-4" />
                                </button>

                                {isLoggedIn && (
                                    <div className="absolute top-full mt-2 whitespace-nowrap rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white shadow-md z-50 pointer-events-none">
                                        Hi, {displayName}
                                    </div>
                                )}
                            </div>

                            {isLoggedIn && (
                                <button
                                    onClick={handleLogout}
                                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:border-red-500 hover:text-red-600 text-muted-foreground"
                                    aria-label="Log Out"
                                    title="Log Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}

                            {/* Cart Icon */}
                            <Link
                                to="/cart"
                                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:border-primary"
                                aria-label="Cart"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                {count > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                        {count}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Menu */}
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-xl border border-border md:hidden" aria-label="Menu">
                                    <Menu className="h-4 w-4" />
                                </SheetTrigger>
                                <SheetContent side="right" className="w-72 bg-background">
                                    <div className="mt-8 flex flex-col gap-1">
                                        {LINKS.map((l) => (
                                            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-base font-medium hover:bg-secondary hover:text-primary">
                                                {l.label}
                                            </Link>
                                        ))}
                                        <div className="my-2 h-px bg-border" />

                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                if (isLoggedIn) {
                                                    navigate('/my-orders');
                                                } else {
                                                    setAuthModal('login');
                                                    setError('');
                                                }
                                            }}
                                            className="rounded-lg px-4 py-3 text-base font-medium flex items-center gap-2 text-primary hover:bg-secondary text-left w-full"
                                        >
                                            <User className="h-5 w-5" />
                                            {isLoggedIn ? `Hi, ${displayName}` : "Log In / Register"}
                                        </button>

                                        {isLoggedIn && (
                                            <button
                                                onClick={() => { setOpen(false); handleLogout(); }}
                                                className="rounded-lg px-4 py-3 text-base font-medium flex items-center gap-2 text-red-500 hover:bg-red-50 text-left"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Log Out
                                            </button>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </nav>
            </motion.header>

            {/* INTEGRATED LOGIN / SIGNUP MODAL OVERLAY */}
            <AnimatePresence>
                {authModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <button
                                onClick={() => { setAuthModal(null); setError(''); }}
                                className="absolute right-4 top-4 p-2 rounded-full text-muted-foreground hover:bg-secondary"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* LOGIN FORM */}
                            {authModal === 'login' && (
                                <>
                                    <div className="text-center mb-6">
                                        <h2 className="font-display text-2xl font-bold tracking-tight">Welcome Back</h2>
                                        <p className="text-xs text-muted-foreground mt-1">Log in to manage your orders and profile</p>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold text-center">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-semibold">Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="customer@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="mt-1.5 h-11 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold">Password</Label>
                                            <div className="relative mt-1.5">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold mt-2">
                                            {loading ? 'Logging in...' : 'Log In'}
                                        </Button>
                                    </form>

                                    <div className="text-center mt-6 text-xs text-muted-foreground">
                                        Don't have an account?{' '}
                                        <button
                                            onClick={() => { setAuthModal('signup'); setError(''); }}
                                            className="font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
                                        >
                                            Sign up
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* SIGNUP FORM */}
                            {authModal === 'signup' && (
                                <>
                                    <div className="text-center mb-6">
                                        <h2 className="font-display text-2xl font-bold tracking-tight">Create an Account</h2>
                                        <p className="text-xs text-muted-foreground mt-1">Sign up to track orders and checkout faster</p>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold text-center">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-semibold">Full Name</Label>
                                            <Input
                                                type="text"
                                                placeholder="Ali Khan"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="mt-1.5 h-11 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold">Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="customer@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="mt-1.5 h-11 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold">Password</Label>
                                            <div className="relative mt-1.5">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                Must be at least 8 characters long.
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold">Confirm Password</Label>
                                            <div className="relative mt-1.5">
                                                <Input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={passwordConfirm}
                                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold mt-2">
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </Button>
                                    </form>

                                    <div className="text-center mt-6 text-xs text-muted-foreground">
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => { setAuthModal('login'); setError(''); }}
                                            className="font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
                                        >
                                            Log in
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
