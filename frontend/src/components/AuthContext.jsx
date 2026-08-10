import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ── Profile cache helpers ──────────────────────────────────────────────────
const CACHE_KEY = "fundaz_profile";
const saveProfileCache = (uid, data) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ uid, ...data })); } catch {}
};
const loadProfileCache = (uid) => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.uid === uid ? parsed : null;   // only use if UID matches
  } catch { return null; }
};
const clearProfileCache = () => {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
};
// ──────────────────────────────────────────────────────────────────────────

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
  const skipNextFetchRef = useRef(false);
  const isNewGoogleUserRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Email signup already set user + wrote Firestore doc — skip re-fetch
        if (skipNextFetchRef.current) {
          skipNextFetchRef.current = false;
          setLoading(false);
          return;
        }

        // Brand-new Google user — go straight to profile form (no Firestore needed)
        if (isNewGoogleUserRef.current) {
          isNewGoogleUserRef.current = false;
          setUser({ ...firebaseUser, isGuest: false, needsProfile: true });
          setLoading(false);
          return;
        }

        // ── FAST PATH: load from cache immediately (zero network wait) ──
        const cached = loadProfileCache(firebaseUser.uid);
        if (cached) {
          const { uid: _uid, ...profileData } = cached;
          setUser({ ...firebaseUser, ...profileData, isGuest: false, needsProfile: false });
          setLoading(false);
          // Silently refresh from Firestore in background (no spinner shown)
          getDoc(doc(db, "users", firebaseUser.uid))
            .then((snap) => {
              if (snap.exists()) {
                const fresh = snap.data();
                saveProfileCache(firebaseUser.uid, fresh);
                setUser((prev) => ({ ...prev, ...fresh }));
              }
            })
            .catch(() => {}); // ignore background refresh errors
          return;
        }

        // ── SLOW PATH: no cache — fetch from Firestore (first visit) ──
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const profileData = docSnap.data();
            saveProfileCache(firebaseUser.uid, profileData);
            setUser({ ...firebaseUser, ...profileData, isGuest: false, needsProfile: false });
          } else {
            // No doc — needs profile completion
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
            await signOut(auth);
            setUser(null);
          } else if (isOffline) {
            setUser({ ...firebaseUser, isGuest: false, needsProfile: false });
          } else {
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

    saveProfileCache(userCredential.user.uid, fullProfile);
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
    const userCredential = await signInWithEmailAndPassword(auth, credentials.identifier, credentials.password);
    return userCredential.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const info = getAdditionalUserInfo(result);
    if (info?.isNewUser) {
      isNewGoogleUserRef.current = true;
    }
    return result.user;
  }, []);

  const completeGoogleProfile = useCallback(async (additionalData) => {
    if (!auth.currentUser) throw new Error("No authenticated user");

    const profileData = { ...additionalData, createdAt: new Date().toISOString() };
    await setDoc(doc(db, "users", auth.currentUser.uid), profileData);

    saveProfileCache(auth.currentUser.uid, profileData);
    setUser((prev) => ({ ...prev, ...profileData, needsProfile: false }));
  }, []);

  const logout = useCallback(async () => {
    clearProfileCache();
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
      {children}
    </AuthContext.Provider>
  );
};

