import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Mail, MapPin, MessageCircle, Phone, Package, ShoppingBag, ArrowRight, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useSettings from '@/hooks/useSettings';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { pkr } from '@/lib/money';

const Shell = ({ title, children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = pb.authStore.model;

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // ─── STEP 1: Initial fetch ────────────────────────────────────────────────
    // PocketBase is the single source of truth for order STATUS.
    // We no longer blindly merge localStorage here — see note below.
    const fetchOrders = async () => {
      try {
        const records = await pb.collection('orders').getFullList({ sort: '-created' });

        // Filter to only this user's orders (by email or customer_id)
        const userOrders = records.filter((o) =>
          (currentUser.email &&
            (o.customer_email?.toLowerCase() === currentUser.email.toLowerCase() ||
              o.email?.toLowerCase() === currentUser.email.toLowerCase())) ||
          (currentUser.id && o.customer_id === currentUser.id)
        );

        // ── Local-storage reconciliation ─────────────────────────────────────
        // We still read localStorage, but ONLY to surface orders that were
        // placed as a guest (no real PocketBase record yet) and whose ID does
        // NOT already exist in the PocketBase result set.
        // Any order that exists in PocketBase takes precedence in full —
        // including its live `status` field.
        let localOnlyOrders = [];
        try {
          const raw = JSON.parse(localStorage.getItem('fos_customer_orders') || '[]');
          const pbIds = new Set(userOrders.map((o) => o.id));

          // Keep a local order only when:
          //   1. It belongs to this user, AND
          //   2. Its ID is NOT already in PocketBase (so we don't shadow a live record)
          localOnlyOrders = raw.filter((o) => {
            const emailMatch =
              currentUser.email &&
              (o.customer_email?.toLowerCase() === currentUser.email.toLowerCase() ||
                o.email?.toLowerCase() === currentUser.email.toLowerCase());
            const idMatch = currentUser.id && o.customer_id === currentUser.id;
            const notInPb = !o.id || !pbIds.has(o.id);
            return (emailMatch || idMatch) && notInPb;
          });
        } catch { /* ignore parse errors */ }

        const merged = [...userOrders, ...localOnlyOrders].sort(
          (a, b) => new Date(b.created) - new Date(a.created)
        );

        setOrders(merged);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on load
    fetchOrders();

    // ─── STEP 2: Poll every 10 seconds ───────────────────────────────────────
    // Real-time SSE subscriptions are blocked in this hosting environment,
    // so we poll PocketBase every 10 seconds to pick up any status changes
    // the admin made. This keeps the customer badge always up to date.
    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);

  }, [currentUser?.id]); // depend on user ID, not the whole object, to avoid infinite loops

  // ─── Status badge renderer ────────────────────────────────────────────────
  // Each status maps to a distinct colour + icon so the customer can scan at a glance.
  const getStatusBadge = (status = 'new') => {
    const s = (status || 'new').toLowerCase();
    const base = 'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold w-fit';

    if (s === 'confirmed')
      return <span className={`${base} text-amber-600 bg-amber-50`}><Clock className="w-3 h-3" /> Confirmed</span>;
    if (s === 'packed')
      return <span className={`${base} text-purple-600 bg-purple-50`}><Package className="w-3 h-3" /> Packed</span>;
    if (s === 'shipped')
      return <span className={`${base} text-blue-600 bg-blue-50`}><Truck className="w-3 h-3" /> Shipped</span>;
    if (s === 'delivered')
      return <span className={`${base} text-emerald-600 bg-emerald-50`}><CheckCircle className="w-3 h-3" /> Delivered</span>;
    if (s === 'cancelled')
      return <span className={`${base} text-red-600 bg-red-50`}><XCircle className="w-3 h-3" /> Cancelled</span>;

    // Default — 'new'
    return <span className={`${base} text-blue-500 bg-blue-500/15`}><Clock className="w-3 h-3" /> New Order</span>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet><title>My Orders | Factory Outlet Shoes</title></Helmet>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-2">My Orders</h1>
        <p className="text-xs text-muted-foreground mb-6">All orders placed with your account, updated live.</p>

        {!currentUser ? (
          <div className="bg-card border p-8 rounded-2xl text-center space-y-4">
            <Package className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold">Please Login</h2>
            <p className="text-sm text-muted-foreground">You need to be logged into your customer account to view your orders.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading your orders…</div>
        ) : orders.length === 0 ? (
          <div className="bg-card border p-12 rounded-2xl text-center space-y-4">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">No Orders Yet</h2>
            <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
            <Button asChild className="bg-primary text-primary-foreground">
              <a href="/shop">Start Shopping <ArrowRight className="w-4 h-4 ml-1.5" /></a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              let parsedItems = [];
              try {
                parsedItems = typeof order.items === 'string'
                  ? JSON.parse(order.items)
                  : (order.items || []);
              } catch { parsedItems = []; }

              return (
                <div key={order.id || Math.random()} className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Order ID</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</span>
                        {/* getStatusBadge reads order.status directly — always live from PB */}
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Date</span>
                      <span className="text-xs font-medium">
                        {order.created ? new Date(order.created).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Payment Method</span>
                      <span className="text-xs font-semibold">{order.payment_method || 'COD'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Total Amount</span>
                      <span className="font-bold text-primary">{pkr(order.total || 0)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground">Ordered Products:</p>
                    {parsedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-secondary/30 p-3 rounded-xl border">
                        {item.image && (
                          <img src={item.image} alt="" className="w-14 h-14 object-cover rounded-lg" />
                        )}
                        <div className="flex-1 text-xs space-y-1">
                          <p className="font-semibold text-sm">{item.title || item.name || 'Shoe Item'}</p>
                          <p className="text-muted-foreground">
                            Quantity: {item.quantity || item.qty || 1}
                            {item.size || item.selectedSize ? ` • Size: ${item.size || item.selectedSize}` : ''}
                            {item.color || item.selectedColor ? ` • Color: ${item.color || item.selectedColor}` : ''}
                          </p>
                          <p className="text-muted-foreground">Price: {pkr(item.price || 0)} each</p>
                        </div>
                        <span className="font-bold text-sm">
                          {pkr((item.price || 0) * (item.quantity || item.qty || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export const AboutPage = () => (
  <Shell title="About Factory Outlet Shoes">
    <Helmet>
      <title>About Us | Factory Outlet Shoes</title>
      <meta name="description" content="Factory Outlet Shoes brings factory-rate footwear to Pakistani families — quality shoes from PKR 999 with nationwide Cash on Delivery." />
    </Helmet>
    <p>
      Factory Outlet Shoes (factoryoutletshoes.store) started with a simple idea: Pakistani families
      shouldn&apos;t have to pay mall prices for good shoes. We work directly with footwear factories,
      cutting out distributors and retail markups, so the same pair that sells for double in stores
      reaches you at its true factory rate — starting from just PKR 999.
    </p>
    <p>
      Every style in our catalog is checked for stitching, sole bonding, and comfort before it lists.
      Whether it&apos;s school shoes for the kids, formals for the office, or a classic Peshawari for
      Jummah, we stock footwear built for real Pakistani life.
    </p>
    <p>
      We deliver to 150+ cities with Cash on Delivery, confirm every order by phone before dispatch,
      and offer a 7-day size exchange — because buying shoes online should feel as safe as buying
      them from your local bazaar.
    </p>
  </Shell>
);

export const ContactPage = () => {
  const settings = useSettings();
  return (
    <Shell title="Contact Us">
      <Helmet>
        <title>Contact Us | Factory Outlet Shoes</title>
        <meta name="description" content="Reach Factory Outlet Shoes by phone, WhatsApp or email. We confirm every order by call and are happy to help with sizing and delivery questions." />
      </Helmet>
      <p>
        Questions about sizing, your order, or an exchange? Message us — we reply fast during
        business hours (Mon–Sat, 10am–8pm PKT).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-secondary/30 p-5">
          <Phone className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">Phone</p>
          <p>{settings.contact_phone}</p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/30 p-5">
          <MessageCircle className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">WhatsApp</p>
          <p>{settings.whatsapp}</p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/30 p-5">
          <Mail className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">Email</p>
          <p>{settings.contact_email}</p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/30 p-5">
          <MapPin className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">Warehouse</p>
          <p>{settings.address}</p>
        </div>
      </div>
    </Shell>
  );
};

export const ShippingPage = () => {
  const settings = useSettings();
  return (
    <Shell title="Shipping & Returns">
      <Helmet>
        <title>Shipping & Returns | Factory Outlet Shoes</title>
        <meta name="description" content="Nationwide delivery in 2-5 working days, PKR 200 flat shipping (free over PKR 5,000), and a 7-day easy size exchange policy." />
      </Helmet>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Delivery</h2>
        <p className="mt-2">{settings.delivery_message}</p>
        <p className="mt-2">
          Orders are confirmed by phone before dispatch, then shipped via trusted courier
          (TCS / Leopards / PostEx depending on your city). You receive a tracking number on
          WhatsApp once your parcel ships.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">7-Day Exchange</h2>
        <p className="mt-2">
          Wrong size? No problem. Unworn pairs in original packaging can be exchanged within 7
          days of delivery. Message us on WhatsApp with your order number and the size you need —
          we arrange the swap.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Damaged or Wrong Item</h2>
        <p className="mt-2">
          If your pair arrives damaged or isn&apos;t what you ordered, contact us within 48 hours
          with a photo and we&apos;ll replace it or refund you in full.
        </p>
      </div>
    </Shell>
  );
};

const FAQS = [
  {
    q: 'How can prices start at PKR 999? Is the quality good?',
    a: 'We buy directly from footwear factories in bulk — no distributors, no mall rent, no brand markup. Every pair is quality-checked for stitching and sole bonding before listing, so you get genuine value, not cheap compromises.',
  },
  {
    q: 'Do you offer Cash on Delivery?',
    a: 'Yes — COD is available across Pakistan. You pay the rider in cash when your order arrives. No advance payment needed.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are confirmed by phone first, then dispatched. Delivery takes 2-5 working days depending on your city. Shipping is a flat PKR 200, and free on orders over PKR 5,000.',
  },
  {
    q: "What if the size doesn't fit?",
    a: 'We offer a 7-day easy size exchange on unworn pairs in original packaging. Just message us on WhatsApp with your order number.',
  },
  {
    q: 'How do I choose the right size?',
    a: "Our sizes are UK standard. If you're between sizes, we recommend going one size up for sneakers. Still unsure? Send us your foot length in cm on WhatsApp and we'll suggest a size.",
  },
  {
    q: 'Can I change or cancel my order?',
    a: "Yes — orders can be changed or cancelled free of charge any time before dispatch. Once the courier has picked up your parcel, it can only be exchanged after delivery.",
  },
];

export const FaqPage = () => (
  <Shell title="Frequently Asked Questions">
    <Helmet>
      <title>FAQ | Factory Outlet Shoes</title>
      <meta name="description" content="Answers about Cash on Delivery, delivery times, sizing, exchanges and factory-rate pricing at Factory Outlet Shoes Pakistan." />
    </Helmet>
    <Accordion type="single" collapsible className="w-full">
      {FAQS.map((f, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </Shell>
);

export const UserLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!isLogin) {
        if (!validatePassword(password)) {
          setError('Password must be at least 10 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
          return;
        }
        await pb.collection('users').create({
          name,
          email,
          password,
          passwordConfirm: password,
        });
        await pb.collection('users').authWithPassword(email, password);
        navigate('/my-orders');
      } else {
        await pb.collection('users').authWithPassword(email, password);
        navigate('/my-orders');
      }
    } catch (err) {
      console.error(err);
      setError(
        isLogin
          ? 'Invalid email or password. Please try again.'
          : err?.response?.message || 'Failed to create account. This email might already be registered.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet><title>{isLogin ? 'Login' : 'Sign Up'} | Factory Outlet Shoes</title></Helmet>
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full flex flex-col justify-center">
        <Card className="w-full shadow-sm border-border bg-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Enter your email and password to access your account'
                : 'Sign up to track orders and checkout faster'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-white bg-red-600 rounded-md">{error}</div>
              )}

              {!isLogin && (
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Ali Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="space-y-2 text-left">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus-visible:ring-primary"
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 10 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); }}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};