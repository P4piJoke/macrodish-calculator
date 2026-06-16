import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RecipeBuilderPage from "../pages/RecipeBuilderPage";
import MyRecipesPage from "../pages/MyRecipesPage";
import PublicRecipesPage from "../pages/PublicRecipesPage";
import ProductDictionaryPage from "../pages/ProductDictionaryPage";
import BrandDashboardPage from "../pages/BrandDashboardPage";

/**
 * Wraps any route that requires authentication.
 * ≈ Spring Security's antMatchers("/protected/**").authenticated()
 *
 * If loading — wait silently (Firebase is still checking session).
 * If no user  — redirect to /login.
 * If user     — render the page normally.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Brand-only route — same as ProtectedRoute but also checks role.
 * ≈ antMatchers("/brand/**").hasRole("BRAND")
 */
function BrandRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (userProfile?.role !== "brand") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — ≈ permitAll() */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductDictionaryPage />} />
        <Route path="/recipes" element={<PublicRecipesPage />} />

        {/* Protected routes — ≈ authenticated() */}
        <Route path="/my-recipes" element={
          <ProtectedRoute><MyRecipesPage /></ProtectedRoute>
        } />
        <Route path="/builder" element={
          <ProtectedRoute><RecipeBuilderPage /></ProtectedRoute>
        } />

        {/* Brand-only routes — ≈ hasRole("BRAND") */}
        <Route path="/brand-dashboard" element={
          <BrandRoute><BrandDashboardPage /></BrandRoute>
        } />

        {/* Catch-all — ≈ a 404 handler */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}