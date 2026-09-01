import React from 'react';
import { Link } from 'react-router-dom';
import { Footprints, Mail, MapPin, Phone } from 'lucide-react';
import useSettings from '@/hooks/useSettings';

const Footer = () => {
    const settings = useSettings();

    return (
        <footer className="border-t border-border bg-secondary/40">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
                <div>
                   <Link to="/" className="flex items-center">
    <span className="font-display text-2xl font-black uppercase tracking-tighter text-foreground">
        FACTORY<span className="text-primary">/</span>OUTLET
    </span>
</Link>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        Factory-rate footwear delivered across Pakistan. Quality shoes from PKR 999 with Cash on
                        Delivery.
                    </p>
                </div>
                <div>
                    <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Shop</h4>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <li><Link className="hover:text-primary" to="/shop?category=men">Men</Link></li>
                        <li><Link className="hover:text-primary" to="/shop?category=women">Women</Link></li>
                        <li><Link className="hover:text-primary" to="/shop?category=kids">Kids</Link></li>
                        <li><Link className="hover:text-primary" to="/shop?sale=true">Sale</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Help</h4>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <li><Link className="hover:text-primary" to="/shipping">Shipping &amp; Returns</Link></li>
                        <li><Link className="hover:text-primary" to="/faq">FAQ</Link></li>
                        <li><Link className="hover:text-primary" to="/about">About Us</Link></li>
                        <li><Link className="hover:text-primary" to="/contact">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Contact</h4>
                    <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {settings.contact_phone}
                        </li>
                        <li className="flex items-start gap-2">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <a href="mailto:support@factoryoutletshoes.store" className="hover:text-primary transition-colors">
                                support@factoryoutletshoes.store
                            </a>
                        </li>
                        <li className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {settings.address}
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} factoryoutletshoes.store — All prices in {settings.currency}. Catalog
                currently shows demo inventory for testing.
            </div>
        </footer>
    );
};

export default Footer;