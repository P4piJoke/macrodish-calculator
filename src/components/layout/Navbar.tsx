import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { firebaseUser, userProfile, handleLogout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await handleLogout();
    navigate("/");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">

      {/* Left — logo */}
      <Link to="/" className="text-green-600 font-bold text-xl tracking-tight">
        🥗 MacroDish
      </Link>

      {/* Center — nav links */}
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

      {/* Right — auth button */}
      <div className="text-sm">
        {firebaseUser ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-500 hidden sm:block">
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
  );
}