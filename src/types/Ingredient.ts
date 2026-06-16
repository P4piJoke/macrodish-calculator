import type { Product } from "./Product";

export interface Ingredient {
  product: Product;
  rawWeightGrams: number;
}