import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { pkr } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EMPTY = {
    name: '', category: 'men', type: 'sneakers', price: '', sale_price: '',
    sizes: '', colors: '', images: '', description: '', stock: '0', active: true, bestseller: false,
    sizePrices: {},
};

const toForm = (p) => ({
    name: p.name || '', category: p.category || 'men', type: p.type || 'sneakers',
    price: String(p.price ?? ''), sale_price: p.sale_price ? String(p.sale_price) : '',
    sizes: (p.sizes || []).join(', '), colors: (p.colors || []).join(', '),
    images: (p.images || []).join('\n'), description: p.description || '',
    stock: String(p.stock ?? 0), active: !!p.active, bestseller: !!p.bestseller,
    sizePrices: p.sizePrices || {},
});

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const load = () => {
        pb.collection('products')
            .getFullList({ sort: '-created' })
            .then(setProducts)
            .catch(() => { })
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY);
        setOpen(true);
    };
    const openEdit = (p) => {
        setEditing(p);
        setForm(toForm(p));
        setOpen(true);
    };

    const parsedSizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);

    // UPDATED: Advanced File Upload with Automatic Optimization & Size Compression
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000; // Resize large images
                const MAX_HEIGHT = 1000;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert any format to highly compressed webp (fixes size limits)
                const compressedBase64 = canvas.toDataURL('image/webp', 0.8);
                set('images', compressedBase64);
                toast.success('Image processed and optimized successfully!');
            };
            
            img.onerror = () => {
                toast.error('Invalid image file format.');
            };
        };
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        const imageArray = form.images.trim() ? [form.images.trim()] : [];
        const data = {
            name: form.name.trim(),
            slug: form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            category: form.category,
            type: form.type,
            price: Number(form.price) || 0,
            sale_price: Number(form.sale_price) || 0,
            sizes: parsedSizes,
            colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
            images: imageArray,
            description: form.description.trim(),
            stock: parseInt(form.stock, 10) || 0,
            active: form.active,
            bestseller: form.bestseller,
            sizePrices: form.sizePrices,
        };
        try {
            if (editing) {
                await pb.collection('products').update(editing.id, data);
                toast.success('Product updated');
            } else {
                await pb.collection('products').create(data);
                toast.success('Product created');
            }
            setOpen(false);
            load();
        } catch {
            toast.error('Save failed — check the fields and try again');
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (p) => {
        try {
            await pb.collection('products').update(p.id, { active: !p.active });
            setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
        } catch {
            toast.error('Could not update product');
        }
    };

    const doDelete = async () => {
        try {
            await pb.collection('products').delete(deleting.id);
            toast.success('Product deleted');
            setProducts((prev) => prev.filter((x) => x.id !== deleting.id));
        } catch {
            toast.error('Delete failed');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div>
            <Helmet>
                <title>Manage Products | Factory Outlet Shoes Admin</title>
                <meta name="description" content="Create, edit and manage store products, pricing, sizes, colors and inventory." />
            </Helmet>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold">Products</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{products.length} products</p>
                </div>
                <Button onClick={openCreate} className="rounded-xl font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
                <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white">
                                            {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{p.name}</p>
                                            {p.bestseller && <Badge className="mt-0.5 bg-accent/15 text-accent">Best Seller</Badge>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 capitalize text-muted-foreground">{p.category} • {p.type}</td>
                                <td className="px-4 py-3">
                                    <span className="font-semibold text-primary">{pkr(p.sale_price > 0 ? p.sale_price : p.price)}</span>
                                    {p.sale_price > 0 && <span className="ml-2 text-xs text-muted-foreground line-through">{pkr(p.price)}</span>}
                                </td>
                                <td className={`px-4 py-3 font-medium ${p.stock <= 0 ? 'text-destructive' : p.stock <= 5 ? 'text-accent' : ''}`}>
                                    {p.stock}
                                </td>
                                <td className="px-4 py-3">
                                    <Switch checked={!!p.active} onCheckedChange={() => toggleActive(p)} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-muted-foreground hover:text-primary" aria-label="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setDeleting(p)} className="rounded-lg p-2 text-muted-foreground hover:text-destructive" aria-label="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && products.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No products yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto bg-background sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={save} className="mt-2 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Name *</Label>
                            <Input required value={form.name} onChange={(e) => set('name', e.target.value)} className="bg-secondary" />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={form.category} onValueChange={(v) => set('category', v)}>
                                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="men">Men</SelectItem>
                                    <SelectItem value="women">Women</SelectItem>
                                    <SelectItem value="kids">Kids</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Style</Label>
                            <Select value={form.type} onValueChange={(v) => set('type', v)}>
                                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sneakers">Sneakers</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="sandals">Sandals</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Base Price (PKR) *</Label>
                            <Input required type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className="bg-secondary" />
                        </div>
                        <div className="space-y-2">
                            <Label>Sale Price (PKR, optional)</Label>
                            <Input type="number" min="0" value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} className="bg-secondary" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Sizes (comma separated)</Label>
                            <Input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="7, 8, 9, 10" className="bg-secondary" />
                        </div>

                        {/* Size Specific Pricing Section */}
                        {parsedSizes.length > 0 && (
                            <div className="space-y-3 rounded-xl border border-border p-4 bg-secondary/30 sm:col-span-2">
                                <Label className="text-sm font-bold">Size-Specific Pricing (Optional)</Label>
                                <p className="text-xs text-muted-foreground">Override price for specific sizes. Leave blank to use the base price.</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {parsedSizes.map((sz) => (
                                        <div key={sz} className="space-y-1">
                                            <span className="text-xs font-semibold text-muted-foreground">Size {sz} (PKR)</span>
                                            <Input
                                                type="number"
                                                placeholder="Base price"
                                                value={form.sizePrices?.[sz] || ''}
                                                onChange={(e) => {
                                                    const updated = { ...(form.sizePrices || {}), [sz]: e.target.value };
                                                    setForm({ ...form, sizePrices: updated });
                                                }}
                                                className="bg-background"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Colors (comma separated)</Label>
                            <Input value={form.colors} onChange={(e) => set('colors', e.target.value)} placeholder="Black, Brown" className="bg-secondary" />
                        </div>
                        <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="bg-secondary" />
                        </div>
                        <div className="flex items-center gap-6 pt-6 sm:col-span-2">
                            <label className="flex items-center gap-2 text-sm">
                                <Switch checked={form.active} onCheckedChange={(v) => set('active', v)} /> Active
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Switch checked={form.bestseller} onCheckedChange={(v) => set('bestseller', v)} /> Best Seller
                            </label>
                        </div>

                        {/* Device Image Upload Only */}
                        <div className="space-y-2 sm:col-span-2 rounded-xl border border-border p-4 bg-secondary/30">
                            <Label className="font-semibold flex items-center gap-1.5">
                                <Upload className="w-4 h-4 text-primary" />
                                Product Image (Upload from device)
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="bg-background cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {form.images && (
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-background">
                                        <img src={form.images} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="text-xs text-muted-foreground">Image successfully attached and ready to save.</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label>Description</Label>
                            <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="bg-secondary" />
                        </div>
                        <Button type="submit" disabled={saving} className="rounded-xl font-semibold sm:col-span-2">
                            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <AlertDialogContent className="bg-background">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the product from the store.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminProducts;