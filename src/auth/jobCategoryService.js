import apiClient from "./axiosInstance/Base_url";

export const createJobCategory = async ({ name, type, image }) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("image", image);

    const response = await apiClient.post("/admin/jobsCategory/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getCategoriesByType = async (type) => {
  try {
    const response = await apiClient.get("/admin/jobsCategory/getCategoriesByType", {
      params: { type }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const deleteJobCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/jobsCategory/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const updateJobCategory = async (id, { name, type, image, status }) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("image", image);
    formData.append("status", status);

    const response = await apiClient.put(`/admin/jobsCategory/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const searchJobCategories = async (q, type) => {
  try {
    const response = await apiClient.get("/admin/jobsCategory/search", {
      params: { q, type }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const createSubCategory = async ({ categoryId, subCategoryName }) => {
  try {
    const response = await apiClient.post("/admin/jobsCategory/create-subCategory", {
      categoryId,
      subCategoryName,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};