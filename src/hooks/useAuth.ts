import { useState } from "react";
import { useAuth as useAuthContext } from "../context/AuthContext";
import { login, logout, register } from "../services/auth.service";
import { type UserRole } from "../types/User";

/**
 * ≈ a @Service that wraps your @Repository calls and adds
 * loading/error state management on top.
 */
export function useAuth() {
  const { firebaseUser, userProfile, loading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleLogin(email: string, password: string) {
    setError(null);
    setPending(true);
    try {
      await login(email, password);
    } catch (e: unknown) {
      setError(toMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  async function handleRegister(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    brandId?: string,
    newBrandName?: string,
  ) {
    setError(null);
    setPending(true);
    try {
      await register(email, password, displayName, role, brandId, newBrandName);
    } catch (e: unknown) {
      setError(toMessage(e));
    } finally {
      setPending(false);
    }
  }

  return {
    firebaseUser,
    userProfile,
    loading,
    pending,
    error,
    handleLogin,
    handleLogout,
    handleRegister,
  };
}

function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "An unexpected error occurred.";
}