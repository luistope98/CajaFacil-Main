/**
 * Mirrors the backend's line-item tax calculation exactly (see
 * RegisterService.resolveRegisterItems / resolvePurchaseItems in the backend):
 *   lineSubtotal = round(price × qty)
 *   lineTax      = round(lineSubtotal × taxRate / 100)
 *   lineTotal    = lineSubtotal + lineTax
 * COP has no cents, so every monetary value is rounded to a whole peso.
 */

export function calcLineSubtotal(price: number, quantity: number): number {
  return Math.round(price * quantity);
}

export function calcLineTax(subtotal: number, taxRatePct: number): number {
  return Math.round(subtotal * (taxRatePct / 100));
}

export function calcLineTotal(price: number, taxRatePct: number, quantity: number): number {
  const subtotal = calcLineSubtotal(price, quantity);
  const tax = calcLineTax(subtotal, taxRatePct);
  return subtotal + tax;
}

/** Final unit price including tax — for display only (quantity = 1). */
export function calcFinalUnitPrice(price: number, taxRatePct: number): number {
  return calcLineTotal(price, taxRatePct, 1);
}
