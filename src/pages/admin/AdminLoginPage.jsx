import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Footprints, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simple hardcoded check that works instantly offline
        if (email.trim().toLowerCase() === 'admin@factoryoutletshoes.store' && password === 'YourSecurePasswordHere') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            navigate('/admin', { replace: true });
        } else {
            setError('Invalid email or password.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
            <Helmet>
                <title>Admin Login | Factory Outlet Shoes</title>
            </Helmet>
            <div className="w-full max-w-sm rounded-3xl border border-border bg-secondary/30 p-8">
                <div className="flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Footprints className="h-6 w-6" />
                    </span>
                    <h1 className="font-display mt-4 text-xl font-bold">Store Admin</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Sign in to manage factoryoutletshoes.store</p>
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
                    
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 bg-background"
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl font-semibold">
                        <Lock className="mr-2 h-4 w-4" />
                        {loading ? 'Please wait…' : 'Sign In'}
                    </Button>
                </form>

                <Link to="/" className="mt-5 block text-center text-xs text-muted-foreground hover:text-primary">
                    ← Back to store
                </Link>
            </div>
        </div>
    );
};

export default AdminLoginPage;
