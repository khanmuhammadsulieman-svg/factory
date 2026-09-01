import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'fos_cart';

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // storage unavailable — cart stays in memory
        }
    }, [items]);

    const value = useMemo(() => {
        const add = (product, { size, color, qty = 1 }) => {
            const price = product.sale_price > 0 ? product.sale_price : product.price;
            const key = `${product.id}|${size}|${color}`;
            setItems((prev) => {
                const existing = prev.find((i) => i.key === key);
                if (existing) {
                    return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
                }
                return [
                    ...prev,
                    {
                        key,
                        productId: product.id,
                        name: product.name,
                        image: Array.isArray(product.images) ? product.images[0] : '',
                        price,
                        size,
                        color,
                        qty,
                    },
                ];
            });
        };

        const updateQty = (key, qty) => {
            setItems((prev) =>
                qty <= 0
                    ? prev.filter((i) => i.key !== key)
                    : prev.map((i) => (i.key === key ? { ...i, qty } : i)),
            );
        };

        const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
        const clear = () => setItems([]);

        const count = items.reduce((sum, i) => sum + i.qty, 0);
        const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

        return { items, add, updateQty, remove, clear, count, subtotal };
    }, [items]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

export default CartContext;
