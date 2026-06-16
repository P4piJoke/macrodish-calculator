import { type Product } from "../../types/Product";

interface Props {
  product:    Product;
  brandName?: string;
  canEdit?:   boolean; // ← parent resolves permission, passes result here
  onEdit?:    (product: Product) => void;
  onDelete?:  (id: string) => void;
}

export default function ProductCard({ product, brandName, canEdit, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">
          {product.name}
        </h3>
        {brandName && (
          <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full shrink-0">
            {brandName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1 text-center">
        {[
          { label: "kcal",    value: product.kcal,    color: "text-orange-600" },
          { label: "protein", value: product.protein,  color: "text-blue-600"   },
          { label: "carbs",   value: product.carbs,    color: "text-yellow-600" },
          { label: "fat",     value: product.fat,      color: "text-red-500"    },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg py-1.5">
            <p className={`text-xs font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center -mt-1">per 100g</p>

      {/* Only show actions if the current user has permission */}
      {canEdit && (onEdit || onDelete) && (
        <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}