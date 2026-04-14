export const resolveImageUrl = (path) => {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  if (path.startsWith("/uploads/")) {
    return `${baseUrl}${path}`;
  }

  if (path.startsWith("uploads/")) {
    return `${baseUrl}/${path}`;
  }

  if (path.startsWith("/")) {
    return `${baseUrl}/uploads${path}`;
  }

  return `${baseUrl}/uploads/${path}`;
};