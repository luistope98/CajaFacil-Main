import { InventoryProduct, ProductCategory } from "../types/product.types";

export const mockCategories: ProductCategory[] = [
  { id: 1, name: "Bebidas", description: "Bebidas en general" },
  { id: 2, name: "Panadería", description: "Pan y derivados" },
];

export const mockProducts: InventoryProduct[] = [
  {
    id: 1,
    categoryId: 1,
    posId: 1,
    ceco: "123123123",
    name: "Coca Cola 1.5",
    description: "Bebida gaseosa 1.5L",
    stock: 15,
    price: 1500,
    taxRate: 19,
    skus: [],
  },
  {
    id: 2,
    categoryId: 1,
    posId: 1,
    ceco: "999888777",
    name: "Sprite 1.5",
    description: "Bebida gaseosa 1.5L",
    stock: 10,
    price: 1400,
    taxRate: 19,
    skus: [],
  },
];
