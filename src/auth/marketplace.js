import apiClient from "./axiosInstance/Base_url";

export const getItemsUsers = async (page = 1, limit = 10) =>
     {
  try {
    const response = await apiClient.get(
      "/admin/items/getItems-users",
      {
        params: {
          page,
          limit,
        },
      }
    );

    return response.data;
  }
   catch (error) 
   {
    throw error;
  }
};


export const getAllItemCategories = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(
      "/admin/itemCategories/get-all",
      {
        params: {
          page,
          limit,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};


export const createItem = async (data) => {
  try {
    const response = await apiClient.post(
      "/admin/items/create",
      data
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};