export const API_URL = "http://127.0.0.1:8000";

export function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export function buildQuery(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export function formatMonth(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("fr-MA", {
    month: "short",
    year: "2-digit",
  });
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("fr-MA")} MAD`;
}

export const emptyFilters = {
  start_date: "",
  end_date: "",
  academic_month: "",
  specialty: "",
  module_id: "",
  class_name: "",
};
