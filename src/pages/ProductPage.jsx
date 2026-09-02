import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Minus, Plus, RefreshCcw, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCart } from '@/contexts/CartContext';
import useSettings from '@/hooks/useSettings';
import { effectivePrice, pkr } from '@/lib/money';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { add } = useCart();
    const settings = useSettings();
    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [image, setImage] = useState(0);
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [qty, setQty] = useState(1);

    useEffect(() => {
        setProduct(null);
        setNotFound(false);
        supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
                if (error || !data) {
                    setNotFound(true);
                } else {
                    setProduct(data);
                    setSize((data.sizes || [])[0] || '');
                    setColor((data.colors || [])[0] || '');
                    setImage(0);
                    setQty(1);
                }
            })
            .catch(() => setNotFound(true));
    }, [id]);

    if (notFound) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="mx-auto max-w-2xl px-4 py-24 text-center">
                    <h1 className="font-display text-2xl font-bold">Product not found</h1>
                    <p className="mt-2 text-muted-foreground">This pair may have sold out or been removed.</p>
                    <Button asChild className="mt-6 rounded-xl">
                        <Link to="/shop">Back to Shop</Link>
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2">
                    <div className="aspect-square animate-pulse rounded-3xl bg-secondary" />
                    <div className="space-y-4">
                        <div className="h-8 w-2/3 animate-pulse rounded bg-secondary" />
                        <div className="h-6 w-1/3 animate-pulse rounded bg-secondary" />
                        <div className="h-32 animate-pulse rounded bg-secondary" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const images = Array.isArray(product.images) && product.images.length ? product.images : [''];
    const price = effectivePrice(product);
    const onSale = product.sale_price > 0 && product.sale_price < product.price;
    const stock = product.stock || 0;
    const out = stock <= 0;

    const doAdd = () => {
        add(product, { size, color, qty });
        toast.success('Added to cart', { description: `${product.name} — UK ${size}${color ? `, ${color}` : ''}` });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Helmet>
                <title>{`${product.name} — ${pkr(price)} | Factory Outlet Shoes`}</title>
                <meta name="description" content={`${product.name} at factory rate ${pkr(price)}. Cash on Delivery across Pakistan, 7-day exchange.`} />
            </Helmet>
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
                <motion.nav
                    className="text-xs text-muted-foreground"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/" className="hover:text-primary">Home</Link> /{' '}
                    <Link to="/shop" className="hover:text-primary">Shop</Link> /{' '}
                    <span className="text-foreground">{product.name}</span>
                </motion.nav>

                <div className="mt-6 grid gap-10 md:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <div className="overflow-hidden rounded-3xl border border-border bg-white">
                            <img
                                src={images[image]}
                                alt={product.name}
                                className="aspect-square w-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="mt-3 flex gap-3">
                                {images.map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImage(i)}
                                        className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-white ${
                                            i === image ? 'border-primary' : 'border-border'
                                        }`}
                                    >
                                        <img src={src} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-primary/40 text-primary">
                                {product.category} • {product.type}
                            </Badge>
                            {onSale && <Badge className="bg-primary text-primary-foreground">SALE</Badge>}
                            {out ? (
                                <Badge variant="destructive">Out of Stock</Badge>
                            ) : stock <= 5 ? (
                                <Badge className="bg-accent text-accent-foreground">Only {stock} left</Badge>
                            ) : (
                                <Badge variant="outline" className="border-green-500/40 text-green-400">In Stock</Badge>
                            )}
                        </div>

                        {/* Brand Logo / Header Support */}
                        {settings?.logo ? (
                            <div className="my-3">
                                <img src={settings.logo} alt="Factory Outlet Shoes" className="h-8 object-contain" />
                            </div>
                        ) : null}

                        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">{product.name}</h1>

                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="font-display text-3xl font-bold text-primary">{pkr(price)}</span>
                            {onSale && (
                                <>
                                    <span className="text-lg text-muted-foreground line-through">{pkr(product.price)}</span>
                                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                                        Save {pkr(product.price - product.sale_price)}
                                    </span>
                                </>
                            )}
                        </div>

                        {(product.sizes || []).length > 0 && (
                            <div className="mt-7">
                                <p className="text-sm font-semibold">Size (UK)</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {product.sizes.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                                                size === s
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border hover:border-primary'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(product.colors || []).length > 0 && (
                            <div className="mt-5">
                                <p className="text-sm font-semibold">Color</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {product.colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`h-11 rounded-xl border px-4 text-sm font-medium transition-colors ${
                                                color === c
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border hover:border-primary'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-7 flex items-center gap-3">
                            <div className="flex items-center rounded-xl border border-border">
                                <button
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    className="flex h-12 w-11 items-center justify-center"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-10 text-center font-semibold">{qty}</span>
                                <button
                                    onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
                                    className="flex h-12 w-11 items-center justify-center"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <Button
                                size="lg"
                                variant="outline"
                                disabled={out}
                                onClick={doAdd}
                                className="h-13 rounded-xl border-primary/50 py-3.5 text-base font-semibold text-primary hover:bg-primary/10"
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                            </Button>
                            <Button
                                size="lg"
                                disabled={out}
                                onClick={() => {
                                    doAdd();
                                    navigate('/checkout');
                                }}
                                className="h-13 rounded-xl py-3.5 text-base font-semibold"
                            >
                                <Zap className="mr-2 h-4 w-4" /> Buy Now
                            </Button>
                        </div>

                        <div className="mt-7 space-y-3 rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
                            <p className="flex items-start gap-2.5">
                                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-muted-foreground">{settings.delivery_message}</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-muted-foreground">Cash on Delivery — pay only when your shoes arrive.</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-muted-foreground">7-day easy size exchange on unworn pairs.</span>
                            </p>
                        </div>

                        <Accordion type="single" collapsible className="mt-6">
                            <AccordionItem value="details">
                                <AccordionTrigger>Product Details</AccordionTrigger>
                                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                                    {product.description || 'Factory-direct quality footwear at outlet pricing.'}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="delivery">
                                <AccordionTrigger>Delivery &amp; Returns</AccordionTrigger>
                                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                                    {settings.delivery_message} Unworn pairs in original packaging can be exchanged
                                    within 7 days of delivery.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductPage;
