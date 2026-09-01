export const pkr = (n) => `PKR ${Number(n || 0).toLocaleString('en-US')}`;

export const effectivePrice = (product) =>
    product && product.sale_price > 0 ? product.sale_price : product?.price || 0;

export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FEE = 200;

export const deliveryFee = (subtotal) =>
    subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
