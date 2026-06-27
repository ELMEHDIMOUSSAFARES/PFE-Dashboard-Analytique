import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  AlertTriangle,
  Brain,
  GraduationCap,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AcademicFilters from "@/components/AcademicFilters";
import {
  API_URL,
  authHeaders,
  buildQuery,
  emptyFilters,
  formatCurrency,
  formatMonth,
} from "@/lib/kpi";

const EMPTY_OPTIONS = {
  specialties: [],
  classes: [],
  modules: [],
  academic_months: [],
  date_range: { min: null, max: null },
};
const EMPTY_ANALYTICS = {
  specialty_comparison: [],
  module_attendance: [],
  revenue_performance: [],
  enrollment_evolution: [],
  risk_students: [],
  ai: {
    prediction: { method: "", reason: "", next_months: [] },
    anomalies: { method: "", reason: "", items: [] },
    risk: { method: "", reason: "", students: [] },
    segmentation: { method: "", reason: "", students: [] },
  },
};

function Panel({ title, subtitle, children, className = "" }) {
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

export default function Analytics() {
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [filters, setFilters] = useState(emptyFilters);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const query = useMemo(() => buildQuery(filters), [filters]);

  useEffect(() => {
    const loadFilters = async () => {
      const response = await fetch(`${API_URL}/kpi/filters`, {
        headers: authHeaders(),
      });
      if (response.ok) setOptions(await response.json());
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      const suffix = query ? `?${query}` : "";
      const response = await fetch(`${API_URL}/kpi/analytics${suffix}`, {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (response.ok) setAnalytics(await response.json());
      setLoading(false);
    };
    loadAnalytics();
  }, [query]);

  const revenuePerformance = analytics.revenue_performance.map((item) => ({
    ...item,
    label: formatMonth(item.month),
  }));
  const enrollmentEvolution = analytics.enrollment_evolution.map((item) => ({
    ...item,
    label: formatMonth(item.month),
  }));
  const predictionData = [
    ...revenuePerformance.map((item) => ({
      label: item.label,
      actual: item.revenue,
      predicted: null,
    })),
    ...analytics.ai.prediction.next_months.map((item) => ({
      label: formatMonth(item.month),
      actual: null,
      predicted: item.predicted_revenue,
    })),
  ];
  const problematicModules = analytics.module_attendance.slice(0, 10);
  const segmentCounts = analytics.ai.segmentation.students.reduce(
    (counts, student) => {
      counts[student.segment] = (counts[student.segment] || 0) + 1;
      return counts;
    },
    {},
  );
  const segmentData = Object.entries(segmentCounts).map(
    ([segment, students]) => ({
      segment,
      students,
    }),
  );

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analyses Racine</h1>
        <p className="mt-1 text-sm text-gray-400">
          Comparaison des filières, diagnostic des modules, performance
          financière et risques stagiaires
        </p>
      </div>

      <AcademicFilters
        filters={filters}
        setFilters={setFilters}
        options={options}
      />

      {loading && (
        <p className="text-sm text-gray-400">Actualisation des analyses...</p>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Comparaison des filières
          </h2>
          <p className="text-sm text-gray-400">
            Comparaison destinée à la direction entre Développement Informatique
            et Financier Comptable
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel
            title="Stagiaires et encaissements"
            subtitle="Comparaison des effectifs et des montants encaissés"
          >
            <ResponsiveContainer width="100%" height={310}>
              <ComposedChart data={analytics.specialty_comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="specialty"
                  tickFormatter={(value) =>
                    value.startsWith("Développement") ? "DI" : "FC"
                  }
                />
                <YAxis yAxisId="students" allowDecimals={false} />
                <YAxis yAxisId="revenue" orientation="right" />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue" ? formatCurrency(value) : value
                  }
                />
                <Legend />
                <Bar
                  yAxisId="students"
                  dataKey="students"
                  name="Nombre de stagiaires"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="revenue"
                  dataKey="revenue"
                  name="Recettes encaissées"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Panel>

          <Panel
            title="Présence et absences"
            subtitle="Qualité de la participation par filière"
          >
            <ResponsiveContainer width="100%" height={310}>
              <ComposedChart data={analytics.specialty_comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="specialty"
                  tickFormatter={(value) =>
                    value.startsWith("Développement") ? "DI" : "FC"
                  }
                />
                <YAxis yAxisId="rate" domain={[0, 100]} />
                <YAxis
                  yAxisId="absences"
                  orientation="right"
                  allowDecimals={false}
                />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="rate"
                  dataKey="attendance_rate"
                  name="Taux de présence"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="absences"
                  dataKey="absences"
                  name="Nombre d'absences"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Évolution académique et financière
          </h2>
          <p className="text-sm text-gray-400">
            Historique utilisé pour le pilotage et les prévisions
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel
            title="Performance des encaissements"
            subtitle="Versements mensuels et régularisations des frais de 1300 MAD"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenuePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Recettes encaissées"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel
            title="Inscriptions à la rentrée"
            subtitle="Tous les stagiaires sont inscrits au début de l’année académique"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="enrollments"
                  name="Nombre d'inscriptions"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Diagnostic au niveau des modules
          </h2>
          <p className="text-sm text-gray-400">
            Identification des modules avec trop d’absences ou une faible
            présence
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel
            title="Taux de présence par module"
            subtitle="Les valeurs faibles indiquent les modules à examiner"
          >
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={problematicModules}
                layout="vertical"
                margin={{ left: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="module"
                  width={150}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="attendance_rate"
                  name="Taux de présence"
                  fill="#7c3aed"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <section className="rounded-2xl border border-gray-100 bg-white shadow-md">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-800">
                Modules problématiques
              </h2>
              <p className="text-sm text-gray-400">
                Classés selon le nombre total d’absences
              </p>
            </div>
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-400">
                    <th className="px-6 py-3">Module</th>
                    <th className="px-6 py-3">Filière</th>
                    <th className="px-6 py-3">Présence</th>
                    <th className="px-6 py-3">Absences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analytics.module_attendance.map((module) => (
                    <tr key={module.module_id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {module.module}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {module.specialty}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {module.attendance_rate}%
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        {module.absences}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            IA et innovation
          </h2>
          <p className="text-sm text-gray-400">
            Modèles légers sélectionnés pour être expliqués pendant la
            soutenance
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            title="Prévision des encaissements"
            subtitle={analytics.ai.prediction.method}
            className="xl:col-span-2"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Réel"
                  stroke="#2563eb"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Prévision"
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-4 text-sm text-gray-500">
              {analytics.ai.prediction.reason}
            </p>
          </Panel>

          <Panel
            title="Anomalies détectées"
            subtitle={analytics.ai.anomalies.method}
          >
            <div className="space-y-3">
              {analytics.ai.anomalies.items.length === 0 && (
                <p className="text-sm text-gray-500">
                  Aucun mois inhabituel détecté pour ces filtres.
                </p>
              )}
              {analytics.ai.anomalies.items.map((item) => (
                <div
                  key={`${item.type}-${item.month}`}
                  className="rounded-xl bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <p className="text-sm font-semibold text-gray-800">
                      {item.type} {item.direction}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatMonth(item.month)} | {item.value} | z-score{" "}
                    {item.z_score}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {analytics.ai.anomalies.reason}
            </p>
          </Panel>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel
            title="Segmentation automatique des stagiaires"
            subtitle={analytics.ai.segmentation.method}
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="attendance_rate"
                  name="Présence"
                  domain={[0, 100]}
                />
                <YAxis
                  type="number"
                  dataKey="payment_rate"
                  name="Paiement"
                  domain={[0, 100]}
                />
                <ZAxis
                  type="number"
                  dataKey="absence_rate"
                  range={[60, 260]}
                  name="Taux d’absence"
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  data={analytics.ai.segmentation.students}
                  fill="#6366f1"
                />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {segmentData.map((segment) => (
                <div
                  key={segment.segment}
                  className="rounded-xl bg-gray-50 p-3 text-center"
                >
                  <p className="text-lg font-bold text-gray-800">
                    {segment.students}
                  </p>
                  <p className="text-xs text-gray-500">{segment.segment}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {analytics.ai.segmentation.reason}
            </p>
          </Panel>

          <section className="rounded-2xl border border-gray-100 bg-white shadow-md">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
              <ShieldAlert size={20} className="text-red-600" />
              <div>
                <h2 className="font-semibold text-gray-800">
                  Détection des stagiaires à risque
                </h2>
                <p className="text-sm text-gray-400">
                  {analytics.ai.risk.method}
                </p>
              </div>
            </div>
            <div className="max-h-[370px] overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-400">
                    <th className="px-6 py-3">Stagiaire</th>
                    <th className="px-6 py-3">Classe</th>
                    <th className="px-6 py-3">Absences</th>
                    <th className="px-6 py-3">Taux</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analytics.ai.risk.students.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-sm text-gray-500"
                      >
                        Aucun stagiaire à risque pour les filtres sélectionnés.
                      </td>
                    </tr>
                  )}
                  {analytics.ai.risk.students.map((student) => (
                    <tr key={student.student_id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {student.student}
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
            <p className="px-6 pb-5 pt-3 text-sm text-gray-500">
              {analytics.ai.risk.reason}
            </p>
          </section>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-800">Résumé méthodologique</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <TrendingUp size={18} className="mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">
              La régression linéaire prévoit les encaissements à partir de leur
              historique mensuel.
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <AlertTriangle size={18} className="mb-2 text-amber-600" />
            <p className="text-sm text-gray-600">
              Les scores Z signalent les baisses de présence et les
              encaissements très éloignés des mois habituels.
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <GraduationCap size={18} className="mb-2 text-green-600" />
            <p className="text-sm text-gray-600">
              K-Means regroupe les stagiaires selon la présence, les absences et
              le niveau de paiement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
