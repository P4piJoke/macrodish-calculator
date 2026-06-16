import { useEffect, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import RecipeCard from "../components/recipe/RecipeCard";
import { getPublicRecipes } from "../services/recipe.service";
import { type Recipe } from "../types/Recipe";

export default function PublicRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getPublicRecipes()
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase().trim())
  );

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Public Recipes</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Recipes shared by the MacroDish community.
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes..."
        className="w-full sm:w-auto sm:max-w-sm border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
      />

      {loading && (
        <p className="text-center text-gray-400 py-16">Loading recipes...</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm">
            {query ? `No recipes found for "${query}".` : "No public recipes yet."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            showCopy
          />
        ))}
      </div>
    </PageWrapper>
  );
}