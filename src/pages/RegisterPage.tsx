import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllBrands, registerBrand } from "../services/brand.service";
import { type Brand } from "../types/Brand";
import { type UserRole } from "../types/User";

export default function RegisterPage() {
  const { handleRegister, pending, error, firebaseUser } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("regular");

  // Brand fields — only relevant when role === "brand"
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [newBrandName, setNewBrandName] = useState("");
  const [brandMode, setBrandMode] = useState<"existing" | "new">("existing");
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (firebaseUser) navigate("/");
  }, [firebaseUser, navigate]);

  // Fetch existing brands when user switches to brand role
  useEffect(() => {
    if (role !== "brand") return;
    setLoadingBrands(true);
    getAllBrands()
      .then(setBrands)
      .finally(() => setLoadingBrands(false));
  }, [role]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const brandId = role === "brand" && brandMode === "existing" ? selectedBrandId : undefined;
    const newBrandNm = role === "brand" && brandMode === "new" ? newBrandName : undefined;

    await handleRegister(email, password, displayName, role, brandId, newBrandNm);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        <h1 className="text-3xl font-bold text-gray-800 mb-1">Create account</h1>
        <p className="text-gray-500 mb-6 text-sm">Join MacroDish and start tracking</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["regular", "brand"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${role === r
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                    }`}
                >
                  {r === "regular" ? "👤 Regular user" : "🏢 Brand user"}
                </button>
              ))}
            </div>
          </div>

          {/* Brand fields — only shown when role === "brand" */}
          {role === "brand" && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Brand details
              </p>

              {/* Existing vs new brand toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(["existing", "new"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBrandMode(mode)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${brandMode === mode
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                      }`}
                  >
                    {mode === "existing" ? "Join existing brand" : "Create new brand"}
                  </button>
                ))}
              </div>

              {brandMode === "existing" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select brand
                  </label>
                  {loadingBrands ? (
                    <p className="text-sm text-gray-400">Loading brands...</p>
                  ) : (
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">— Select a brand —</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New brand name
                  </label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Silpo, Fora, Metro"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}