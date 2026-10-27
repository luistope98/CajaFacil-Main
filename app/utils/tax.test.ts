import { calcLineSubtotal, calcLineTax, calcLineTotal, calcFinalUnitPrice } from "./tax";

describe("calcLineSubtotal", () => {
  it("multiplies price by quantity and rounds to the nearest peso", () => {
    expect(calcLineSubtotal(3000, 2)).toBe(6000);
    expect(calcLineSubtotal(1499.6, 1)).toBe(1500);
  });
});

describe("calcLineTax", () => {
  it("applies the tax rate percentage to a subtotal, rounded", () => {
    expect(calcLineTax(6000, 19)).toBe(1140);
    expect(calcLineTax(10500, 0)).toBe(0);
  });
});

describe("calcLineTotal", () => {
  it("mirrors the backend formula exactly: round(price*qty) + round(subtotal*rate/100)", () => {
    // Same case validated against the live backend in the e2e suite:
    // Gaseosa 1.5L, price 3000, taxRate 19%, qty 2 -> subtotal 6000, IVA 1140, total 7140
    expect(calcLineTotal(3000, 19, 2)).toBe(7140);
  });

  it("returns just the subtotal when the tax rate is 0", () => {
    expect(calcLineTotal(1500, 0, 3)).toBe(4500);
  });

  it("rounds each step independently, not the final product", () => {
    // subtotal = round(999*3) = 2997; tax = round(2997*0.19) = 569; total = 3566
    expect(calcLineTotal(999, 19, 3)).toBe(3566);
  });
});

describe("calcFinalUnitPrice", () => {
  it("is equivalent to calcLineTotal for a single unit", () => {
    expect(calcFinalUnitPrice(3000, 19)).toBe(calcLineTotal(3000, 19, 1));
    expect(calcFinalUnitPrice(3000, 19)).toBe(3570);
  });

  it("returns the base price unchanged when the tax rate is 0", () => {
    expect(calcFinalUnitPrice(1500, 0)).toBe(1500);
  });
});
