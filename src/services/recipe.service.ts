import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { type Recipe } from "../types/Recipe";
import { type Ingredient } from "../types/Ingredient";

/**
 * Firestore can't store full nested Product objects cleanly inside an array,
 * so we flatten each Ingredient into a plain serializable shape for storage.
 * ≈ a @Converter in JPA that transforms an entity field before persisting.
 */
interface StoredIngredient {
  productId: string;
  productName: string;
  brandId?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  rawWeightGrams: number;
}

function toStoredIngredient(ingredient: Ingredient): StoredIngredient {
  const stored: StoredIngredient = {
    productId:      ingredient.product.id,
    productName:    ingredient.product.name,
    kcal:           ingredient.product.kcal,
    protein:        ingredient.product.protein,
    carbs:          ingredient.product.carbs,
    fat:            ingredient.product.fat,
    rawWeightGrams: ingredient.rawWeightGrams,
  };

  // Only include brandId if it's actually set — Firestore rejects undefined
  if (ingredient.product.brandId !== undefined) {
    stored.brandId = ingredient.product.brandId;
  }

  return stored;
}

/**
 * Reverse — reconstruct an Ingredient from the flat stored shape.
 * ≈ JPA hydrating an @Embeddable from a ResultSet row.
 */
function fromStoredIngredient(stored: StoredIngredient): Ingredient {
  return {
    product: {
      id:        stored.productId,
      name:      stored.productName,
      brandId:   stored.brandId,
      createdBy: "",
      kcal:      stored.kcal,
      protein:   stored.protein,
      carbs:     stored.carbs,
      fat:       stored.fat,
    },
    rawWeightGrams: stored.rawWeightGrams,
  };
}

/**
 * Save a new recipe to Firestore.
 * ≈ recipeRepository.save(recipe) for a new entity (no ID yet)
 */
export async function saveRecipe(
  recipe: Omit<Recipe, "id" | "createdAt">
): Promise<Recipe> {
  const ref = await addDoc(collection(db, "recipes"), {
    authorId:          recipe.authorId,
    name:              recipe.name,
    isPublic:          recipe.isPublic,
    cookedWeightGrams: recipe.cookedWeightGrams,
    ingredients:       recipe.ingredients.map(toStoredIngredient),
    createdAt:         serverTimestamp(),
  });

  return {
    ...recipe,
    id: ref.id,
    createdAt: new Date(),
  };
}

/**
 * Update an existing recipe.
 * ≈ recipeRepository.save(recipe) for a detached entity (has ID)
 */
export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, "id" | "createdAt">>
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates };
  if (updates.ingredients) {
    payload.ingredients = updates.ingredients.map(toStoredIngredient);
  }
  await updateDoc(doc(db, "recipes", id), payload);
}

/**
 * Delete a recipe.
 * ≈ recipeRepository.deleteById(id)
 */
export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, "recipes", id));
}

/**
 * Toggle a recipe's public/private visibility.
 * ≈ a dedicated @PatchMapping("/recipes/{id}/visibility")
 */
export async function setRecipeVisibility(
  id: string,
  isPublic: boolean
): Promise<void> {
  await updateDoc(doc(db, "recipes", id), { isPublic });
}

/**
 * Fetch all recipes saved by a specific user.
 * ≈ recipeRepository.findAllByAuthorId(authorId)
 */
export async function getUserRecipes(authorId: string): Promise<Recipe[]> {
  const q = query(
    collection(db, "recipes"),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id:                d.id,
      authorId:          data.authorId,
      name:              data.name,
      isPublic:          data.isPublic,
      cookedWeightGrams: data.cookedWeightGrams,
      ingredients:       (data.ingredients as StoredIngredient[]).map(fromStoredIngredient),
      createdAt:         (data.createdAt as Timestamp).toDate(),
    } as Recipe;
  });
}

/**
 * Fetch all recipes marked public — visible to every user.
 * ≈ recipeRepository.findAllByIsPublicTrue()
 */
export async function getPublicRecipes(): Promise<Recipe[]> {
  const q = query(
    collection(db, "recipes"),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id:                d.id,
      authorId:          data.authorId,
      name:              data.name,
      isPublic:          data.isPublic,
      cookedWeightGrams: data.cookedWeightGrams,
      ingredients:       (data.ingredients as StoredIngredient[]).map(fromStoredIngredient),
      createdAt:         (data.createdAt as Timestamp).toDate(),
    } as Recipe;
  });
}

/**
 * Fetch a single recipe by its Firestore document ID.
 * ≈ recipeRepository.findById(id)
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const snap = await getDoc(doc(db, "recipes", id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id:                snap.id,
    authorId:          data.authorId,
    name:              data.name,
    isPublic:          data.isPublic,
    cookedWeightGrams: data.cookedWeightGrams,
    ingredients:       (data.ingredients as StoredIngredient[]).map(fromStoredIngredient),
    createdAt:         (data.createdAt as Timestamp).toDate(),
  };
}
