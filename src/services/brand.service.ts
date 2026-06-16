import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import type { Brand } from "../types/Brand";

/**
 * Register a new brand.
 * Called during registration when role === "brand".
 * ≈ brandRepository.save(brand) for a new entity
 */
export async function registerBrand(
  brand: Omit<Brand, "id">
): Promise<Brand> {
  const ref = await addDoc(collection(db, "brands"), brand);
  return { id: ref.id, ...brand };
}

/**
 * Fetch a single brand by its Firestore document ID.
 * ≈ brandRepository.findById(id)
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  const snap = await getDoc(doc(db, "brands", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Brand) : null;
}

/**
 * Fetch all brands — used on the registration page so a new
 * brand user can either pick an existing brand or create a new one.
 * ≈ brandRepository.findAll()
 */
export async function getAllBrands(): Promise<Brand[]> {
  const q = query(collection(db, "brands"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Brand));
}

/**
 * Fetch all brands owned by a specific user.
 * ≈ brandRepository.findAllByOwnerId(ownerId)
 */
export async function getBrandsByOwner(ownerId: string): Promise<Brand[]> {
  const q = query(
    collection(db, "brands"),
    where("ownerId", "==", ownerId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Brand));
}