// App.jsx
// Sets up all the routes for the app.
// AuthProvider wraps everything so useAuth() works on every page.

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventCreate from "./pages/EventCreate";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      {/* Navbar shows on every page */}
      <Navbar />

      <Routes>
        {/* Anyone can see the login page */}
        <Route path="/login" element={<Login />} />

        {/* These pages require login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <EventCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Any unknown URL goes to landing */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
