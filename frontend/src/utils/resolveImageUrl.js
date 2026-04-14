const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

const LOCAL_PUBLIC_PREFIXES = [
  "/images/",
  "/icons/",
  "/favicon",
  "/vite.svg",
];

export function resolveImageUrl(value) {
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (LOCAL_PUBLIC_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value}`;
}
