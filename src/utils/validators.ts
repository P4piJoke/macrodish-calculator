/**
 * Rejects empty or whitespace-only strings.
 * ≈ @NotBlank in Java
 */
export function isNonBlank(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Rejects zero, negatives, and NaN.
 * ≈ @Positive in Java
 */
export function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Rejects negatives and NaN, but allows zero.
 * ≈ @PositiveOrZero in Java
 */
export function isNonNegativeNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

/**
 * Validates a full product's macro fields before saving to Firestore.
 * Returns a list of error messages — empty array means valid.
 * ≈ a manual BindingResult check in a @PostMapping handler
 */
export function validateProduct(fields: {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}): string[] {
  const errors: string[] = [];

  if (!isNonBlank(fields.name))            errors.push("Product name is required.");
  if (!isNonNegativeNumber(fields.kcal))   errors.push("Calories must be 0 or greater.");
  if (!isNonNegativeNumber(fields.protein))errors.push("Protein must be 0 or greater.");
  if (!isNonNegativeNumber(fields.carbs))  errors.push("Carbs must be 0 or greater.");
  if (!isNonNegativeNumber(fields.fat))    errors.push("Fat must be 0 or greater.");

  return errors;
}

/**
 * Validates recipe-level fields before saving.
 */
export function validateRecipe(fields: {
  name: string;
  cookedWeightGrams: number;
  ingredientCount: number;
}): string[] {
  const errors: string[] = [];

  if (!isNonBlank(fields.name))
    errors.push("Recipe name is required.");
  if (!isPositiveNumber(fields.cookedWeightGrams))
    errors.push("Cooked weight must be greater than 0.");
  if (fields.ingredientCount === 0)
    errors.push("Add at least one ingredient.");

  return errors;
}