import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,  // ← add
  deleteDoc,  // ← add
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { type Product } from "../types/Product";

/**
 * Fetch all products — global community ones + all brand-published ones.
 * ≈ productRepository.findAll()
 */
export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

/**
 * Fetch products belonging to a specific brand.
 * ≈ productRepository.findAllByBrandId(brandId)
 *
 * `where` ≈ a WHERE clause in JPQL
 */
export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const q = query(
    collection(db, "products"),
    where("brandId", "==", brandId),
    orderBy("name")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

/**
 * Fetch a single product by its Firestore document ID.
 * ≈ productRepository.findById(id)
 */
export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

/**
 * Client-side name search — filters already-fetched products by keyword.
 * Firestore has no native LIKE operator, so we filter in memory.
 * ≈ list.stream().filter(p -> p.getName().toLowerCase().contains(keyword))
 *
 * Good enough for small-to-medium catalogs (~thousands of products).
 * For larger scale you'd switch to Algolia or Firestore's new vector search.
 */
export function searchProductsByName(
  products: Product[],
  keyword: string
): Product[] {
  const lower = keyword.toLowerCase().trim();
  if (!lower) return products;
  return products.filter((p) => p.name.toLowerCase().includes(lower));
}

/**
 * Add a new product to Firestore.
 * addDoc() auto-generates the document ID — ≈ @GeneratedValue(strategy = AUTO)
 *
 * Returns the newly created product with its generated ID attached.
 */
export async function addProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  const ref = await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...product };
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id">>
): Promise<void> {
  await updateDoc(doc(db, "products", id), updates);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}