import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import IngredientRow from "../components/recipe/IngredientRow";
import RecipeSummary from "../components/recipe/RecipeSummary";
import { useRecipe } from "../hooks/useRecipe";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../hooks/useAuth";
import { saveRecipe } from "../services/recipe.service";
import { type Product } from "../types/Product";
import { useSearchParams } from "react-router-dom";
import { getRecipeById, updateRecipe } from "../services/recipe.service";
import { exportRecipeToExcel } from "../utils/excelExporter";
import { useRecipeDraft } from "../context/RecipeDraftContext";

export default function RecipeBuilderPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const {
    recipe, serving, macros, errors,
    setName, setCookedWeight, setIsPublic,
    addIngredient, removeIngredient, updateIngredientWeight,
    setServing, validate, reset,
  } = useRecipe();

  const { search, loading: productsLoading } = useProducts();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit"); // ≈ @RequestParam("edit")
  const [editLoading, setEditLoading] = useState(false);

  // If ?edit=recipeId is present, load that recipe into the form on mount
  useEffect(() => {
    if (!editId) return;
    setEditLoading(true);
    getRecipeById(editId).then((r) => {
      if (!r) return;
      reset(); // ← clear form first before loading saved data
      setName(r.name);
      setCookedWeight(r.cookedWeightGrams);
      setIsPublic(r.isPublic);
      r.ingredients.forEach((ing) =>
        addIngredient(ing.product, ing.rawWeightGrams)
      );
    }).finally(() => setEditLoading(false));
  }, [editId]);

  const { draft, setDraft } = useRecipeDraft();
  const mode = searchParams.get("mode");

  // Load from draft when mode=copy
  useEffect(() => {
    if (mode !== "copy" || !draft) return;
    reset();
    setName(draft.name);
    setCookedWeight(draft.cookedWeightGrams);
    setIsPublic(false); // copies are always private by default
    draft.ingredients.forEach((ing) =>
      addIngredient(ing.product, ing.rawWeightGrams)
    );
    setDraft(null); // consume the draft so it doesn't persist on refresh
  }, [mode]);

  // Search bar state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Saving state
  const [saving, setSaving] = useState(false);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (value.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    setSearchResults(search(value).slice(0, 8)); // cap at 8 results
  }

  function handlePickProduct(product: Product) {
    addIngredient(product, 100); // default 100g — editable inline
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
  }

  async function handleSave() {
    if (!validate()) return;
    if (!firebaseUser) { navigate("/login"); return; }

    setSaving(true);
    try {
      if (editId) {
        // Update existing recipe ≈ repository.save(detachedEntity)
        await updateRecipe(editId, {
          name: recipe.name,
          isPublic: recipe.isPublic,
          cookedWeightGrams: recipe.cookedWeightGrams,
          ingredients: recipe.ingredients,
        });
      } else {
        // Create new recipe
        await saveRecipe({
          authorId: firebaseUser.uid,
          name: recipe.name,
          isPublic: recipe.isPublic,
          cookedWeightGrams: recipe.cookedWeightGrams,
          ingredients: recipe.ingredients,
        });
      }
      reset();
      navigate("/my-recipes");
    } finally {
      setSaving(false);
    }
  }

  const totalRawWeight = recipe.ingredients.reduce(
    (sum, ing) => sum + ing.rawWeightGrams, 0
  );

  if (editLoading) {
    return (
      <PageWrapper>
        <p className="text-center text-gray-400 py-20">Loading recipe...</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recipe Builder</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Add raw ingredients, enter cooked weight, get precise macros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export button — only when recipe has data */}
          {recipe.ingredients.length > 0 && recipe.cookedWeightGrams > 0 && (
            <button
              onClick={() =>
                exportRecipeToExcel({
                  id: "preview",
                  authorId: firebaseUser?.uid ?? "guest",
                  createdAt: new Date(),
                  name: recipe.name || "Untitled",
                  isPublic: recipe.isPublic,
                  cookedWeightGrams: recipe.cookedWeightGrams,
                  ingredients: recipe.ingredients,
                })
              }
              className="bg-white border border-gray-300 hover:border-green-400 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Export .xlsx
            </button>
          )}

          {firebaseUser && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              {saving ? "Saving..." : editId ? "Update recipe" : "Save recipe"}
            </button>
          )}
        </div>

      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 space-y-1">
          {errors.map((err) => (
            <p key={err} className="text-sm text-red-600">{err}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left panel — ingredients ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Recipe meta */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe name
              </label>
              <input
                type="text"
                value={recipe.name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Chicken Tikka Masala"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cooked weight (g)
              </label>
              <input
                type="number"
                min={0}
                value={recipe.cookedWeightGrams || ""}
                onChange={(e) => setCookedWeight(parseFloat(e.target.value) || 0)}
                className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 750"
              />
              <p className="text-xs text-gray-400 mt-1">
                Weigh the finished dish after cooking.
              </p>
            </div>

            {firebaseUser && (
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recipe.isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="accent-green-600"
                />
                Make this recipe public
              </label>
            )}
          </div>

          {/* Ingredient list */}
          <div className="space-y-2">
            {recipe.ingredients.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                No ingredients yet — click <strong>+</strong> to add one.
              </div>
            )}
            {recipe.ingredients.map((ing, i) => (
              <IngredientRow
                key={`${ing.product.id}-${i}`}
                ingredient={ing}
                index={i}
                onWeightChange={updateIngredientWeight}
                onRemove={removeIngredient}
              />
            ))}
          </div>

          {/* Floating + button / search bar */}
          <div ref={searchRef} className="relative">
            {!searchOpen ? (
              <button
                onClick={() => { setSearchOpen(true); }}
                disabled={productsLoading}
                className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 border border-dashed border-green-300 hover:border-green-500 rounded-xl px-4 py-2.5 w-full justify-center transition-colors"
              >
                <span className="text-lg leading-none">+</span>
                {productsLoading ? "Loading products..." : "Add ingredient"}
              </button>
            ) : (
              <div className="border border-green-400 rounded-xl overflow-hidden shadow-sm">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm focus:outline-none"
                  placeholder="Search products... (e.g. chicken breast)"
                />
                {searchResults.length > 0 && (
                  <ul className="border-t border-gray-100 divide-y divide-gray-50 max-h-56 overflow-y-auto">
                    {searchResults.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => handlePickProduct(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-800">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {p.kcal} kcal · {p.protein}p · {p.carbs}c · {p.fat}f per 100g
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {searchQuery.length > 0 && searchResults.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-400">
                    No products found for "{searchQuery}".
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel — summary ── */}
        <div className="lg:col-span-1">
          <RecipeSummary
            per100g={macros.per100g}
            forServing={macros.forServing}
            serving={serving}
            onServingChange={setServing}
            totalRawWeight={totalRawWeight}
            cookedWeight={recipe.cookedWeightGrams}
          />
        </div>
      </div>
    </PageWrapper>
  );
}