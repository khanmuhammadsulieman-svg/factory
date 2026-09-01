import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { effectivePrice, pkr } from '@/lib/money';

const ProductCard = ({ product }) => {
    const price = effectivePrice(product);
    const onSale = product.sale_price > 0 && product.sale_price < product.price;
    const out = (product.stock || 0) <= 0;
    const image = Array.isArray(product.images) ? product.images[0] : '';

    return (
        <Link
            to={`/product/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-1"
        >
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
                {image && (
                    <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
                <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    {onSale && <Badge className="bg-primary text-primary-foreground">SALE</Badge>}
                    {product.bestseller && (
                        <Badge className="bg-accent text-accent-foreground">Best Seller</Badge>
                    )}
                    {out && <Badge variant="destructive">Out of Stock</Badge>}
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {product.category} • {product.type}
                </p>
                <h3 className="font-display line-clamp-1 text-base font-semibold">{product.name}</h3>
                <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="text-lg font-bold text-orange-600">{pkr(price)}</span>
                    {onSale && <span className="text-sm text-neutral-400 line-through">{pkr(product.price)}</span>}
                </div>
                <p className="text-xs text-neutral-500">
                    {out ? 'Currently unavailable' : `Sizes: ${(product.sizes || []).join(', ')}`}
                </p>
            </div>
        </Link>
    );
};

export default ProductCard;
