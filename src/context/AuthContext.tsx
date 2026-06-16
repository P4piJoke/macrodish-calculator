import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "../types/User";
import { subscribeToAuthState, getCurrentUserProfile } from "../services/auth.service";

/**
 * The shape of what the context exposes to the rest of the app.
 * ≈ a SecurityContext interface in Spring — defines the contract.
 */
interface AuthContextType {
  firebaseUser: FirebaseUser | null; // raw Firebase Auth user (has uid, email)
  userProfile: User | null;         // our Firestore profile (has role, brandId, etc.)
  loading: boolean;             // true while we're waiting for Firebase to respond
}

/**
 * The actual context object.
 * ≈ the ApplicationContext bean container — created once, shared everywhere.
 */
const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
});

/**
 * Provider — wraps the whole app and keeps auth state in sync.
 * ≈ a @Configuration class that initialises SecurityContextHolder on startup
 * and updates it whenever a login/logout event fires.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * subscribeToAuthState fires immediately with the current user on mount,
     * then again on every login/logout.
     * ≈ an ApplicationListener that reacts to AuthenticationSuccessEvent
     * and LogoutSuccessEvent automatically.
     */
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        /**
         * Retry loop — gives Firestore time to finish writing the user doc
         * that was just created during registration.
         * ≈ a @Retryable(maxAttempts=5) in Spring Retry,
         * with a fixed 500ms backoff between attempts.
         */
        let profile = null;
        let attempts = 0;

        while (!profile && attempts < 5) {
          profile = await getCurrentUserProfile(fbUser);
          if (!profile) {
            await new Promise((res) => setTimeout(res, 500));
          }
          attempts++;
        }

        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup on unmount — ≈ removing an event listener in Java
    return () => unsubscribe();
  }, []); // empty array = run once on mount, ≈ @PostConstruct

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook — the way any component "reads" from the SecurityContextHolder.
 * ≈ SecurityContextHolder.getContext().getAuthentication()
 * but as a one-liner: const { userProfile } = useAuth();
 */
export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}