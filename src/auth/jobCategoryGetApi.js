import apiClient from "./axiosInstance/Base_url";

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

export const updateJobCategory = async (id, data) => {
  try {
    const response = await apiClient.put(`/admin/jobsCategory/update/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const deleteSubCategory = async ({ categoryId, subCategoryName, type }) => {
  try {
    const response = await apiClient.delete("/admin/jobsCategory/delete-subCategory", {
      data: { categoryId, subCategoryName, type }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};