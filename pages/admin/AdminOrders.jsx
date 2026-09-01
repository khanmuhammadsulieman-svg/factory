import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Eye, Search, Trash2, AlertTriangle, Box, Clock } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { pkr } from '@/lib/money';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
    new: 'bg-blue-500/15 text-blue-400',
    confirmed: 'bg-accent/15 text-accent',
    packed: 'bg-purple-500/15 text-purple-400',
    shipped: 'bg-cyan-500/15 text-cyan-400',
    delivered: 'bg-green-500/15 text-green-400',
    cancelled: 'bg-destructive/15 text-destructive',
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [selected, setSelected] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        // Initial fetch
        pb.collection('orders')
            .getFullList({ sort: '-created' })
            .then(setOrders)
            .catch(() => {})
            .finally(() => setLoading(false));

        // Real-time subscription so the admin table also stays live
        pb.collection('orders').subscribe('*', (e) => {
            if (e.action === 'create') {
                setOrders((prev) => [e.record, ...prev]);
            } else if (e.action === 'update') {
                setOrders((prev) =>
                    prev.map((o) => (o.id === e.record.id ? e.record : o))
                );
                setSelected((current) =>
                    current?.id === e.record.id ? e.record : current
                );
            } else if (e.action === 'delete') {
                setOrders((prev) => prev.filter((o) => o.id !== e.record.id));
                setSelected((current) =>
                    current?.id === e.record.id ? null : current
                );
            }
        });

        return () => {
            pb.collection('orders').unsubscribe('*');
        };
    }, []);

    const filtered = useMemo(
        () =>
            orders.filter((o) => {
                if (status !== 'all' && o.status !== status) return false;
                if (search) {
                    const q = search.toLowerCase();
                    const emailField = o.customer_email || o.email || o.customerEmail || o.user_email || '';
                    return (
                        o.customer_name?.toLowerCase().includes(q) ||
                        emailField.toLowerCase().includes(q) ||
                        o.phone?.includes(q) ||
                        o.city?.toLowerCase().includes(q) ||
                        o.id.includes(q)
                    );
                }
                return true;
            }),
        [orders, search, status],
    );

    const updateStatus = async (order, next) => {
        try {
            const updatedOrder = await pb.collection('orders').update(order.id, {
                status: next,
            });

            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? updatedOrder : o))
            );
            setSelected((current) =>
                current?.id === order.id ? updatedOrder : current
            );

            toast.success(`Order status updated to ${next.toUpperCase()}`);
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('Could not update status. Please try again.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!orderToDelete) return;
        setDeleting(true);
        try {
            await pb.collection('orders').delete(orderToDelete.id);
            setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
            setDeleteModalOpen(false);
            setOrderToDelete(null);
            toast.success('Order deleted successfully');
        } catch (error) {
            console.error('Failed to delete order:', error);
            toast.error('Could not delete order');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <Helmet>
                <title>Manage Orders | STRYDE Admin</title>
            </Helmet>
            <h1 className="font-display text-2xl font-bold">Orders Ecosystem</h1>
            <p className="mt-1 text-sm text-muted-foreground">{orders.length} total live orders linked with customer portal</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, phone, city or order ID…"
                        className="h-11 bg-secondary pl-9"
                    />
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-11 w-full bg-secondary sm:w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
                <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">Order ID & Time</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Live Status Control</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map((o) => {
                            const orderEmail = o.customer_email || o.email || o.customerEmail || o.user_email || '';
                            const formattedDate = o.created 
                                ? new Date(o.created).toLocaleString('en-PK', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })
                                : 'N/A';

                            return (
                                <tr key={o.id}>
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-xs font-semibold">#{o.id.slice(-8).toUpperCase()}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <Clock className="w-3 h-3 shrink-0" />
                                            <span>{formattedDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{o.customer_name}</p>
                                        <p className="text-xs text-primary font-medium">{orderEmail || 'No email provided'}</p>
                                        <p className="text-xs text-muted-foreground">{o.phone} • {o.city}</p>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-primary">{pkr(o.total)}</td>
                                    <td className="px-4 py-3">
                                        <div className="w-40">
                                            <Select value={o.status || 'new'} onValueChange={(v) => updateStatus(o, v)}>
                                                <SelectTrigger className="h-8 text-xs bg-secondary capitalize"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {STATUSES.map((s) => (
                                                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => setSelected(o)} className="rounded-lg p-2 text-muted-foreground hover:text-primary transition-colors" title="View Order">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setOrderToDelete(o);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No orders match.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Order Modal */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto bg-background sm:max-w-lg">
                    {selected && (() => {
                        let parsedItems = [];
                        try {
                            parsedItems = typeof selected.items === 'string'
                                ? JSON.parse(selected.items)
                                : (selected.items || []);
                        } catch {
                            parsedItems = [];
                        }

                        const selectedEmail = selected.customer_email || selected.email || selected.customerEmail || selected.user_email || '';
                        const modalFormattedDate = selected.created 
                            ? new Date(selected.created).toLocaleString('en-PK', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            : 'N/A';

                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center justify-between">
                                        <span>Order #{selected.id.slice(-8).toUpperCase()}</span>
                                        <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${STATUS_COLORS[selected.status] || STATUS_COLORS.new}`}>
                                            {selected.status || 'new'}
                                        </span>
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 text-sm">
                                    <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/60">
                                            <span>Placed on:</span>
                                            <span className="font-medium text-foreground">{modalFormattedDate}</span>
                                        </div>
                                        <p className="font-semibold text-base pt-1">{selected.customer_name}</p>
                                        <p className="text-primary font-medium">{selectedEmail || 'No email provided'}</p>
                                        <p className="text-muted-foreground">{selected.phone}</p>
                                        <p className="text-muted-foreground">{selected.address}, {selected.city}</p>
                                        {selected.notes && <p className="mt-1 text-xs text-accent">Note: {selected.notes}</p>}
                                        <p className="mt-1 text-xs text-muted-foreground">Payment: {selected.payment_method || 'Cash on Delivery'}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ordered Items</h4>
                                        <div className="divide-y divide-border">
                                            {parsedItems.map((i, idx) => (
                                                <div key={idx} className="py-3 flex items-center justify-between text-sm gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border flex items-center justify-center">
                                                            {i.image ? (
                                                                <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Box className="w-6 h-6 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold block text-foreground">{i.name || i.title || 'Product'}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {i.selectedSize || i.size ? `Size: ${i.selectedSize || i.size}` : ''}{' '}
                                                                {i.selectedColor || i.color ? `• Color: ${i.selectedColor || i.color}` : ''}{' '}
                                                                × {i.qty || i.quantity || 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-primary shrink-0">
                                                        {pkr(i.price * (i.qty || i.quantity || 1))}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-3 font-bold text-base">
                                            <span>Total</span>
                                            <span className="text-primary">{pkr(selected.total)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Update Status</p>
                                        <Select value={selected.status || 'new'} onValueChange={(v) => updateStatus(selected, v)}>
                                            <SelectTrigger className="bg-secondary capitalize"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map((s) => (
                                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5" /> Delete Order #{orderToDelete?.id?.slice(-8).toUpperCase()}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-sm text-muted-foreground space-y-2">
                        <p>Are you sure you want to permanently remove this order from the system?</p>
                        {(() => {
                            const deleteEmail = orderToDelete?.customer_email || orderToDelete?.email || orderToDelete?.customerEmail || orderToDelete?.user_email || '';
                            return (
                                <div className="p-3 rounded-lg bg-secondary/50 border border-border text-foreground space-y-1">
                                    <p className="font-semibold">{orderToDelete?.customer_name}</p>
                                    <p className="text-xs text-primary font-medium">{deleteEmail || 'No email'}</p>
                                    <p className="text-xs text-muted-foreground">{orderToDelete?.phone} • {orderToDelete?.city}</p>
                                    <p className="text-xs font-bold text-primary">{pkr(orderToDelete?.total || 0)}</p>
                                </div>
                            );
                        })()}
                        <p className="text-xs text-red-500 font-medium">This action cannot be undone.</p>
                    </div>
                    <DialogFooter className="flex gap-2 justify-end pt-2">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? 'Deleting…' : 'Yes, Delete Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrders;