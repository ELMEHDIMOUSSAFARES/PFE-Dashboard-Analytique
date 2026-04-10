import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
    // Ici tu peux ajouter :
    // - Appel API
    // - Gestion des erreurs
    // - Redirection
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-center min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`p-8 w-full max-w-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } rounded-2xl shadow-lg ${
          theme === "dark" ? "shadow-gray-900" : "shadow-gray-300"
        }`}
      >
        <h2 className="mb-6 text-2xl font-bold text-center">Welcome Back</h2>

        {/* Formulaire avec gestion d'état */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ Email */}
          <div className="relative">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email@example.com"
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            {/* Icône de validation */}
            {formData.email && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
              >
                ✅
              </motion.div>
            )}
          </div>

          {/* Champ Password */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              minLength={8}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            {/* Icône pour montrer/masquer le mot de passe */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            Sign In
          </button>
        </form>

        {/* Lien pour mot de passe oublié */}
        <div className="mt-4 text-center">
          <a
            href="#"
            className={`text-sm underline ${
              theme === "dark" ? "text-blue-400" : "text-gray-600"
            }`}
          >
            Forgot password?
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}