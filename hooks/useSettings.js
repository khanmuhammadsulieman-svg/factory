import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

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
        pb.collection('settings')
            .getList(1, 1)
            .then((r) => {
                if (r.items[0]) {
                    setSettings((prev) => ({ ...prev, ...r.items[0] }));
                }
            })
            .catch(() => {});
    }, []);

    return settings;
}