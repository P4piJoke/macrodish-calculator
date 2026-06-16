import type { Ingredient } from "./Ingredient";

export interface Recipe {
  id: string;
  authorId: string;
  name: string;
  isPublic: boolean;
  cookedWeightGrams: number;
  ingredients: Ingredient[];
  createdAt: Date;
}