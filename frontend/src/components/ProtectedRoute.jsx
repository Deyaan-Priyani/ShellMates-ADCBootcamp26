// components/ProtectedRoute.jsx
// If the user is not logged in, send them to the login page.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { firebaseUser } = useAuth();

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;