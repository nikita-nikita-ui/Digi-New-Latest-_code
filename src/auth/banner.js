import apiClient from "./axiosInstance/Base_url";

// export const createBanner = async ({ title, image, description, isActive, position }) => {
//   try {
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("image", image);
//     formData.append("description", description);
//     formData.append("isActive", isActive);
//     formData.append("position", position);

//     const response = await apiClient.post("/admin/banner/create", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : new Error("Network Error");
//   }
// };

export const getBanners = async () => {
  try {
    const response = await apiClient.get("/admin/banner/all");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getBannerById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/banner/getById/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};



export const deleteBanner = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/banner/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const searchBanners = async (searchText) => {
  try {
    const response = await apiClient.get(
      `/admin/banner/search?q=${encodeURIComponent(searchText)}`
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to search banner"
    );
  }
};

export const createBanner = async (formData) => {
  try {
    const response = await apiClient.post(
      "/admin/banner/create",
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
      "Failed to create banner"
    );
  }
};

export const updateBanner = async (id, formData) => {
  try {
    const response = await apiClient.put(
      `/admin/banner/update/${id}`,
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
      "Failed to update banner"
    );
  }
};