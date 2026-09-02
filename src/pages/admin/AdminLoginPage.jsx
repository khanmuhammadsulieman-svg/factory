import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Footprints, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotMode, setIsForgotMode] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isForgotMode) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/admin/login',
                });
                if (resetError) throw resetError;
                setMessage('Password recovery instructions sent to your email.');
            } else {
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError || !authData.user) {
                    throw new Error('Invalid email or password.');
                }

                navigate('/admin');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
            <Helmet>
                <title>{isForgotMode ? 'Reset Password' : 'Admin Login'} | Factory Outlet Shoes</title>
                <meta name="description" content="Store admin login for Factory Outlet Shoes." />
            </Helmet>
            <div className="w-full max-w-sm rounded-3xl border border-border bg-secondary/30 p-8">
                <div className="flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        {isForgotMode ? <KeyRound className="h-6 w-6" /> : <Footprints className="h-6 w-6" />}
                    </span>
                    <h1 className="font-display mt-4 text-xl font-bold">
                        {isForgotMode ? 'Reset Password' : 'Store Admin'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isForgotMode 
                            ? 'Enter your email to receive a recovery link' 
                            : 'Sign in to manage factoryoutletshoes.store'}
                    </p>
                </div>
                
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 bg-background"
                        />
                    </div>
                    
                    {!isForgotMode && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <button
                                    type="button"
                                    onClick={() => { setIsForgotMode(true); setError(''); setMessage(''); }}
                                    className="text-xs text-muted-foreground hover:text-primary cursor-pointer bg-transparent border-none"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 bg-background"
                            />
                        </div>
                    )}

                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {message && <p className="text-sm text-emerald-500">{message}</p>}

                    <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl font-semibold">
                        {!isForgotMode && <Lock className="mr-2 h-4 w-4" />}
                        {loading ? 'Please wait…' : (isForgotMode ? 'Send Reset Link' : 'Sign In')}
                    </Button>
                </form>

                {isForgotMode ? (
                    <button
                        type="button"
                        onClick={() => { setIsForgotMode(false); setError(''); setMessage(''); }}
                        className="mt-5 flex w-full items-center justify-center text-center text-xs text-muted-foreground hover:text-primary cursor-pointer bg-transparent border-none"
                    >
                        <ArrowLeft className="mr-1 h-3 w-3" /> Back to login
                    </button>
                ) : (
                    <Link to="/" className="mt-5 block text-center text-xs text-muted-foreground hover:text-primary">
                        ← Back to store
                    </Link>
                )}
            </div>
        </div>
    );
};

export default AdminLoginPage;
