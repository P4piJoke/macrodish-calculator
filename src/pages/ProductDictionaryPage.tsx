import { useState, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import ProductCard from "../components/product/ProductCard";
import AddProductModal from "../components/product/AddProductModal";
import Modal from "../components/ui/Modal";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../hooks/useAuth";
import { getAllBrands } from "../services/brand.service";
import { updateProduct, deleteProduct } from "../services/product.service";
import { validateProduct } from "../utils/validators";
import { type Product } from "../types/Product";

export default function ProductDictionaryPage() {
  const { userProfile } = useAuth();
  const { products, loading, search: searchFn } = useProducts();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [localList, setLocalList] = useState<Product[]>([]);
  const [brandMap, setBrandMap] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editFields, setEditFields] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!loading && !initialized) {
      setLocalList(products);
      setInitialized(true);
    }
  }, [loading, products]);

  useEffect(() => {
    getAllBrands().then((brands) => {
      const map: Record<string, string> = {};
      brands.forEach((b) => { map[b.id] = b.name; });
      setBrandMap(map);
    });
  }, []);

  /**
   * Permission check — mirrors the rule:
   * canEdit = createdBy === uid OR same brand
   * ≈ @PreAuthorize("principal.uid == #product.createdBy
   *     or principal.brandId == #product.brandId")
   */
  function canEdit(product: Product): boolean {
    if (!userProfile) return false;
    if (product.createdBy === userProfile.uid) return true;
    if (
      userProfile.brandId &&
      product.brandId &&
      userProfile.brandId === product.brandId
    ) return true;
    return false;
  }

  function openEdit(product: Product) {
    setEditTarget(product);
    setEditFields({
      name: product.name,
      kcal: String(product.kcal),
      protein: String(product.protein),
      carbs: String(product.carbs),
      fat: String(product.fat),
    });
    setEditErrors([]);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;

    const parsed = {
      name: editFields.name,
      kcal: parseFloat(editFields.kcal) || 0,
      protein: parseFloat(editFields.protein) || 0,
      carbs: parseFloat(editFields.carbs) || 0,
      fat: parseFloat(editFields.fat) || 0,
    };

    const errs = validateProduct(parsed);
    if (errs.length > 0) { setEditErrors(errs); return; }

    setEditSaving(true);
    try {
      await updateProduct(editTarget.id, parsed);
      setLocalList((prev) =>
        prev.map((p) => p.id === editTarget.id ? { ...p, ...parsed } : p)
      );
      setEditTarget(null);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await deleteProduct(id);
    setLocalList((prev) => prev.filter((p) => p.id !== id));
  }

  const results = query.trim()
    ? localList.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase().trim())
    )
    : localList;

  const numericFields = [
    { key: "kcal", label: "Calories (kcal)" },
    { key: "protein", label: "Protein (g)" },
    { key: "carbs", label: "Carbs (g)" },
    { key: "fat", label: "Fat (g)" },
  ] as const;

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Dictionary</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Browse all products or contribute your own.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + Add product
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full max-w-sm border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
      />

      {loading && (
        <p className="text-center text-gray-400 py-16">Loading products...</p>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm mb-3">
            {query ? `No products found for "${query}".` : "No products yet."}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-green-600 font-medium text-sm hover:underline"
          >
            Add the first one →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            brandName={p.brandId ? brandMap[p.brandId] : undefined}
            canEdit={canEdit(p)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <AddProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(p) => {
          setLocalList((prev) => [...prev, p]);
          setModalOpen(false);
        }}
      />

      {/* Edit modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit product"
      >
        {editErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 space-y-1">
            {editErrors.map((e) => (
              <p key={e} className="text-xs text-red-600">{e}</p>
            ))}
          </div>
        )}
        <form onSubmit={handleEditSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product name
            </label>
            <input
              type="text"
              required
              value={editFields.name}
              onChange={(e) => setEditFields((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <p className="text-xs text-gray-400">All values per 100g</p>
          <div className="grid grid-cols-2 gap-3">
            {numericFields.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={editFields[key]}
                  onChange={(e) =>
                    setEditFields((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={editSaving}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 text-sm transition-colors mt-2"
          >
            {editSaving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </Modal>
    </PageWrapper>
  );
}