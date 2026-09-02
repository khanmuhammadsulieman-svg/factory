import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data?.session) {
                // Force state persistence and redirect to admin dashboard
                navigate('/admin', { replace: true });
            }
        } catch (err) {
            setErrorMsg(err.message || 'Invalid login credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Helmet>
                <title>Admin Login | Factory Outlet Shoes</title>
            </Helmet>
            <div className="w-full max-w-md rounded-2xl border border-border bg-secondary/30 p-8 shadow-lg">
                <h2 className="font-display text-2xl font-bold">Store Admin</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to manage factoryoutletshoes.store</p>

                {errorMsg && (
                    <div className="mt-4 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
