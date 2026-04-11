import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin }) { // ✅ مهم
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    onLogin();        // 🔥 كتشعل auth
    navigate("/");    // 🔥 تمشي للدashboard
  };

  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br from-indigo-50 via-white to-indigo-100
    ">

      <div className="
        bg-white/80 backdrop-blur-xl
        rounded-3xl shadow-2xl p-10 w-full max-w-md
        border border-gray-100
      ">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="
            w-14 h-14 bg-indigo-600 rounded-2xl
            flex items-center justify-center
            shadow-lg shadow-indigo-200
          ">
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
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <Lock size={18} className="text-gray-400" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="flex-1 bg-transparent text-sm outline-none"
            />

            <button onClick={() => setShowPass(!showPass)}>
              {showPass
                ? <EyeOff size={18} />
                : <Eye size={18} />
              }
            </button>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin} // ✅ هنا الحل
            className="
              w-full bg-indigo-600 text-white rounded-xl py-3
              text-sm font-semibold
              hover:bg-indigo-700
              transition-all
            "
          >
            Sign In
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <span className="text-indigo-600 font-medium cursor-pointer">
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}