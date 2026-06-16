import { useState, useEffect } from "react";
import { type Product } from "../types/Product";
import {
  getAllProducts,
  addProduct,
  searchProductsByName,
} from "../services/product.service";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  function search(keyword: string): Product[] {
    return searchProductsByName(products, keyword);
  }

  async function createProduct(
    product: Omit<Product, "id">
  ): Promise<Product> {
    const created = await addProduct(product);
    // Optimistic update — add to local list immediately
    // ≈ adding to a local cache before the DB confirms, then reconciling
    setProducts((prev) => [...prev, created]);
    return created;
  }

  return { products, loading, error, search, createProduct };
}