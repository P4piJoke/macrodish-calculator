import * as XLSX from "xlsx";
import { type Recipe } from "../types/Recipe";
import { calcRecipeMacros } from "./macroCalculator";

/**
 * Generates and downloads a .xlsx file for a given recipe.
 * Runs entirely in the browser — no server involved.
 * ≈ a ResponseEntity<byte[]> with Content-Disposition: attachment,
 * except the "server" is the user's own machine.
 */
export function exportRecipeToExcel(recipe: Recipe): void {
  const { per100g } = calcRecipeMacros(
    recipe.ingredients,
    recipe.cookedWeightGrams
  );

  const totalRawWeight = recipe.ingredients.reduce(
    (sum, ing) => sum + ing.rawWeightGrams, 0
  );

  // ── Sheet 1: Summary dashboard ──────────────────────────────────────────
  const summaryData = [
    ["MacroDish — Recipe Export"],
    [],
    ["Recipe",         recipe.name],
    ["Cooked weight",  `${recipe.cookedWeightGrams}g`],
    ["Total raw weight", `${totalRawWeight.toFixed(0)}g`],
    ["Yield",          `${((recipe.cookedWeightGrams / totalRawWeight) * 100).toFixed(1)}%`],
    ["Ingredients",    recipe.ingredients.length],
    ["Exported at",    new Date().toLocaleString()],
    [],
    ["── Macros per 100g (cooked) ──"],
    ["Calories",  per100g.kcal.toFixed(1),    "kcal"],
    ["Protein",   per100g.protein.toFixed(1), "g"],
    ["Carbs",     per100g.carbs.toFixed(1),   "g"],
    ["Fat",       per100g.fat.toFixed(1),     "g"],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Column widths
  summarySheet["!cols"] = [
    { wch: 22 },
    { wch: 16 },
    { wch: 8  },
  ];

  // ── Sheet 2: Raw ingredient breakdown ───────────────────────────────────
  const headerRow = [
    "Ingredient",
    "Raw weight (g)",
    "Kcal",
    "Protein (g)",
    "Carbs (g)",
    "Fat (g)",
  ];

  const ingredientRows = recipe.ingredients.map((ing) => {
    const w = ing.rawWeightGrams;
    const p = ing.product;
    return [
      p.name,
      w,
      +((p.kcal    / 100) * w).toFixed(1),
      +((p.protein / 100) * w).toFixed(1),
      +((p.carbs   / 100) * w).toFixed(1),
      +((p.fat     / 100) * w).toFixed(1),
    ];
  });

  // Totals row
  const totalsRow = [
    "TOTAL",
    totalRawWeight,
    ...["kcal", "protein", "carbs", "fat"].map((key) =>
      +recipe.ingredients
        .reduce((sum, ing) =>
          sum + (ing.product[key as keyof typeof ing.product] as number / 100) * ing.rawWeightGrams, 0
        )
        .toFixed(1)
    ),
  ];

  const breakdownSheet = XLSX.utils.aoa_to_sheet([
    headerRow,
    ...ingredientRows,
    [], // blank separator
    totalsRow,
  ]);

  breakdownSheet["!cols"] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 10 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
  ];

  // ── Assemble workbook ────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet,   "Summary");
  XLSX.utils.book_append_sheet(wb, breakdownSheet, "Ingredients");

  // Trigger browser download
  const filename = `${recipe.name.replace(/\s+/g, "_")}_macros.xlsx`;
  XLSX.writeFile(wb, filename);
}