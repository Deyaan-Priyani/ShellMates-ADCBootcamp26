import { useState } from "react"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function handleGoogleLogin() {
        setError("")
        const provider = new GoogleAuthProvider()

        try {
            // Opens a popup for the user to sign in with their Google account
            const result = await signInWithPopup(auth, provider)
            const email = result.user.email

            // Email check to filter out non-UMD emails
            if (!email.endsWith("@umd.edu") && !email.endsWith("@terpmail.umd.edu")) {
                await auth.signOut()
                setError("You must use a UMD email to sign in.")
                return
            }

            // Back to landing after signing in
            navigate("/")
        } catch (err) {
            console.error("Login error:", err)
            setError("Sign-in failed. Please try again.")
        }
    }

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Welcome to ShellMates</h1>
            <p>Sign in with your UMD Google account to continue.</p>
            <button onClick={handleGoogleLogin}>
                Sign in with Google
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )
}