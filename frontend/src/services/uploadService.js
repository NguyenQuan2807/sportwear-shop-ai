import axiosClient from "../api/axiosClient";

export const uploadAdminImageApi = (file, folder) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  return axiosClient.post("/api/admin/uploads/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};