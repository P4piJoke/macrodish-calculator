import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { addProduct } from "../../services/product.service";
import { getAllBrands } from "../../services/brand.service";
import { validateProduct } from "../../utils/validators";
import { type Product } from "../../types/Product";
import { type Brand } from "../../types/Brand";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onCreated: (product: Product) => void;
}

const EMPTY = { name: "", kcal: "", protein: "", carbs: "", fat: "" };

export default function AddProductModal({ isOpen, onClose, onCreated }: Props) {
  const { userProfile } = useAuth();

  const [fields,   setFields]   = useState(EMPTY);
  const [brandId,  setBrandId]  = useState<string>("");
  const [brands,   setBrands]   = useState<Brand[]>([]);
  const [errors,   setErrors]   = useState<string[]>([]);
  const [saving,   setSaving]   = useState(false);

  // Load brands list once on first open
  useEffect(() => {
    if (!isOpen) return;
    getAllBrands().then(setBrands);

    // Pre-fill brand if user is a brand user — but leave it editable
    if (userProfile?.brandId) {
      setBrandId(userProfile.brandId);
    }
  }, [isOpen]);

  function handleChange(key: keyof typeof EMPTY, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = {
      name:    fields.name,
      kcal:    parseFloat(fields.kcal)    || 0,
      protein: parseFloat(fields.protein) || 0,
      carbs:   parseFloat(fields.carbs)   || 0,
      fat:     parseFloat(fields.fat)     || 0,
    };

    const errs = validateProduct(parsed);
    if (errs.length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const created = await addProduct({
        ...parsed,
        createdBy: userProfile?.uid ?? "guest",
        ...(brandId ? { brandId } : {}),
      });
      onCreated(created);
      setFields(EMPTY);
      setBrandId(userProfile?.brandId ?? "");
      setErrors([]);
    } finally {
      setSaving(false);
    }
  }

  const numericFields = [
    { key: "kcal",    label: "Calories (kcal)" },
    { key: "protein", label: "Protein (g)"     },
    { key: "carbs",   label: "Carbs (g)"       },
    { key: "fat",     label: "Fat (g)"         },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add product">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 space-y-1">
          {errors.map((e) => (
            <p key={e} className="text-xs text-red-600">{e}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product name
          </label>
          <input
            type="text"
            required
            value={fields.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. Oat flakes"
          />
        </div>

        {/* Brand selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">— No brand (community product) —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Leave empty to add as a community product visible to everyone.
          </p>
        </div>

        {/* Macro fields */}
        <p className="text-xs text-gray-400 pt-1">All values per 100g</p>
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
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 text-sm transition-colors mt-2"
        >
          {saving ? "Adding..." : "Add product"}
        </button>
      </form>
    </Modal>
  );
}