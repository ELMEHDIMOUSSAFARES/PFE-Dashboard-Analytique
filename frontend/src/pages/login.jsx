import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState("");
  //
  const navigate = useNavigate();
  const loginApi = "http://127.0.0.1:8000/auth/login";
  //
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      setIsLogged(true);

      setTimeout(() => {
        navigate("/");
      }, 1800);
    }
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(loginApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      localStorage.removeItem("token");
      setError(data.detail || "Wrong credentials");
      return;
    }

    if (!data.access_token) {
      setError("Server error, try again");
      return;
    }

    localStorage.setItem("token", data.access_token);

    onLogin();
  };

  if (isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">
          You are already logged in, redirecting you to dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div
        className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br from-indigo-50 via-white to-indigo-100
    "
      >
        <div
          className="
        bg-white/80 backdrop-blur-xl
        rounded-3xl shadow-2xl p-10 w-full max-w-md
        border border-gray-100
      "
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div
              className="
            w-14 h-14 bg-indigo-600 rounded-2xl
            flex items-center justify-center
            shadow-lg shadow-indigo-200
          "
            >
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
            Welcome back
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            Sign in to your account
          </p>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                required
              />

              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Button & wrong credentials error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="
              w-full cursor-pointer bg-indigo-600 text-white rounded-xl py-3
              text-sm font-semibold
              hover:bg-indigo-700
              transition-all
            "
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
