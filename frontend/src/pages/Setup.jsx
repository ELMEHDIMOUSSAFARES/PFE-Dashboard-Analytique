import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import schoolIcon from "@/assets/Ecole-Logo.webp";

export default function Setup({ onSetupComplete }) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSetup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/auth/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || "Configuration impossible");
      return;
    }

    onSetupComplete();
    navigate("/login", { replace: true });
  };

  return (
    <form onSubmit={handleSetup} className="space-y-4">
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
          <div className="flex justify-center mb-8">
            <div
              className="
            w-14 h-14 rounded-2xl
            flex items-center justify-center
            shadow-lg shadow-purple-100
          "
            >
              <img
                src={schoolIcon}
                alt="Ecole Racine"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 text-center mb-1 select-none">
            Configuration
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8 select-none">
            Créez le premier compte administrateur pour commencer à utiliser
            l'application.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                required
              />

              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

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
              Créez le compte admin
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
