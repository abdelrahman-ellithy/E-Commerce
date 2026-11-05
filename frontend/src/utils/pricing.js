export const TAX_RATE = 0.08;
export const SHIPPING_FEE = 9.99;
export const FREE_SHIPPING_THRESHOLD = 100;

export const round2 = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function calculateTotals(items) {
  const itemsPrice = round2(
    items.reduce((total, item) => total + item.price * item.quantity, 0)
  );
  const shippingPrice =
    itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const taxPrice = round2(itemsPrice * TAX_RATE);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
}
