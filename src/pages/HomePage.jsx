import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import useSettings from '@/hooks/useSettings';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
    { name: 'Men', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600', link: '/shop?category=men' },
    { name: 'Women', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600', link: '/shop?category=women' },
    { name: 'Kids', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=600', link: '/shop?category=kids' },
    { name: 'School', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600', link: '/shop?category=school' },
    { name: 'Peshawari & Formals', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600', link: '/shop?style=formal' },
    { name: 'Sneakers & Casuals', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600', link: '/shop?style=sneakers' },
];

const QUICK_TABS = [
    { label: 'Men Collection', to: '/shop?category=men' },
    { label: 'Women Collection', to: '/shop?category=women' },
    { label: 'Kids Footwear', to: '/shop?category=kids' },
    { label: 'School Shoes', to: '/shop?category=school' },
    { label: 'Peshawari & Formals', to: '/shop?style=formal' },
    { label: 'Sneakers & Casuals', to: '/shop?style=sneakers' },
    { label: 'Active Sale Items', to: '/shop?sale=true' },
];

const HomePage = () => {
    const settings = useSettings();
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        pb.collection('products')
            .getList(1, 8, { sort: '-created', filter: 'active = true' })
            .then((r) => {
                if (r.items.length > 0) {
                    setBestSellers(r.items);
                } else {
                    setBestSellers([
                        { id: '1', title: 'Classic Leather Casual Shoe', price: 1299, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600' },
                        { id: '2', title: 'Executive Formal Peshawari', price: 1899, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600' },
                        { id: '3', title: 'Active Sports Running Sneaker', price: 1499, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600' },
                        { id: '4', title: 'Comfort School Shoe for Kids', price: 999, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600' }
                    ]);
                }
            })
            .catch(() => {
                setBestSellers([
                    { id: '1', title: 'Classic Leather Casual Shoe', price: 1299, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600' },
                    { id: '2', title: 'Executive Formal Peshawari', price: 1899, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600' },
                    { id: '3', title: 'Active Sports Running Sneaker', price: 1499, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600' },
                    { id: '4', title: 'Comfort School Shoe for Kids', price: 999, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600' }
                ]);
            });
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            <Helmet>
                <title>Factory Shoes Bahawalpur | Factory Outlet Bahawalpur Shoes Brand</title>
                <meta name="description" content="Looking for factory shoes in Bahawalpur? Shop top-quality footwear at Factory Outlet Bahawalpur — leading shoes brand offering styles starting from PKR 999 with cash on delivery." />
                <meta name="keywords" content="factory shoes bahawalpur, factory outlet bahawalpur, bahawalpur shoes brand, shoes in bahawalpur" />
            </Helmet>
            <Navbar />

            {/* Hero Section */}
            <motion.section
                className="relative w-full max-w-[95%] md:max-w-7xl mx-auto mt-6 mb-16 rounded-[2.5rem] overflow-hidden min-h-[500px] sm:min-h-[600px] flex items-center bg-gradient-to-r from-primary/95 to-primary/60 shadow-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200')` }}
                />

                {/* Top Right Animated Price Badge */}
                <motion.div
                    className="absolute top-3 right-3 md:top-6 md:right-8 z-20 flex items-center justify-center w-24 h-24 md:w-32 md:h-32"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Circling Outer Ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 md:border-[3px] border-dashed border-yellow-400"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Inner Badge */}
                    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-black rounded-full w-[85%] h-[85%] flex flex-col items-center justify-center shadow-2xl z-10 border border-yellow-300">
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-90 drop-shadow-sm">From</span>
                        <span className="text-sm md:text-xl font-black mt-[-2px] drop-shadow-sm">PKR 999</span>
                    </div>
                </motion.div>

                <div className="relative z-10 w-full px-6 sm:px-12 md:px-16 py-20 md:py-24 max-w-3xl">
                    <div className="flex flex-col justify-center">
                        {/* Brand Logo Support */}
                        {settings?.logo ? (
                            <div className="mb-4">
                                <img src={settings.logo} alt="Factory Outlet Shoes" className="h-10 object-contain brightness-0 invert" />
                            </div>
                        ) : null}

                        <motion.div
                            className="flex items-center gap-2 mb-4 md:mb-6 mt-2 md:mt-0"
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <span className="text-white/95 font-bold text-xs md:text-sm tracking-[0.15em] uppercase bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/30">
                                Bahawalpur, Walk This Way
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-[3.5rem] md:text-[5.5rem] font-black text-white leading-[0.85] tracking-tighter mb-6 uppercase font-display drop-shadow-sm"
                            initial={{ opacity: 0, y: -24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            Factory Outlet<br />
                            Bahawalpur.
                        </motion.h1>

                        <motion.p
                            className="text-base md:text-xl text-white/95 mb-8 max-w-md font-medium leading-relaxed drop-shadow-sm"
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Your premier Bahawalpur shoes brand for school runs, city miles, and celebrations — at honest factory prices.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2"
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black border border-yellow-300 px-8 h-14 rounded-full font-black text-lg transition-all duration-300 shadow-xl shadow-black/20 transform hover:-translate-y-1">
                                <Link to="/shop">Shop Collection <ArrowRight className="ml-2 w-5 h-5" /></Link>
                            </Button>
                            <div className="flex flex-col text-sm font-semibold text-white/90">
                                <span className="flex items-center gap-1">✓ Cash on Delivery</span>
                                <span className="flex items-center gap-1 text-white/70">✓ 7-Day Exchanges</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Categories */}
            <Reveal delay={0.2} y={40}>
                <section className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">Shop by Category</h2>
                            <Link to="/shop" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 group">
                                View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
                            {CATEGORIES.map((cat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                >
                                    <Link to={cat.link} className="group relative overflow-hidden rounded-xl md:rounded-2xl border border-border aspect-[4/5] bg-secondary shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 md:hover:-translate-y-2 block">
                                        <img src={cat.image} alt={cat.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />

                                        {/* CLEAN TEXT PLACED AT THE TOP WITHOUT WHITE BACKGROUND */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent transition-colors duration-500 flex items-start justify-center p-3 pt-3 md:pt-4">
                                            <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center w-[90%] truncate">
                                                {cat.name}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Best Sellers */}
            <Reveal delay={0.3} y={40}>
                <section className="py-12 md:py-16 bg-secondary/20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <div>
                                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">Best Selling Footwear</h2>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Handcrafted & factory-checked quality</p>
                            </div>
                            <Link to="/shop" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 group">
                                Browse Shop <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                            {bestSellers.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    className="transform hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300"
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Trust & Fresh Guarantee Banner */}
            <Reveal delay={0.4} y={40}>
                <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
                    <div className="rounded-2xl bg-gradient-to-br from-card to-secondary/40 border border-border p-5 md:p-6 shadow-md space-y-6">
                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border/60"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
                                <div className="p-3 rounded-2xl bg-primary text-primary-foreground shrink-0 shadow-sm">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-display text-sm md:text-base font-bold flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2">
                                        100% Fresh Factory Production <span className="text-[9px] md:text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">Zero Aged Stock</span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 sm:mt-0.5 max-w-md">Never aged, never low-grade seconds. Strictly factory-fresh pairs built for lasting comfort.</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Truck, title: 'Free Delivery', desc: 'All across Pakistan' },
                                { icon: ShieldCheck, title: 'Cash on Delivery', desc: 'Pay when parcel arrives' },
                                { icon: RotateCcw, title: '7-Day Exchanges', desc: 'Hassle-free size swaps' },
                                { icon: Headphones, title: 'Order Confirmation', desc: 'Verified by phone call' },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                >
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><item.icon className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-semibold text-xs md:text-sm">{item.title}</h4>
                                        <p className="text-[10px] md:text-[11px] text-muted-foreground">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Quick Category Tabs Bar */}
            <Reveal delay={0.5} y={40}>
                <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
                    <div className="text-center mb-6">
                        <h3 className="font-display text-base md:text-lg font-bold tracking-tight">Quick Collection Navigation</h3>
                        <p className="text-[11px] md:text-xs text-muted-foreground mt-1">Jump directly to your favorite category</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                        {QUICK_TABS.map((tab, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.5, delay: idx * 0.08 }}
                            >
                                <Link
                                    to={tab.to}
                                    className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-border bg-card text-[11px] md:text-xs font-semibold hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm inline-block"
                                >
                                    {tab.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </Reveal>

            <Footer />
        </div>
    );
};

export default HomePage;
