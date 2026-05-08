import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Landing from "./pages/Landing"
import Events from "./pages/Events"
import EventCreate from "./pages/EventCreate"
import EventDetails from "./pages/EventDetails"
import Profile from "./pages/Profile"
import Login from "./pages/Login"

// makes pages inaccessible until login 
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/create" element={<PrivateRoute><EventCreate /></PrivateRoute>} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App