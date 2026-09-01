import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { deliveryFee, pkr } from '@/lib/money';

const CartPage = () => {
    const { items, updateQty, remove, subtotal } = useCart();
    const fee = deliveryFee(subtotal);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Helmet>
                <title>Your Cart | Factory Outlet Shoes</title>
                <meta name="description" content="Review your cart and checkout with Cash on Delivery anywhere in Pakistan." />
            </Helmet>
            <Navbar />
            <main className="mx-auto max-w-5xl px-4 py-10">
                <h1 className="font-display text-3xl font-bold">Your Cart</h1>

                {items.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-dashed border-border py-20 text-center">
                        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="font-display mt-4 text-xl font-semibold">Your cart is empty</p>
                        <p className="mt-1 text-sm text-muted-foreground">Factory-rate shoes from PKR 999 are waiting.</p>
                        <Button asChild className="mt-6 rounded-xl">
                            <Link to="/shop">Shop Now</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
                        <div className="space-y-4">
                            {items.map((i) => (
                                <div
                                    key={i.key}
                                    className="flex gap-4 rounded-2xl border border-border bg-secondary/30 p-4"
                                >
                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                                        {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-display font-semibold">{i.name}</h3>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    UK {i.size}
                                                    {i.color ? ` • ${i.color}` : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => remove(i.key)}
                                                className="text-muted-foreground transition-colors hover:text-destructive"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <div className="flex items-center rounded-lg border border-border">
                                                <button
                                                    onClick={() => updateQty(i.key, i.qty - 1)}
                                                    className="flex h-9 w-9 items-center justify-center"
                                                    aria-label="Decrease"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                                                <button
                                                    onClick={() => updateQty(i.key, i.qty + 1)}
                                                    className="flex h-9 w-9 items-center justify-center"
                                                    aria-label="Increase"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <p className="font-display font-bold text-primary">{pkr(i.price * i.qty)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="h-fit rounded-2xl border border-border bg-secondary/30 p-6">
                            <h2 className="font-display text-lg font-semibold">Order Summary</h2>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{pkr(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Delivery</span>
                                    <span>{fee === 0 ? 'FREE' : pkr(fee)}</span>
                                </div>
                                {fee > 0 && (
                                    <p className="text-xs text-accent">
                                        Add {pkr(5000 - subtotal)} more for free delivery
                                    </p>
                                )}
                                <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{pkr(subtotal + fee)}</span>
                                </div>
                            </div>
                            <Button asChild size="lg" className="mt-6 h-12 w-full rounded-xl text-base font-semibold">
                                <Link to="/checkout">
                                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Cash on Delivery available nationwide
                            </p>
                        </aside>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CartPage;
