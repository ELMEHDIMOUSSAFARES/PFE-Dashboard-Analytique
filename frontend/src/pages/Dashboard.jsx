import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  Code2,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AcademicFilters from "@/components/AcademicFilters";
import StatCard from "@/components/StatCard";
import {
  API_URL,
  authHeaders,
  buildQuery,
  emptyFilters,
  formatCurrency,
  formatMonth,
} from "@/lib/kpi";

const SPECIALTY_COLORS = ["#2563eb", "#16a34a"];
const EMPTY_OPTIONS = {
  specialties: [],
  classes: [],
  modules: [],
  academic_months: [],
  date_range: { min: null, max: null },
};
const EMPTY_DASHBOARD = {
  summary: {
    students: 0,
    revenue: 0,
    expected_revenue: 0,
    collection_rate: 0,
    attendance_rate: 0,
    absences: 0,
    enrollments: 0,
    development_students: 0,
    finance_students: 0,
    students_at_risk: 0,
  },
  trends: { revenue: [], enrollments: [], attendance: [] },
  specialties: [],
  module_attendance: [],
  module_popularity: [],
  risk_students: [],
};

function ChartPanel({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-md ${className}`}
    >
      <div className="mb-6">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [filters, setFilters] = useState(emptyFilters);
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  const query = useMemo(() => buildQuery(filters), [filters]);

  useEffect(() => {
    const loadInitialData = async () => {
      const [userRes, filtersRes] = await Promise.all([
        fetch(`${API_URL}/auth/me`, { headers: authHeaders() }),
        fetch(`${API_URL}/kpi/filters`, { headers: authHeaders() }),
      ]);
      if (userRes.ok) setUser(await userRes.json());
      if (filtersRes.ok) setOptions(await filtersRes.json());
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const suffix = query ? `?${query}` : "";
      const response = await fetch(`${API_URL}/kpi/dashboard${suffix}`, {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (response.ok) setDashboard(await response.json());
      setLoading(false);
    };
    loadDashboard();
  }, [query]);

  const downloadReport = async (format) => {
    const suffix = query ? `&${query}` : "";
    const response = await fetch(
      `${API_URL}/kpi/export/dashboard?format=${format}${suffix}`,
      { headers: authHeaders() },
    );
    if (!response.ok) return;
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `racine-dashboard-report.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const summary = dashboard.summary;
  const revenueTrend = dashboard.trends.revenue.map((item) => ({
    ...item,
    label: formatMonth(item.month),
  }));
  const enrollmentTrend = dashboard.trends.enrollments.map((item) => ({
    ...item,
    label: formatMonth(item.month),
  }));
  const attendanceTrend = dashboard.trends.attendance.map((item) => ({
    ...item,
    label: formatMonth(item.month),
  }));
  const absenceModules = dashboard.module_attendance.slice(0, 7);
  const popularModules = dashboard.module_popularity.slice(0, 7);

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Tableau de bord Racine
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Pilotage des Techniciens Spécialisés, {user?.full_name || ""}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((current) => !current)}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm text-white shadow hover:bg-blue-600 cursor-pointer"
          >
            <Download size={16} />
            Télécharger le rapport
          </button>
          {exportOpen && (
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => downloadReport("pdf")}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <FileText size={16} />
                PDF
              </button>
              <button
                type="button"
                onClick={() => downloadReport("xlsx")}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <AcademicFilters
        filters={filters}
        setFilters={setFilters}
        options={options}
      />

      {loading && (
        <p className="text-sm text-gray-400">
          Actualisation du tableau de bord...
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total des stagiaires"
          value={summary.students}
          icon={Users}
          color="bg-indigo-500"
        />
        <StatCard
          label="Recettes encaissées"
          value={formatCurrency(summary.revenue)}
          icon={WalletCards}
          color="bg-green-500"
        />
        <StatCard
          label="Taux de présence"
          value={`${summary.attendance_rate}%`}
          icon={UserCheck}
          color="bg-emerald-500"
        />
        <StatCard
          label="Total des absences"
          value={summary.absences}
          icon={UserX}
          color="bg-red-500"
        />
        <StatCard
          label="Inscriptions annuelles"
          value={summary.enrollments}
          icon={ClipboardList}
          color="bg-blue-500"
        />
        <StatCard
          label="Développement Informatique"
          value={summary.development_students}
          icon={Code2}
          color="bg-sky-500"
        />
        <StatCard
          label="Financier Comptable"
          value={summary.finance_students}
          icon={BriefcaseBusiness}
          color="bg-teal-500"
        />
        <StatCard
          label="Encaissé / attendu"
          value={`${summary.collection_rate}%`}
          icon={WalletCards}
          color="bg-amber-500"
        />
        <StatCard
          label="Stagiaires à risque"
          value={summary.students_at_risk}
          icon={ShieldAlert}
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Évolution mensuelle des encaissements"
          subtitle="Comparaison des montants encaissés et attendus"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="racineRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="expected_revenue"
                name="Recettes attendues"
                stroke="#94a3b8"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Recettes encaissées"
                stroke="#16a34a"
                fill="url(#racineRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Échéances réglées par mois"
          subtitle="Une valeur supérieure à l’effectif indique des régularisations d’arriérés"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="paid_installments"
                name="Échéances réglées"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="expected_installments"
                name="Échéances attendues"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Évolution du taux de présence"
          subtitle="Taux mensuel calculé au niveau des modules"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attendance_rate"
                name="Taux de présence"
                stroke="#7c3aed"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Répartition des stagiaires par filière"
          subtitle="Comparaison des deux filières Technicien Spécialisé"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dashboard.specialties}
                dataKey="students"
                name="Nombre de stagiaires"
                nameKey="specialty"
                innerRadius={60}
                outerRadius={95}
              >
                {dashboard.specialties.map((item, index) => (
                  <Cell key={item.specialty} fill={SPECIALTY_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Encaissements par filière"
          subtitle="Montants versés par les stagiaires de chaque filière"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.specialties}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="specialty"
                tickFormatter={(value) =>
                  value.startsWith("Développement") ? "DI" : "FC"
                }
              />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar
                dataKey="revenue"
                name="Recettes encaissées"
                fill="#0f766e"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Comparaison de la présence"
          subtitle="Taux de présence entre les deux filières"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.specialties}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="specialty"
                tickFormatter={(value) =>
                  value.startsWith("Développement") ? "DI" : "FC"
                }
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar
                dataKey="attendance_rate"
                name="Taux de présence"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Modules avec le plus d’absences"
          subtitle="Modules nécessitant un suivi pédagogique"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={absenceModules}
              layout="vertical"
              margin={{ left: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="module"
                width={145}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="absences" fill="#ef4444" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Modules les plus suivis"
          subtitle="Nombre de stagiaires inscrits dans chaque module"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={popularModules}
              layout="vertical"
              margin={{ left: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="module"
                width={145}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar
                dataKey="students"
                name="Nombre de stagiaires"
                fill="#2563eb"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-md">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <BookOpen size={20} className="text-indigo-600" />
          <div>
            <h2 className="font-semibold text-gray-800">
              Stagiaires nécessitant une intervention
            </h2>
            <p className="text-sm text-gray-400">
              Au moins trois absences et un taux d’absence de 20 %
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400">
                <th className="px-6 py-3">Stagiaire</th>
                <th className="px-6 py-3">Filière</th>
                <th className="px-6 py-3">Classe</th>
                <th className="px-6 py-3">Absences</th>
                <th className="px-6 py-3">Taux d’absence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashboard.risk_students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-500">
                    Aucun stagiaire à risque pour les filtres sélectionnés.
                  </td>
                </tr>
              )}
              {dashboard.risk_students.slice(0, 10).map((student) => (
                <tr key={student.student_id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {student.student}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {student.specialty}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {student.class_name}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">
                    {student.absences}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {student.absence_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
