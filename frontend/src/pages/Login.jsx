// pages/Login.jsx
// Login and sign up page.
// Only allows @umd.edu emails.

import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();

  // Toggle between login and signup
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, go to home page
  if (firebaseUser) return <Navigate to="/" replace />;

  // Turn Firebase error codes into readable messages
  function getErrorMessage(code) {
    if (code === "auth/user-not-found")
      return "No account found with that email.";
    if (code === "auth/wrong-password") return "Incorrect password.";
    if (code === "auth/email-already-in-use")
      return "An account with this email already exists.";
    if (code === "auth/weak-password")
      return "Password must be at least 6 characters.";
    if (code === "auth/invalid-credential")
      return "Incorrect email or password.";
    return "Something went wrong. Please try again.";
  }

  async function handleSubmit() {
    setError("");

    // Check for umd.edu email
    if (!email.endsWith("@umd.edu")) {
      setError("Only @umd.edu Terpmail addresses are allowed.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-box">
      <h1>🐢 Shell Mates</h1>

      {/* Toggle between Login and Sign Up */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={mode === "login" ? "btn-primary" : "btn-secondary"}
          style={{ flex: 1 }}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setError("");
          }}
          className={mode === "signup" ? "btn-primary" : "btn-secondary"}
          style={{ flex: 1 }}
        >
          Sign Up
        </button>
      </div>

      {/* Email input */}
      <input
        type="email"
        placeholder="username@umd.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Password input */}
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Error message */}
      {error && <p className="error-msg">{error}</p>}

      {/* Submit button */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading
          ? "Please wait..."
          : mode === "login"
            ? "Sign In"
            : "Create Account"}
      </button>

      {/* Switch mode */}
      <div className="toggle-text">
        {mode === "login" ? (
          <p>
            No account?{" "}
            <span onClick={() => setMode("signup")}>Sign up here</span>
          </p>
        ) : (
          <p>
            Have an account?{" "}
            <span onClick={() => setMode("login")}>Sign in here</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
