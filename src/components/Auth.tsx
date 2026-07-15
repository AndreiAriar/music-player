import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signUp, logIn, logInWithGoogle } from "../firebase/auth";
import { setSigningUp } from "../firebase/authState";
import VinylLogo from "./VinylLogo";

export default function Auth() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log("handleSubmit fired, isSignUp:", isSignUp);
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error("Please enter your name");
        setSigningUp(true);
        console.log("signingUp flag set true, calling signUp()");
        await signUp(name.trim(), email, password);
        console.log("signUp() finished");
        setIsSignUp(false);
        setPassword("");
        setSuccess("Account created! Please log in.");
      } else {
        await logIn(email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setSigningUp(false);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await logInWithGoogle();
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 text-amber-50 flex items-center justify-center p-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-stone-950/80 flex flex-col items-center justify-center gap-3 z-10">
          <div style={{ animation: "spin 1.2s linear infinite" }}>
            <VinylLogo size={40} />
          </div>
          <p className="text-xs font-mono text-amber-500/60">
            {isSignUp ? "Creating your account..." : "Logging in..."}
          </p>
        </div>
      )}

      <div className="w-full max-w-sm bg-stone-900/60 border border-stone-800 rounded-2xl p-8 flex flex-col items-center gap-4">
        <VinylLogo size={48} />
        <h1 className="font-serif text-2xl">Music</h1>
        <p className="text-xs font-mono text-amber-500/60 -mt-2">
          {isSignUp ? "Create an account" : "Log in to continue"}
        </p>

        {isSignUp && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-full px-4 py-2 text-sm outline-none"
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-full px-4 py-2 text-sm outline-none"
        />

        <div className="relative w-full">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-full px-4 py-2 pr-10 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/50 hover:text-amber-400"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        {success && <p className="text-xs text-green-400 text-center">{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-colors py-2 rounded-full text-sm font-mono text-stone-950"
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </button>

        <div className="flex items-center gap-2 w-full text-amber-500/40 text-xs">
          <div className="flex-1 h-px bg-stone-800" />
          or
          <div className="flex-1 h-px bg-stone-800" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full border border-amber-800/50 hover:border-amber-500 hover:bg-amber-500/10 transition-colors py-2 rounded-full text-sm font-mono text-amber-200"
        >
          Continue with Google
        </button>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setSuccess("");
          }}
          className="text-xs font-mono text-amber-500/60 hover:text-amber-400 mt-2"
        >
          {isSignUp ? "Have an account? Log in" : "New here? Sign up"}
        </button>
      </div>
    </div>
  );
}