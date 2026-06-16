import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { type User, type UserRole } from "../types/User";

/**
 * Register a new user.
 * Firebase Auth creates the credential, then we write the profile
 * to Firestore manually — Auth only stores email + password, nothing else.
 *
 * ≈ @PostMapping("/register") that calls both authRepo and userRepo
 */
export async function register(
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  brandId?: string,
  newBrandName?: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  let resolvedBrandId   = brandId;
  let resolvedBrandName: string | undefined;

  if (role === "brand" && newBrandName) {
    const { registerBrand } = await import("./brand.service");
    const brand = await registerBrand({ name: newBrandName.trim(), ownerId: uid });
    resolvedBrandId   = brand.id;
    resolvedBrandName = brand.name;
  } else if (role === "brand" && brandId) {
    // Joining an existing brand — fetch its name for denormalization
    const { getBrandById } = await import("./brand.service");
    const brand = await getBrandById(brandId);
    resolvedBrandName = brand?.name;
  }

  const userDoc: User = {
    uid,
    email,
    displayName,
    role,
    ...(resolvedBrandId   ? { brandId:   resolvedBrandId   } : {}),
    ...(resolvedBrandName ? { brandName: resolvedBrandName } : {}),
  };

  await setDoc(doc(db, "users", uid), userDoc);
}

/**
 * Login — Firebase validates credentials and returns a session automatically.
 * You don't manage tokens manually; Firebase SDK handles it in localStorage.
 *
 * ≈ Spring Security's authenticationManager.authenticate()
 */
export async function login(
  email: string,
  password: string
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logout — clears the Firebase session.
 * ≈ SecurityContextHolder.clearContext()
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Fetch the Firestore profile for the currently logged-in Firebase user.
 * ≈ userRepository.findById(SecurityContextHolder.getContext().uid)
 */
export async function getCurrentUserProfile(
  firebaseUser: FirebaseUser
): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", firebaseUser.uid));
  return snap.exists() ? (snap.data() as User) : null;
}

/**
 * Subscribe to auth state changes — fires whenever the user logs in or out.
 * Returns an unsubscribe function; call it on component unmount to avoid memory leaks.
 *
 * ≈ an ApplicationListener<AuthenticationSuccessEvent> but reactive
 */
export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}