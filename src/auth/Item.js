import apiClient from "./axiosInstance/Base_url";

export const getAllItemCategories = async () => {
  try {
    const response = await apiClient.get(
      "/admin/itemCategories/get-all"
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to fetch item categories"
    );
  }
};

export const searchItemCategory = async (searchText) => {
  try {
    const response = await apiClient.get(
      `/admin/itemCategories/search-category?q=${encodeURIComponent(searchText)}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to search item category"
    );
  }
};

export const deleteItemCategory = async (id) => {
  try {
    const response = await apiClient.delete(
      `/admin/itemCategories/delete/${id}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to delete item category"
    );
  }
};



export const createItemCategory = async (formData) => {
  try {
    const response = await apiClient.post(
      "/admin/itemCategories/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to create item category"
    );
  }
};


export const updateItemCategory = async (id, formData) => {
  try {
    const response = await apiClient.put(
      `/admin/itemCategories/update-category/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to update item category"
    );
  }
};