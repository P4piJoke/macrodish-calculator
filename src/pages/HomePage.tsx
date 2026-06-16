import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/layout/PageWrapper";

export default function HomePage() {
  const { firebaseUser } = useAuth();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center text-center py-24 gap-6">

        <span className="text-6xl">🥗</span>

        <h1 className="text-5xl font-extrabold text-gray-800 leading-tight">
          Know exactly what<br />you're eating
        </h1>

        <p className="text-gray-500 text-lg max-w-md">
          MacroDish calculates precise macronutrients for cooked recipes —
          accounting for moisture loss that standard nutrition apps ignore.
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Link
            to="/builder"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Start a recipe →
          </Link>
          <Link
            to="/recipes"
            className="bg-white border border-gray-300 hover:border-green-400 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Browse public recipes
          </Link>
        </div>

        {!firebaseUser && (
          <p className="text-sm text-gray-400 mt-2">
            <Link to="/register" className="text-green-600 hover:underline font-medium">
              Create a free account
            </Link>{" "}
            to save your recipes and access them anywhere.
          </p>
        )}

      </div>
    </PageWrapper>
  );
}