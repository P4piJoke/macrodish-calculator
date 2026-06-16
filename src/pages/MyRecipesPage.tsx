import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import RecipeCard from "../components/recipe/RecipeCard";
import { useAuth } from "../hooks/useAuth";
import {
  getUserRecipes,
  deleteRecipe,
  setRecipeVisibility,
} from "../services/recipe.service";
import { type Recipe } from "../types/Recipe";

export default function MyRecipesPage() {
  const { firebaseUser } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getUserRecipes(firebaseUser.uid)
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  async function handleToggleVisibility(id: string, isPublic: boolean) {
    await setRecipeVisibility(id, isPublic);
    // Optimistic update — flip locally without re-fetching
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isPublic } : r))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    await deleteRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Recipes</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Your saved recipes — private and public.
          </p>
        </div>
        <Link
          to="/builder"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + New recipe
        </Link>
      </div>

      {loading && (
        <p className="text-center text-gray-400 py-16">Loading your recipes...</p>
      )}

      {!loading && recipes.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm mb-3">No recipes saved yet.</p>
          <Link
            to="/builder"
            className="text-green-600 font-medium text-sm hover:underline"
          >
            Build your first recipe →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            showActions
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </PageWrapper>
  );
}