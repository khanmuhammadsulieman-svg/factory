import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { ShieldCheck, User, Lock, Save, Sparkles, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const PRESETS = [
    {
        name: 'Normal / Default Store',
        announcement: 'Factory-rate shoes from PKR 999 — Cash on Delivery nationwide — Free delivery all over Pakistan!',
        hero_title: 'Pairs for Real Life.',
        hero_subtitle: 'Comfort for school runs, city miles, celebrations and everything between — at honest factory prices.',
    },
    {
        name: '🇵🇰 14 August Independence Day Sale',
        announcement: '🟢 Jashn-e-Azadi Sale: Flat Discounts & Free Delivery Across Pakistan! 🇵🇰',
        hero_title: 'Independence Day Fest',
        hero_subtitle: 'Celebrate Pakistan with pride. Factory-rate shoes starting from only PKR 999 with nationwide COD.',
    },
    {
        name: '🌙 Eid-ul-Fitr Festive Collection',
        announcement: '✨ Eid Mubarak Sale: Step into Eid in style with Free Delivery on all orders! 🌙',
        hero_title: 'Exclusive Eid Collection',
        hero_subtitle: 'Make your festive moments special with premium Peshawari, Formals, and Kids shoes from PKR 999.',
    },
    {
        name: '🐐 Eid-ul-Adha Special Sale',
        announcement: '🕌 Eid-ul-Adha Celebration: Premium Sandals & Casuals with Free Delivery! 📦',
        hero_title: 'Eid-ul-Adha Comfort',
        hero_subtitle: 'Durable Peshawari chappals and leather sandals built for your festive gatherings.',
    },
];

const THEME_COLORS = [
    { id: 'orange', label: 'Warm Orange (Default)', class: 'bg-orange-500' },
    { id: 'emerald', label: 'Pakistan Emerald Green', class: 'bg-emerald-600' },
    { id: 'blue', label: 'Royal Blue', class: 'bg-blue-600' },
    { id: 'purple', label: 'Deep Purple', class: 'bg-purple-600' },
];

const FIELDS = [
    { key: 'store_name', label: 'Store Name' },
    { key: 'contact_phone', label: 'Contact Phone' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'whatsapp', label: 'WhatsApp Number' },
    { key: 'address', label: 'Business Address' },
    { key: 'currency', label: 'Currency Code' },
];

const AdminSettings = () => {
    const [record, setRecord] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    // Admin Credentials state
    const [currentUser, setCurrentUser] = useState(null);
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingCreds, setUpdatingCreds] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setCurrentUser(user);
                setNewEmail(user.email || '');
            }
        });

        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .limit(1)
                    .maybeSingle();

                if (data && !error) {
                    setRecord(data);
                    setForm(data);
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };

        fetchSettings();
    }, []);

    const applyPreset = (preset) => {
        setForm((prev) => ({
            ...prev,
            announcement: preset.announcement,
            hero_title: preset.hero_title,
            hero_subtitle: preset.hero_subtitle,
        }));
        toast.success(`Applied preset: ${preset.name}`);
    };

    const save = async (e) => {
        e.preventDefault();
        if (!record) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .update({
                    store_name: form.store_name || '',
                    contact_phone: form.contact_phone || '',
                    contact_email: form.contact_email || '',
                    whatsapp: form.whatsapp || '',
                    address: form.address || '',
                    delivery_message: form.delivery_message || '',
                    announcement: form.announcement || '',
                    hero_title: form.hero_title || '',
                    hero_subtitle: form.hero_subtitle || '',
                    theme_color: form.theme_color || 'orange',
                    currency: form.currency || 'PKR',
                })
                .eq('id', record.id);

            if (error) throw error;
            toast.success('Settings saved successfully');
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Could not save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateCredentials = async (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setUpdatingCreds(true);
        try {
            const updates = {};
            if (newEmail && newEmail !== currentUser?.email) {
                updates.email = newEmail;
            }
            if (newPassword) {
                updates.password = newPassword;
            }

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase.auth.updateUser(updates);
                if (error) throw error;
            }

            toast.success('Admin credentials updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Credential update failed:', err);
            toast.error(err.message || 'Failed to update credentials.');
        } finally {
            setUpdatingCreds(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8 pb-12">
            <Helmet>
                <title>Store Settings, Presets & Security | Admin</title>
            </Helmet>
            <div>
                <h1 className="font-display text-2xl font-bold">Store Settings, Presets & Security</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage store info, apply holiday presets, theme colors, and admin login credentials.
                </p>
            </div>

            {/* Festive Sale Presets */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base">Holiday & Festive Presets</h2>
                        <p className="text-xs text-muted-foreground">Click a preset to instantly load holiday banner copy.</p>
                    </div>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                    {PRESETS.map((p, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => applyPreset(p)}
                            className="text-left p-3 rounded-xl border border-border bg-background hover:border-primary transition cursor-pointer"
                        >
                            <span className="font-semibold text-xs block">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">{p.announcement}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme Color Selector */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base">Storefront Theme Color</h2>
                        <p className="text-xs text-muted-foreground">Select your primary accent color.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {THEME_COLORS.map((color) => (
                        <button
                            key={color.id}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, theme_color: color.id }))}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                (form.theme_color || 'orange') === color.id
                                    ? 'border-primary bg-primary/10 text-foreground'
                                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                            }`}
                        >
                            <span className={`w-3.5 h-3.5 rounded-full ${color.class}`}></span>
                            {color.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Admin Credentials Security Card */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base">Admin Login Credentials</h2>
                        <p className="text-xs text-muted-foreground">Change your admin email or password if compromised.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Admin Email (Username)</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="h-11 bg-background pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>New Password (Optional)</Label>
                            <Input
                                type="password"
                                placeholder="Leave blank to keep"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-11 bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11 bg-background"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={updatingCreds} className="rounded-xl font-semibold">
                            {updatingCreds ? 'Updating...' : 'Update Credentials'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Store Settings Form */}
            <form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-secondary/30 p-6">
                <div className="border-b border-border pb-4">
                    <h2 className="font-semibold text-base">Store Information & Hero Banner</h2>
                    <p className="text-xs text-muted-foreground">Appears across header, footer, checkout, and hero box.</p>
                </div>
                <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                        value={form.hero_title || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, hero_title: e.target.value }))}
                        className="h-11 bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Hero Subtitle</Label>
                    <Input
                        value={form.hero_subtitle || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, hero_subtitle: e.target.value }))}
                        className="h-11 bg-background"
                    />
                </div>
                {FIELDS.map((f) => (
                    <div key={f.key} className="space-y-2">
                        <Label>{f.label}</Label>
                        <Input
                            value={form[f.key] || ''}
                            onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                            className="h-11 bg-background"
                        />
                    </div>
                ))}
                <div className="space-y-2">
                    <Label>Delivery Message</Label>
                    <Textarea
                        rows={3}
                        value={form.delivery_message || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, delivery_message: e.target.value }))}
                        className="bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Announcement Bar Text</Label>
                    <Textarea
                        rows={2}
                        value={form.announcement || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, announcement: e.target.value }))}
                        className="bg-background"
                    />
                </div>
                <Button type="submit" disabled={saving || !record} className="rounded-xl font-semibold">
                    <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving…' : 'Save Settings'}
                </Button>
            </form>
        </div>
    );
};

export default AdminSettings;
