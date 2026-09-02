import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AlertTriangle, Banknote, Clock, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { pkr } from '@/lib/money';

const STATUS_COLORS = {
    new: 'bg-blue-500/15 text-blue-400',
    confirmed: 'bg-accent/15 text-accent',
    packed: 'bg-purple-500/15 text-purple-400',
    shipped: 'bg-cyan-500/15 text-cyan-400',
    delivered: 'bg-green-500/15 text-green-400',
    cancelled: 'bg-destructive/15 text-destructive',
};

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    supabase.from('orders').select('*').order('created_at', { ascending: false }),
                    supabase.from('products').select('*'),
                ]);

                if (ordersRes.error) throw ordersRes.error;
                if (productsRes.error) throw productsRes.error;

                setOrders(ordersRes.data || []);
                setProducts(productsRes.data || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const pending = orders.filter((o) => o.status === 'new').length;
    const revenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((s, o) => s + (o.total || 0), 0);
    const lowStock = products.filter((p) => (p.stock || 0) <= 5);

    const cards = [
        { label: 'Total Orders', value: orders.length, icon: ShoppingCart },
        { label: 'Pending Orders', value: pending, icon: Clock },
        { label: 'Revenue', value: pkr(revenue), icon: Banknote },
        { label: 'Low Stock Products', value: lowStock.length, icon: AlertTriangle },
    ];

    return (
        <div>
            <Helmet>
                <title>Admin Dashboard | Factory Outlet Shoes</title>
                <meta name="description" content="Store overview: orders, revenue and stock alerts." />
            </Helmet>
            <h1 className="font-display text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Store overview — catalog currently holds demo inventory.</p>

            <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-2xl border border-border bg-secondary/30 p-5">
                        <c.icon className="h-5 w-5 text-primary" />
                        <p className="font-display mt-3 text-2xl font-bold">{loading ? '…' : c.value}</p>
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-border bg-secondary/30 p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display font-semibold">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-xs font-medium text-primary">View all</Link>
                    </div>
                    <div className="mt-4 space-y-3">
                        {orders.slice(0, 6).map((o) => (
                            <div key={o.id} className="flex items-center justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{o.customer_name}</p>
                                    <p className="text-xs text-muted-foreground">{o.city} • {pkr(o.total)}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[o.status] || ''}`}>
                                    {o.status}
                                </span>
                            </div>
                        ))}
                        {!loading && orders.length === 0 && (
                            <p className="text-sm text-muted-foreground">No orders yet — they will appear here.</p>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-secondary/30 p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display font-semibold">Low Stock Alerts</h2>
                        <Link to="/admin/products" className="text-xs font-medium text-primary">Manage</Link>
                    </div>
                    <div className="mt-4 space-y-3">
                        {lowStock.slice(0, 6).map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-sm">
                                <span className="truncate font-medium">{p.name}</span>
                                <span className={`text-xs font-semibold ${p.stock <= 0 ? 'text-destructive' : 'text-accent'}`}>
                                    {p.stock <= 0 ? 'Out of stock' : `${p.stock} left`}
                                </span>
                            </div>
                        ))}
                        {!loading && lowStock.length === 0 && (
                            <p className="text-sm text-muted-foreground">All products are well stocked.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
