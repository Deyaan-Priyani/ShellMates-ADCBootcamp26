import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5b4dZIPfiSSdI-WnIcGQygYQFiuyeZio",
  authDomain: "shell-mates.firebaseapp.com",
  projectId: "shell-mates",
  storageBucket: "shell-mates.firebasestorage.app",
  messagingSenderId: "495650527924",
  appId: "1:495650527924:web:6d33376bdf1b9ed7fbd5e1",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
