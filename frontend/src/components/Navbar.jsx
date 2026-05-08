// components/Navbar.jsx
// Top navigation bar shown on every page.

import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { firebaseUser } = useAuth();

  function handleSignOut() {
    signOut(auth);
  }

  return (
    <nav>
      <h1 className="logo">🐢 Shell Mates</h1>

      <ul className="nav-links">
        {firebaseUser ? (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/events">Events</Link>
            </li>
            <li>
              <Link to="/create">Create Event</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button
                onClick={handleSignOut}
                style={{
                  background: "none",
                  border: "1px solid white",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
