import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/auth";

export default function Settings() {
  const [profile, setProfile] = useState({ email: "", full_name: "" });
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [show, setShow] = useState({ old: false, next: false, confirm: false });
  const [loading, setLoading] = useState("");
  const [profileFeedback, setProfileFeedback] = useState({
    message: "",
    error: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState({
    message: "",
    error: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.status === 401 ? Promise.reject() : res.json()))
      .then((user) =>
        setProfile({ email: user.sub || "", full_name: user.full_name || "" }),
      )
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [token]);

  const updateProfile = async (event) => {
    event.preventDefault();
    setProfileFeedback({ message: "", error: "" });
    setLoading("profile");

    const res = await fetch(`${API_URL}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    setLoading("");

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    if (!res.ok) {
      setProfileFeedback({
        message: "",
        error: data.detail || "Impossible de modifier le profil",
      });
      return;
    }

    localStorage.setItem("token", data.access_token);
    setProfileFeedback({ message: "Profil modifie avec succes", error: "" });
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    setPasswordFeedback({ message: "", error: "" });

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordFeedback({
        message: "",
        error: "Les nouveaux mots de passe ne correspondent pas",
      });
      return;
    }

    setLoading("password");
    const res = await fetch(`${API_URL}/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      }),
    });
    const data = await res.json();
    setLoading("");

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    if (!res.ok) {
      setPasswordFeedback({
        message: "",
        error: data.detail || "Impossible de modifier le mot de passe",
      });
      return;
    }

    setPasswords({ old_password: "", new_password: "", confirm_password: "" });
    setPasswordFeedback({
      message: "Mot de passe modifie avec succes",
      error: "",
    });
  };

  const passwordField = (label, field, key) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-indigo-400 focus-within:bg-white">
        <input
          type={show[key] ? "text" : "password"}
          value={passwords[field]}
          onChange={(event) =>
            setPasswords({ ...passwords, [field]: event.target.value })
          }
          className="flex-1 bg-transparent text-sm outline-none"
          required
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [key]: !show[key] })}
          className="text-gray-400 hover:text-gray-700 cursor-pointer"
        >
          {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parametres</h1>
          <p className="text-sm text-gray-400">Gerer l'acces au compte</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <form
            onSubmit={updateProfile}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Modifier le profil
                </h2>
                <p className="text-sm text-gray-400">
                  Mettre a jour le nom complet et l'email
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Nom complet
                <input
                  value={profile.full_name}
                  onChange={(event) =>
                    setProfile({ ...profile, full_name: event.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile({ ...profile, email: event.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  required
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading === "profile"}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {loading === "profile" && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Mettre a jour
              </button>
            </div>

            {profileFeedback.message && (
              <p className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                {profileFeedback.message}
              </p>
            )}
            {profileFeedback.error && (
              <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileFeedback.error}
              </p>
            )}
          </form>

          <form
            onSubmit={updatePassword}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Modifier le mot de passe
                </h2>
                <p className="text-sm text-gray-400">
                  Saisissez le mot de passe actuel avant d'en definir un nouveau
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {passwordField("Mot de passe actuel", "old_password", "old")}
              {passwordField("Nouveau mot de passe", "new_password", "next")}
              {passwordField(
                "Confirmer le nouveau mot de passe",
                "confirm_password",
                "confirm",
              )}
            </div>

            {passwordFeedback.message && (
              <p className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                {passwordFeedback.message}
              </p>
            )}
            {passwordFeedback.error && (
              <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {passwordFeedback.error}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading === "password"}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {loading === "password" && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Mettre a jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
