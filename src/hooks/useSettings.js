import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function useSettings() {
    const [settings, setSettings] = useState({
        store_name: 'Factory Outlet Shoes',
        contact_phone: '+92 3027720477',
        contact_email: 'khanmuhammadsulieman@gmail.com',
        whatsapp: '+92 3044527009',
        address: 'Dubai chowk, near missri Center, Bahawalpur',
        currency: 'PKR',
        delivery_message: 'Nationwide delivery in 2-5 working days. Free Cash on Delivery across Pakistan.',
        announcement: 'Factory-rate shoes from PKR 999 — Cash on Delivery nationwide — Free delivery all over Pakistan!',
        hero_title: 'Factory-Rate Shoes. Unbeatable Quality.',
        hero_subtitle: 'Direct from factory floor to your doorstep starting from just PKR 999.',
        theme_color: 'orange',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .limit(1)
                    .maybeSingle();

                if (data && !error) {
                    setSettings((prev) => ({ ...prev, ...data }));
                }
            } catch (err) {
                // Fallback to default state if table doesn't exist yet
            }
        };

        fetchSettings();
    }, []);

    return settings;
}
