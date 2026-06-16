import { type Ingredient } from "../../types/Ingredient";

interface Props {
  ingredient: Ingredient;
  index: number;
  onWeightChange: (index: number, grams: number) => void;
  onRemove: (index: number) => void;
}

export default function IngredientRow({
  ingredient,
  index,
  onWeightChange,
  onRemove,
}: Props) {
  const { product, rawWeightGrams } = ingredient;

  // Macros contributed by this single ingredient
  const contributed = {
    kcal:    (product.kcal    / 100) * rawWeightGrams,
    protein: (product.protein / 100) * rawWeightGrams,
    carbs:   (product.carbs   / 100) * rawWeightGrams,
    fat:     (product.fat     / 100) * rawWeightGrams,
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">

      {/* Product name + macro contribution */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {contributed.kcal.toFixed(0)} kcal · {contributed.protein.toFixed(1)}p ·{" "}
          {contributed.carbs.toFixed(1)}c · {contributed.fat.toFixed(1)}f
        </p>
      </div>

      {/* Weight input */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={rawWeightGrams}
          onChange={(e) => onWeightChange(index, parseFloat(e.target.value) || 0)}
          className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <span className="text-xs text-gray-400">g</span>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}