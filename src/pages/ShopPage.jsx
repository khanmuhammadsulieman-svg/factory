import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ALL_SIZES = ['5', '6', '7', '8', '9', '10', '11', '28', '29', '30', '31', '32', '33', '34', '35'];
const ALL_COLORS = ['White', 'Black', 'Brown', 'Navy', 'Beige', 'Blue', 'Red', 'Orange'];

const ShopPage = () => {
    const [params, setParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(params.get('category') || 'all');
    const [type, setType] = useState(params.get('type') || 'all');
    const [size, setSize] = useState('all');
    const [color, setColor] = useState('all');
    const [maxPrice, setMaxPrice] = useState(5000);
    const [saleOnly, setSaleOnly] = useState(params.get('sale') === 'true');
    const [sort, setSort] = useState('featured');
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('active', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setProducts(data || []);
            } catch (err) {
                console.error('Error fetching products:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        setCategory(params.get('category') || 'all');
        setType(params.get('type') || 'all');
        setSaleOnly(params.get('sale') === 'true');
    }, [params]);

    const filtered = useMemo(() => {
        let list = products.filter((p) => {
            const price = p.sale_price > 0 ? p.sale_price : p.price;
            if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (category !== 'all' && p.category !== category) return false;
            if (type !== 'all' && p.type !== type) return false;
            if (size !== 'all' && !(p.sizes || []).includes(size)) return false;
            if (color !== 'all' && !(p.colors || []).includes(color)) return false;
            if (price > maxPrice) return false;
            if (saleOnly && !(p.sale_price > 0 && p.sale_price < p.price)) return false;
            return true;
        });
        const price = (p) => (p.sale_price > 0 ? p.sale_price : p.price);
        if (sort === 'low') list = [...list].sort((a, b) => price(a) - price(b));
        if (sort === 'high') list = [...list].sort((a, b) => price(b) - price(a));
        if (sort === 'featured') list = [...list].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        return list;
    }, [products, search, category, type, size, color, maxPrice, saleOnly, sort]);

    const applyCategory = (v) => {
        setCategory(v);
        const next = new URLSearchParams(params);
        if (v === 'all') next.delete('category');
        else next.set('category', v);
        setParams(next, { replace: true });
    };

    const Filters = (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={applyCategory}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="kids">Kids</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Style</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All styles</SelectItem>
                        <SelectItem value="sneakers">Sneakers</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="sandals">Sandals</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Size (UK)</Label>
                <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All sizes</SelectItem>
                        {ALL_SIZES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Color</Label>
                <Select value={color} onValueChange={setColor}>
                    <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All colors</SelectItem>
                        {ALL_COLORS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-3">
                <Label>Max price: PKR {maxPrice.toLocaleString()}</Label>
                <Slider
                    value={[maxPrice]}
                    onValueChange={([v]) => setMaxPrice(v)}
                    min={999}
                    max={5000}
                    step={100}
                />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
                <Checkbox checked={saleOnly} onCheckedChange={(v) => setSaleOnly(!!v)} />
                Sale items only
            </label>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Helmet>
                <title>Shop Shoes — Men, Women & Kids Footwear from PKR 999 | Factory Outlet Shoes</title>
                <meta
                    name="description"
                    content="Browse factory-rate shoes in Pakistan: sneakers, casual, formal and sandals for men, women and kids. Filter by size, color and price. Cash on Delivery."
                />
            </Helmet>
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold">Shop All Shoes</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {filtered.length} {filtered.length === 1 ? 'style' : 'styles'} at factory rates
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search shoes…"
                                className="h-11 bg-secondary pl-9"
                            />
                        </div>
                        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="h-11 gap-2 border-border lg:hidden">
                                    <SlidersHorizontal className="h-4 w-4" /> Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 overflow-y-auto bg-background">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">{Filters}</div>
                            </SheetContent>
                        </Sheet>
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="h-11 w-36 bg-secondary">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="low">Price: Low to High</SelectItem>
                                <SelectItem value="high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-32 rounded-2xl border border-border bg-secondary/30 p-5">
                            <h2 className="font-display mb-5 text-lg font-semibold">Filters</h2>
                            {Filters}
                        </div>
                    </aside>

                    <div>
                        {loading ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
                                <p className="font-display text-lg font-semibold">No shoes match your filters</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try widening the price range or clearing a filter.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                {filtered.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    >
                                        <ProductCard product={p} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ShopPage;
