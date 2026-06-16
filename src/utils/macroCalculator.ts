import type { Ingredient } from "../types/Ingredient";

export interface MacroTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Step 1 — Sum raw macros across all ingredients.
 * Each product's macros are per 100g, so we scale by actual weight used.
 */
export function sumRawMacros(ingredients: Ingredient[]): MacroTotals {
  return ingredients.reduce(
    (totals, { product, rawWeightGrams }) => ({
      kcal:    totals.kcal    + (product.kcal    / 100) * rawWeightGrams,
      protein: totals.protein + (product.protein / 100) * rawWeightGrams,
      carbs:   totals.carbs   + (product.carbs   / 100) * rawWeightGrams,
      fat:     totals.fat     + (product.fat     / 100) * rawWeightGrams,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Step 2 — Normalise to per-100g of the COOKED dish.
 * This is where moisture loss/gain gets corrected automatically.
 */
export function calcPer100gCooked(
  rawTotals: MacroTotals,
  cookedWeightGrams: number
): MacroTotals {
  const scale = 100 / cookedWeightGrams;
  return {
    kcal:    rawTotals.kcal    * scale,
    protein: rawTotals.protein * scale,
    carbs:   rawTotals.carbs   * scale,
    fat:     rawTotals.fat     * scale,
  };
}

/**
 * Step 3 — Scale to a custom serving size.
 */
export function calcForServing(
  per100g: MacroTotals,
  servingGrams: number
): MacroTotals {
  const scale = servingGrams / 100;
  return {
    kcal:    per100g.kcal    * scale,
    protein: per100g.protein * scale,
    carbs:   per100g.carbs   * scale,
    fat:     per100g.fat     * scale,
  };
}

/**
 * Convenience — runs all three steps in one call.
 */
export function calcRecipeMacros(
  ingredients: Ingredient[],
  cookedWeightGrams: number,
  servingGrams?: number
): { per100g: MacroTotals; forServing: MacroTotals | null } {
  const raw = sumRawMacros(ingredients);
  const per100g = calcPer100gCooked(raw, cookedWeightGrams);
  const forServing = servingGrams ? calcForServing(per100g, servingGrams) : null;
  return { per100g, forServing };
}