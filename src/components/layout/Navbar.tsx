import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const TABS = [
  { path: "/",           label: "Home",       icon: "🏠" },
  { path: "/builder",    label: "Builder",    icon: "🥗" },
  { path: "/my-recipes", label: "My Recipes", icon: "📋" },
  { path: "/products",   label: "Products",   icon: "🔍" },
];

export default function Navbar() {
  const { firebaseUser, userProfile, handleLogout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  async function onLogout() {
    await handleLogout();
    navigate("/");
  }

  return (
    <>
      {/* ── Desktop top bar (md+) ─────────────────────────────────────── */}
      <nav className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-green-600 font-bold text-xl tracking-tight">
          🥗 MacroDish
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/products" className="hover:text-green-600 transition-colors">
            Products
          </Link>
          <Link to="/recipes" className="hover:text-green-600 transition-colors">
            Public Recipes
          </Link>
          {firebaseUser && (
            <>
              <Link to="/my-recipes" className="hover:text-green-600 transition-colors">
                My Recipes
              </Link>
              <Link to="/builder" className="hover:text-green-600 transition-colors">
                Builder
              </Link>
            </>
          )}
          {userProfile?.role === "brand" && (
            <Link to="/brand-dashboard" className="hover:text-green-600 transition-colors">
              {userProfile.brandName ?? "Brand"} Dashboard
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="text-sm">
          {firebaseUser ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-500 hidden lg:block">
                {userProfile?.displayName ?? firebaseUser.email}
              </span>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile top bar (below md) ─────────────────────────────────── */}
      <nav className="flex md:hidden bg-white border-b border-gray-200 px-4 py-3 items-center justify-between">
        <Link to="/" className="text-green-600 font-bold text-lg tracking-tight">
          🥗 MacroDish
        </Link>
        <div className="flex items-center gap-2">
          {firebaseUser ? (
            <button
              onClick={onLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 font-medium text-sm transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom tab bar (below md) ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 flex">
        {TABS.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                active ? "text-green-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}