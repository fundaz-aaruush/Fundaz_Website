import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  loading: true,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  completeGoogleProfile: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // When signup() already wrote the Firestore doc and set the user directly,
  // skip the redundant fetch in the onAuthStateChanged callback.
  const skipNextFetchRef = useRef(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If signup() already set the user with fresh Firestore data, skip re-fetching
        if (skipNextFetchRef.current) {
          skipNextFetchRef.current = false;
          setLoading(false);
          return;
        }
        try {
          // Fetch extra profile data from Firestore
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUser({ ...firebaseUser, ...docSnap.data(), isGuest: false, needsProfile: false });
          } else {
            // No doc — first-time Google sign-in, needs profile completion
            setUser({ ...firebaseUser, isGuest: false, needsProfile: true });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          const isPermissionError = error?.code === "permission-denied";
          const isOffline =
            error?.code === "unavailable" ||
            (error?.message || "").toLowerCase().includes("offline") ||
            (error?.message || "").toLowerCase().includes("failed to get document");

          if (isPermissionError) {
            // Genuinely not allowed — sign out
            await signOut(auth);
            setUser(null);
          } else if (isOffline) {
            // Network issue — keep the user logged in with basic Auth data
            // They can still navigate; Firestore data will sync when back online
            setUser({ ...firebaseUser, isGuest: false, needsProfile: false });
          } else {
            // Unknown error — sign out to be safe
            await signOut(auth);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = useCallback(async (userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const { password, confirmPassword, ...profileData } = userData;
    
    const fullProfile = { ...profileData, createdAt: new Date().toISOString() };
    await setDoc(doc(db, "users", userCredential.user.uid), fullProfile);
    
    // Set user directly — doc is guaranteed written.
    // Tell the onAuthStateChanged listener to skip its own Firestore fetch
    // since we already have fresh data and the user is set.
    skipNextFetchRef.current = true;
    setUser({
      ...userCredential.user,
      ...fullProfile,
      isGuest: false,
      needsProfile: false,
    });
    
    return userCredential.user;
  }, []);

  const login = useCallback(async (credentials) => {
    // Note: Since Firebase Auth uses email, users must enter their email as identifier.
    const userCredential = await signInWithEmailAndPassword(auth, credentials.identifier, credentials.password);
    return userCredential.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }, []);

  const completeGoogleProfile = useCallback(async (additionalData) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      ...additionalData,
      createdAt: new Date().toISOString(),
    });
    
    // Update local state to reflect complete profile
    setUser((prev) => ({ ...prev, ...additionalData, needsProfile: false }));
  }, []);



  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest: user?.isGuest === true,
        loading,
        signup,
        login,
        loginWithGoogle,
        completeGoogleProfile,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
