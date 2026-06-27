import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import adminIcon from "@/assets/admin_icon.svg";
import userIcon from "@/assets/user_icon.svg";

const API_URL = "http://127.0.0.1:8000/auth";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "personnel",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    const response = await fetch(`${API_URL}/users`, { headers });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      setError("Impossible de charger les utilisateurs");
      return;
    }

    setUsers(await response.json());
  };

  useEffect(() => {
    const loadPage = async () => {
      const currentResponse = await fetch(`${API_URL}/me`, { headers });
      if (currentResponse.ok) {
        const currentUser = await currentResponse.json();
        setIsAdmin(currentUser.role === "admin");
        setCurrentUserEmail(currentUser.sub);
      }
      await fetchUsers();
    };

    loadPage();
  }, []);

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      password: "",
      role: "personnel",
    });
    setError("");
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.detail || "Impossible de créer l’utilisateur");
      return;
    }

    setMessage("Utilisateur créé avec succès");
    setIsModalOpen(false);
    resetForm();
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    setError("");
    setMessage("");

    const response = await fetch(`${API_URL}/users/${deletingUser.id}`, {
      method: "DELETE",
      headers,
    });
    const data = await response.json();
    setIsDeleting(false);
    setDeletingUser(null);

    if (!response.ok) {
      setError(data.detail || "Impossible de supprimer l’utilisateur");
      return;
    }

    setMessage("Utilisateur supprimé avec succès");
    fetchUsers();
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Utilisateurs</h1>
          <p className="text-sm text-gray-400">Gérer les comptes de l’équipe</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setMessage("");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 cursor-pointer"
          >
            <Plus size={16} />
            Ajouter un utilisateur
          </button>
        )}
      </div>

      {message && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && !isModalOpen && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-6 py-4">Utilisateur</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Rôle</th>
              <th className="px-6 py-4">Statut</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {users.map((user) => {
              const isCurrentUser = user.email === currentUserEmail;
              return (
                <tr key={user.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.role === "admin" ? adminIcon : userIcon}
                        className="h-10 w-10 rounded-xl object-cover"
                        alt={user.full_name}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-400">ID : #{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                      {user.role === "admin" ? "Administrateur" : "Personnel"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={isCurrentUser}
                        title={
                          isCurrentUser
                            ? "Votre compte ne peut pas être supprimé"
                            : "Supprimer l’utilisateur"
                        }
                        onClick={() => setDeletingUser(user)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Créer un utilisateur
                </h2>
                <p className="text-sm text-gray-400">
                  Ajouter un compte administrateur ou personnel
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 px-6 py-5">
              <label className="block text-sm font-medium text-gray-700">
                Nom complet
                <input
                  value={form.full_name}
                  onChange={(event) =>
                    updateForm("full_name", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  placeholder="Amina Benali"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  placeholder="amina@ecole.ma"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Mot de passe
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateForm("password", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Rôle
                <select
                  value={form.role}
                  onChange={(event) => updateForm("role", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                >
                  <option value="personnel">Personnel</option>
                  <option value="admin">Administrateur</option>
                </select>
              </label>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Supprimer l’utilisateur
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Confirmez-vous la suppression de{" "}
                  <span className="font-semibold text-gray-700">
                    {deletingUser.full_name}
                  </span>
                  ?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Cette action est définitive.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
