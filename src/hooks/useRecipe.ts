import { useState } from "react";
import { type Ingredient } from "../types/Ingredient";
import { type Product } from "../types/Product";
import { calcRecipeMacros, type MacroTotals } from "../utils/macroCalculator";
import { validateRecipe } from "../utils/validators";

interface RecipeState {
  name:              string;
  ingredients:       Ingredient[];
  cookedWeightGrams: number;
  isPublic:          boolean;
}

const EMPTY: RecipeState = {
  name:              "",
  ingredients:       [],
  cookedWeightGrams: 0,
  isPublic:          false,
};

export function useRecipe() {
  const [recipe,  setRecipe]  = useState<RecipeState>(EMPTY);
  const [serving, setServing] = useState<number>(100);
  const [errors,  setErrors]  = useState<string[]>([]);

  function setName(name: string) {
    setRecipe((prev) => ({ ...prev, name }));
  }

  function setCookedWeight(cookedWeightGrams: number) {
    setRecipe((prev) => ({ ...prev, cookedWeightGrams }));
  }

  function setIsPublic(isPublic: boolean) {
    setRecipe((prev) => ({ ...prev, isPublic }));
  }

  function addIngredient(product: Product, rawWeightGrams: number) {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { product, rawWeightGrams }],
    }));
  }

  function removeIngredient(index: number) {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  function updateIngredientWeight(index: number, rawWeightGrams: number) {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, rawWeightGrams } : ing
      ),
    }));
  }

  function reset() {
    setRecipe(EMPTY);
    setServing(100);
    setErrors([]);
  }

  /**
   * Runs validation and returns true if the recipe is ready to save.
   * ≈ calling validator.validate(dto) and checking BindingResult.hasErrors()
   */
  function validate(): boolean {
    const errs = validateRecipe({
      name:              recipe.name,
      cookedWeightGrams: recipe.cookedWeightGrams,
      ingredientCount:   recipe.ingredients.length,
    });
    setErrors(errs);
    return errs.length === 0;
  }

  /**
   * Derived values — recalculated on every render from current state.
   * ≈ @Transient fields in JPA — not stored, always computed.
   */
  const macros: { per100g: MacroTotals; forServing: MacroTotals | null } =
    recipe.cookedWeightGrams > 0 && recipe.ingredients.length > 0
      ? calcRecipeMacros(recipe.ingredients, recipe.cookedWeightGrams, serving)
      : { per100g: { kcal: 0, protein: 0, carbs: 0, fat: 0 }, forServing: null };

  return {
    recipe,
    serving,
    setServing,
    macros,
    errors,
    setName,
    setCookedWeight,
    setIsPublic,
    addIngredient,
    removeIngredient,
    updateIngredientWeight,
    validate,
    reset,
  };
}