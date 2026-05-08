// context/AuthContext.jsx
// Provides the logged-in user to every component.
// Any component can call useAuth() to get the current user.

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // firebaseUser = the Firebase user object (has .email, .uid)
  const [firebaseUser, setFirebaseUser] = useState(null);

  // profile = the user doc from MongoDB (has rank, events, etc.)
  const [profile, setProfile] = useState(null);

  // loading = true until Firebase tells us if someone is logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for sign in / sign out
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // User is signed in, get their Shell Mates profile from backend
        try {
          const res = await api.get("/auth/me");
          setProfile(res.data);
        } catch {
          setProfile(null);
        }
      } else {
        // User signed out
        setProfile(null);
      }

      setLoading(false);
    });

    // Stop listening when component unmounts
    return unsubscribe;
  }, []);

  // refreshProfile lets pages re-fetch the profile after changes
  async function refreshProfile() {
    try {
      const res = await api.get("/auth/me");
      setProfile(res.data);
    } catch {
      // silently fail
    }
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, refreshProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
