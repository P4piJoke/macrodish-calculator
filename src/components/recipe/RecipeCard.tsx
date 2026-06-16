import { useNavigate } from "react-router-dom";
import { type Recipe } from "../../types/Recipe";
import { calcRecipeMacros } from "../../utils/macroCalculator";
import { exportRecipeToExcel } from "../../utils/excelExporter";
import { useAuth } from "../../hooks/useAuth";
import { useRecipeDraft } from "../../context/RecipeDraftContext";

interface Props {
  recipe: Recipe;
  showActions?: boolean;
  showCopy?: boolean; // ← new
  onToggleVisibility?: (id: string, isPublic: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function RecipeCard({
  recipe,
  showActions = false,
  showCopy = false,
  onToggleVisibility,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const { setDraft } = useRecipeDraft();

  function handleCopyAndEdit() {
    setDraft({
      name: `${recipe.name} (copy)`,
      cookedWeightGrams: recipe.cookedWeightGrams,
      ingredients: recipe.ingredients,
    });
    navigate("/builder?mode=copy");
  }

  const { per100g } = recipe.ingredients.length > 0 && recipe.cookedWeightGrams > 0
    ? calcRecipeMacros(recipe.ingredients, recipe.cookedWeightGrams)
    : { per100g: { kcal: 0, protein: 0, carbs: 0, fat: 0 } };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-800 text-base leading-tight">
            {recipe.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? "s" : ""} ·{" "}
            {recipe.cookedWeightGrams}g cooked
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${recipe.isPublic
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
          }`}>
          {recipe.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "kcal", value: per100g.kcal, color: "text-orange-600" },
          { label: "protein", value: per100g.protein, color: "text-blue-600" },
          { label: "carbs", value: per100g.carbs, color: "text-yellow-600" },
          { label: "fat", value: per100g.fat, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl py-2">
            <p className={`text-sm font-bold ${color}`}>{value.toFixed(1)}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center -mt-2">per 100g cooked</p>

      {/* Copy & Edit — shown on PublicRecipesPage for logged-in users */}
      {showCopy && firebaseUser && (
        <button
          onClick={handleCopyAndEdit}
          className="w-full text-center text-xs font-medium text-green-600 hover:text-green-700 border border-dashed border-green-300 hover:border-green-500 rounded-xl py-2 transition-colors"
        >
          Copy & Edit as my recipe
        </button>
      )}

      {/* Owner actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => onToggleVisibility?.(recipe.id, !recipe.isPublic)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${recipe.isPublic ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${recipe.isPublic ? "translate-x-4" : "translate-x-0.5"
                }`} />
            </div>
            <span className="text-xs text-gray-500">
              {recipe.isPublic ? "Public" : "Private"}
            </span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportRecipeToExcel(recipe)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Export .xlsx
            </button>
            <button
              onClick={() => navigate(`/builder?edit=${recipe.id}`)}
              className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(recipe.id)}
              className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}