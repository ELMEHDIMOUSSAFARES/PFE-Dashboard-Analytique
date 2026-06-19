import { RefreshCcw } from "lucide-react";

import { emptyFilters, formatMonth } from "@/lib/kpi";

export default function AcademicFilters({ filters, setFilters, options }) {
  const modules = options.modules.filter(
    (module) => !filters.specialty || module.specialty === filters.specialty
  );
  const classes = options.classes.filter((className) => {
    if (!filters.specialty) return true;
    return filters.specialty === "Développement Informatique"
      ? className.startsWith("DI")
      : className.startsWith("FC");
  });

  const updateFilter = (field, value) => {
    setFilters((current) => {
      const next = { ...current, [field]: value };
      if (field === "specialty") {
        next.module_id = "";
        next.class_name = "";
      }
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="text-sm font-medium text-gray-600">
          Date de début
          <input
            type="date"
            value={filters.start_date}
            min={options.date_range?.min || undefined}
            max={options.date_range?.max || undefined}
            onChange={(event) => updateFilter("start_date", event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </label>

        <label className="text-sm font-medium text-gray-600">
          Date de fin
          <input
            type="date"
            value={filters.end_date}
            min={options.date_range?.min || undefined}
            max={options.date_range?.max || undefined}
            onChange={(event) => updateFilter("end_date", event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </label>

        <label className="text-sm font-medium text-gray-600">
          Mois académique
          <select
            value={filters.academic_month}
            onChange={(event) => updateFilter("academic_month", event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">Tous les mois</option>
            {options.academic_months.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-gray-600">
          Filière
          <select
            value={filters.specialty}
            onChange={(event) => updateFilter("specialty", event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">Toutes les filières</option>
            {options.specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-gray-600">
          Module
          <select
            value={filters.module_id}
            onChange={(event) => updateFilter("module_id", event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">Tous les modules</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <label className="text-sm font-medium text-gray-600">
            Classe
            <select
              value={filters.class_name}
              onChange={(event) => updateFilter("class_name", event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">Toutes les classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            title="Réinitialiser les filtres"
            onClick={() => setFilters(emptyFilters)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
