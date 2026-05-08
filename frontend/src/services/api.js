import axios from "axios";
import { getAuth } from "firebase/auth";

// Base URL points to FastAPI backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

// Before every request, grab the Firebase token and attach it
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
