import { type MacroTotals } from "../../utils/macroCalculator";

interface Props {
  per100g:     MacroTotals;
  forServing:  MacroTotals | null;
  serving:     number;
  onServingChange: (g: number) => void;
  totalRawWeight: number;
  cookedWeight:   number;
}

function MacroGrid({ macros, label }: { macros: MacroTotals; label: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: "kcal",    label: "Calories", unit: "kcal", color: "bg-orange-50 text-orange-700" },
          { key: "protein", label: "Protein",  unit: "g",    color: "bg-blue-50 text-blue-700"   },
          { key: "carbs",   label: "Carbs",    unit: "g",    color: "bg-yellow-50 text-yellow-700" },
          { key: "fat",     label: "Fat",      unit: "g",    color: "bg-red-50 text-red-700"     },
        ].map(({ key, label, unit, color }) => (
          <div key={key} className={`${color} rounded-xl px-3 py-2`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-lg font-bold">
              {(macros[key as keyof MacroTotals]).toFixed(1)}
              <span className="text-xs font-normal ml-0.5">{unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecipeSummary({
  per100g,
  forServing,
  serving,
  onServingChange,
  totalRawWeight,
  cookedWeight,
}: Props) {
  const yieldPct = cookedWeight > 0 && totalRawWeight > 0
    ? ((cookedWeight / totalRawWeight) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">

      {/* Weight summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Weight summary
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total raw weight</span>
          <span className="font-semibold text-gray-800">{totalRawWeight.toFixed(0)} g</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cooked weight</span>
          <span className="font-semibold text-gray-800">
            {cookedWeight > 0 ? `${cookedWeight.toFixed(0)} g` : "—"}
          </span>
        </div>
        {yieldPct && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Yield</span>
            <span className={`font-semibold ${parseFloat(yieldPct) < 100 ? "text-amber-600" : "text-green-600"}`}>
              {yieldPct}%
            </span>
          </div>
        )}
      </div>

      {/* Per 100g */}
      {cookedWeight > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <MacroGrid macros={per100g} label="Per 100g (cooked)" />
        </div>
      )}

      {/* Custom serving */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Custom serving
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={serving}
              onChange={(e) => onServingChange(parseFloat(e.target.value) || 100)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-400">g</span>
          </div>
        </div>
        {forServing && cookedWeight > 0 && (
          <MacroGrid macros={forServing} label={`Per ${serving}g serving`} />
        )}
      </div>
    </div>
  );
}