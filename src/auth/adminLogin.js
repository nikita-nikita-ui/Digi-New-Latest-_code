
import apiClient from "./axiosInstance/Base_url";

export const sendAdminOtp = async (mobile) => {

  try {
    const response = await apiClient.post(

      "/otp/admin/send-otp",
      {
        mobile,
      }
    );

    return response.data;

  } catch (error) {

    throw (
      error.response?.data?.message ||

      "Failed to send admin OTP"
    );
  }
};


export const verifyAdminOtp = async (mobile, otp) => {

  try {

    const { data } = await apiClient.post("/otp/admin/verify-otp", {

      mobile,
      otp,
    });

    return data;

  } catch (error) {

    throw (

      error.response?.data?.message ||

      "Failed to verify admin OTP"
    );
  }
};




export const resendAdminOtp = async (mobile) => {
  try
   {
    const response = await apiClient.post(

      "/otp/resend-otp",
      { mobile }
    );

    return response.data;

  } catch (error) {

    throw (
      error.response?.data?.message ||

      "Failed to resend admin OTP"
    );
  }
};

// --- Dashboard Stats ---
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("/admin/dashboard-stats", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    // Returning response.data.data to directly access the stats object
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};
export const getRegularPartTimeJobs = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(
      "/admin/part-time/regular-jobs",
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


export const getJobCategoriesByType = async (type) => {
  try {
    const response = await apiClient.get(
      "/admin/jobsCategory/getCategoriesByType",
      {
        params: {
          type: type,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
// --- Get Job By ID (Part-Time) ---
export const getJobById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/part-time/job/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- UPDATE JOB (Part-Time) ---

export const updatePartTimeJob = async (jobId, formData) => {
  try {
    const response = await apiClient.put(
      `/admin/part-time/job/update/${jobId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- DELETE JOB (Part-Time) ---
export const deleteJob = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.delete(
      `/admin/part-time/job/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Part-Time Job Delete Error:", error);
    throw error.response
      ? error.response.data
      : new Error("Network Error or Server Unreachable");
  }
};

export const createNewJob = async (jobData) => {
  try {
    const adminId = localStorage.getItem("id");

    if (jobData instanceof FormData) {
      if (adminId) {
        jobData.append("userId", adminId);
      }

      const response = await apiClient.post(
        `/admin/part-time/job/create`,
        jobData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } else {
      const finalData = { ...jobData, userId: adminId };
      const response = await apiClient.post(
        `/admin/part-time/job/create`,
        finalData,
      );
      return response.data;
    }
  } catch (error) {
    console.error("API Error Details:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- Get All Full-Time Jobs ---
export const getAllFullTimeJobs = async (page = 1) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(`/admin/full-time/all?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getAllCategories = async (page = 1, limit = 10) => {
  try {
    // Yahan URL mein query parameters add karna zaroori hai
    const response = await apiClient.get(
      `/admin/category/all?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Network Error";
    throw new Error(errorMessage);
  }
};

export const getAllBusiness = async (page = 1) => {
  const token = localStorage.getItem("token");

  try {
    const response = await apiClient.get(
      `/admin/manage-business/all?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- UPDATE BUSINESS STATUS (PATCH) ---
export const updateBusinessStatusAPI = async (businessId, status) => {
  try {
    const token = localStorage.getItem("token");
    const adminId =
      localStorage.getItem("id") || localStorage.getItem("userId");

    const response = await apiClient.patch(
      `/admin/manage-business/update-status/${businessId}`,
      {
        status,        // e.g. "Pending", "Approved", "Rejected"
        adminId,       // optional (if backend uses it)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update Business Status Error:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const createNewFullTimeJob = async (formData) => {
  try {
    const adminId = localStorage.getItem("id");
    if (adminId) formData.append("adminId", adminId);

    const response = await apiClient.post(`/admin/full-time/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("Network Error or Server Unreachable");
  }
};

// GET /api/admin/users
export const getAllUsersAPI = async () => {
  try {
    const response = await apiClient.get("/admin/users");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const updateUserStatusAPI = async (id, status) => {
  try {
    const adminId = localStorage.getItem("id");
    // Payload mein status ke sath adminId bhej rahe hain
    const response = await apiClient.patch(`/admin/user-status/${id}`, {
      status,
      adminId,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getAllBloodRequestsAPI = async () => {
  try {
    const response = await apiClient.get("/admin/blood-requests");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- Update Blood Request (PUT) ---
export const updateBloodRequestAPI = async (id, requestData) => {
  try {
    const adminId = localStorage.getItem("id");
    const finalData = { ...requestData, updatedBy: adminId };

    const response = await apiClient.put(
      `/admin/blood-requests/${id}`,
      finalData,
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- Delete Blood Request (DELETE) ---
export const deleteBloodRequestAPI = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/blood-requests/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getBloodRequestByIdAPI = async (id) => {
  try {
    const response = await apiClient.get(`/admin/blood-requests/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getAllAdminData = async (page = 1) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(`/admin/all?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};
// --- Modified Shop Management API Function ---

export const getAllShopsForAdmin = async (page = 1) => {
  const token = localStorage.getItem("token"); // or wherever you store it
  try {
    const response = await apiClient.get(
      `/admin/manage-business/all?page=${page}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getShopDetailsById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/manage-business/${id}`);

    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching shop details for ID ${id}:`, error);
    throw error.response
      ? error.response.data
      : new Error("Network Error or Shop Details Service Unreachable");
  }
};

export const deletebusiness = async (id) => {
  try {
    const response = await apiClient.delete(
      `admin/manage-business/delete/${id}`,
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const toggleBusinessStatusAPI = async (businessId, status) => {
  try {
    const adminId = localStorage.getItem("id");

    const response = await apiClient.patch(
      `/admin/manage-business/toggle-status/${businessId}`,
      { status, adminId },
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const createNewShopAPI = async (formData) => {
  try {
    const response = await apiClient.post(
      "/admin/manage-business/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("Network Error or Shop Creation Failed");
  }
};

export const createBusinessForUserAPI = async (formData) => {
  try {
    const response = await apiClient.post(
      "/admin/manage-business/create-for-user",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const addServiceToBusinessAPI = async (businessId, formData) => {
  try {
    const response = await apiClient.post(
      `/admin/manage-business/add-service/${businessId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getBusinessServicesAPI = async (businessId) => {
  try {
    const response = await apiClient.get(`/business/${businessId}/services`);
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("An unexpected error occurred");
  }
};

export const updateBusinessDetailsAPI = async (businessId, formData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `/admin/manage-business/update/${businessId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const updateBusinessServiceAPI = async (
  businessId,
  serviceId,
  formData,
) => {
  try {
    const response = await apiClient.put(
      `/admin/manage-business/update-service/${businessId}/${serviceId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("An unexpected error occurred");
  }
};

export const deleteBusinessServiceAPI = async (businessId, serviceId) => {
  try {
    const response = await apiClient.delete(
      `/admin/manage-business/delete-service/${businessId}/${serviceId}`,
    );
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("An unexpected error occurred");
  }
};

export const addCategory = async (formData) => {
  try {
    const adminId =
      localStorage.getItem("id") || localStorage.getItem("userId");

    // Agar image upload ho rahi hai (FormData use ho raha hai)
    if (formData instanceof FormData) {
      if (adminId) formData.append("createdBy", adminId);
      const response = await apiClient.post("/admin/category/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    // Agar normal JSON data bhej rahe hain
    else {
      const finalData = { ...formData, createdBy: adminId };
      const response = await apiClient.post("/admin/category/add", finalData);
      return response.data;
    }
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("Network Error or Category Creation Failed");
  }
};

// --- DELETE CATEGORY CONTROLLER ---
export const deleteCategory = async (categoryId) => {
  const token = localStorage.getItem("token");

  const response = await apiClient.delete(
    `/admin/category/delete/${categoryId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};



// --- DELETE SUB-CATEGORY ---
export const deleteSubCategoryAPI = async (categoryName, subCategoryName) => {
  try {
    const response = await apiClient.delete(
      "/admin/category/delete-subCategory",
      {
        data: {
          category: categoryName,
          subCategoryToDelete: subCategoryName,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting sub-category:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};



export const addSubCategory = async (categoryName, subCategoryName) => {
  try {
    // Payload as per your requirement
    const payload = {
      category: categoryName, // e.g., "electronics"
      subCategory: subCategoryName, // e.g., "Laptops"
    };

    const response = await apiClient.post(
      "/admin/category/create-subCategory",
      payload,
    );

    // Success response logic
    return response.data;
  } catch (error) {
    // Error handling consistency check
    console.error("Error adding sub-category:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getSubCategoriesByCategory = async (categoryName) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(`/admin/category/get-subCategories`, {
      params: { categoryName },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    throw error.response?.data?.message || "Failed to fetch sub-categories";
  }
};
export const getAllMasterUsers = async (page = 1) => {
  try {
    // Query parameter (?page=) add kiya gaya hai
    const response = await apiClient.get(`/admin/users/all-users?page=${page}`);
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("Network Error or Server Unreachable");
  }
};

export const updateUserProfileAPI = async (userId, userData) => {
  try {
    const adminId =
      localStorage.getItem("id") || localStorage.getItem("userId");

    let dataToSend;
    let headers = {};

    if (userData instanceof FormData) {
      dataToSend = userData;
      if (adminId) dataToSend.append("updatedBy", adminId);
      headers = { "Content-Type": "multipart/form-data" };
    } else {
      dataToSend = { ...userData, updatedBy: adminId };
    }

    const response = await apiClient.put(
      `/admin/users/update-profile/${userId}`,
      dataToSend,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const deleteUserAPI = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/users/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const searchUsersAPI = async (name) => {
  try {
    const response = await apiClient.get("/admin/users/search", {
      params: { name }, // This will append ?name=... to the URL
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // Returns { status, message, data }
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};
export const registerAdmin = async (name, email, password) => {
  try {
    const token = localStorage.getItem("token"); // or wherever you're storing it

    const response = await apiClient.post(
      "/admin/register",
      {
        name,
        email,
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const searchAdminAPI = async (query) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("/admin/search-admin", {
      params: { query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const deleteAdminAPI = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.delete(`/admin/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Expected: { "message": "Admin deleted successfully" }
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const updateAdminAPI = async (id, adminData) => {
  try {
    const token = localStorage.getItem("token");
    const adminId =
      localStorage.getItem("id") || localStorage.getItem("userId");

    // Including updatedBy for tracking, similar to your other update controllers
    const dataToSend = { ...adminData, updatedBy: adminId };

    const response = await apiClient.put(`/admin/update/${id}`, dataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Expected: { "message": "Admin updated successfully", "admin": {...} }
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- SEARCH USERS BY NAME ---
export const searchUsersByNameAPI = async (name) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get("/admin/users/search", {
      params: { name }, // This adds ?name=Digi to the URL
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // This returns the { status, message, data: [...] } object
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const createBloodRequestAPI = async (requestData) => {
  try {
    const adminId =
      localStorage.getItem("id") || localStorage.getItem("userId");

    // Payload mein adminId add kar rahe hain agar localStorage mein available hai
    const finalData = {
      ...requestData,
      adminId: requestData.adminId || adminId,
    };

    const response = await apiClient.post("/admin/blood-requests", finalData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};
export const deleteFullTimeJob = async (jobId) => {
  const token = localStorage.getItem("token");

  const response = await apiClient.delete(`/admin/full-time/delete/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// --- UPDATE FULL-TIME JOB CONTROLLER ---
export const updateFullTimeJob = async (id, formData) => {
  try {
    const token = localStorage.getItem("token");
    const adminId =
      localStorage.getItem("id") || localStorage.getItem("userId");

    // Agar updatedBy track karna chahte hain toh add karein
    if (formData instanceof FormData) {
      if (adminId && !formData.has("updatedBy")) {
        formData.append("updatedBy", adminId);
      }
    }

    const response = await apiClient.put(
      `/admin/full-time/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Full-Time Job Update Error:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};
// --- GET USERS FOR DROPDOWN ---
export const getUsersForDropdownAPI = async () => {
  try {
    const response = await apiClient.get("/admin/users/dropdown-users");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getUserGraphStats = async (filter) =>
   {
  try 
  {
    const { data } = await apiClient.get("/user/graph-stats", {

      params: { filter },

    });

    return data;

  }
   catch (error) {
    throw error;
  }
};


export const updateCategoryAPI = async (id, payload) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.put(
      `/admin/category/update/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- UPDATE SUB-CATEGORY CONTROLLER ---
export const updateSubCategoryAPI = async (
  category,
  oldSubCategory,
  newSubCategory,
) => {
  try {
    const token = localStorage.getItem("token");

    const payload = {
      category: category,
      oldSubCategory: oldSubCategory,
      newSubCategory: newSubCategory,
    };

    const response = await apiClient.put(
      "/admin/category/update-subCategory",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error updating sub-category:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};
export const getBloodRequestsByUrgencyAPI = async (urgency) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(
      `/admin/bloodRequest-urgency?urgency=${urgency}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data; // Return karega { success, results, data }
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- SEARCH CATEGORY BY NAME ---
export const searchCategoriesAPI = async (query) => {
  try {
    const token = localStorage.getItem("token");

    // GET Request with query parameter 'q'
    const response = await apiClient.get(`/admin/category/search-category`, {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Yeh { success, count, data } return karega
  } catch (error) {
    console.error("Search Category API Error:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- GET CATEGORIES FOR DROPDOWN ---
export const getCategoriesForDropdownAPI = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(
      "/admin/category/dropdown-categories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching dropdown categories:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const postLocalJob = async (jobData) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please login as USER.");
    }
    const response = await apiClient.post("/job/post", jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("POST LOCAL JOB ERROR:", error);
    throw (
      error?.response?.data || {
        success: false,
        message: "Network Error",
      }
    );
  }
};

// --- GET ALL REGULAR PART-TIME JOBS ---
export const getAllRegularJobs = async (page = 1, searchTerm = "") => {

  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(

      `/admin/part-time/regular-jobs?page=${page}&title=${searchTerm}`,
      
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getNonAdminFullTimeJobs = async (page = 1) => {
  try {
    const response = await apiClient.get(
      `/admin/full-time/non-admin-jobs?page=${page}`,
    );

    // Returns the object containing { success, count, pagination, data }
    return response.data;
  } catch (error) {
    console.error("Error fetching non-admin jobs:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// Create Local Job
export const createLocalJob = async (data) => {
  try {
    const response = await apiClient.post(
      "/admin/localJobs/create",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};


export const deleteLocalJob = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.delete(`/admin/localJobs/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // { success: true, message: "Local Job deleted successfully" }
  } catch (error) {
    console.error("DELETE LOCAL JOB ERROR:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getAllLocalJobs = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get(
      "/admin/localjobs/public/local-jobs",
      {
        params: {
          page,
          pageSize,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Local Job Users
export const getLocalJobUsers = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(

      "/admin/localJobs/user-list",
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




export const getPublicUserLocalJobs = async (page = 1) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      `/admin/localJobs/public/local-jobs?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const updateLocalJob = async (id, jobData) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please login as admin.");
    }

    const response = await apiClient.put(
      `/admin/localJobs/update-job/${id}`,
      jobData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data; // { success, message, data }
  } catch (error) {
    console.error("UPDATE LOCAL JOB ERROR:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const updateMarketplaceItemAPI = async (id, itemData) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please login as admin.");
    }

    const response = await apiClient.put(
      `/admin/items/update/${id}`,
      itemData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data; // { success, message, data }
  } catch (error) {
    console.error("UPDATE MARKETPLACE ITEM ERROR:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- GET ALL USER CREATED ITEMS ---
export const getAllUserItems = async (page = 1) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please login as admin.");
    }
    const response = await apiClient.get(
      `/admin/items/getItems-users?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("GET USER ITEMS ERROR:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- DELETE USER ITEM ---
export const deleteUserItem = async (id) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please login as admin.");
    }

    const response = await apiClient.delete(`/admin/items/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};


export const createMarketplaceItemAPI = async (itemData) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please login as admin.");
    }

    let dataToSend = itemData;

    if (itemData instanceof FormData) {
      dataToSend = itemData;
    }

    const response = await apiClient.post(
      "/admin/items/create",   // ✅ THIS matches your API
      dataToSend,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(itemData instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("CREATE MARKETPLACE ITEM ERROR:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const GsendNotificationAPI = async (payload) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "/admin/notifications/send",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("SEND NOTIFICATION ERROR:", error);
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const getAllUserCitiesAPI = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      "/admin/users/cities",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error("GET USER CITIES ERROR:", error);

    throw error.response
      ? error.response.data
      : new Error("Network Error");
  }
};

export const getUsersForNotificationAPI = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      "/admin/users/users-for-notification",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error("GET USERS FOR NOTIFICATION ERROR:", error);

    throw error.response
      ? error.response.data
      : new Error("Network Error");
  }
};

export const updateFullTimeJobStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.patch(
      `/admin/full-time/status/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};


export const getFullTimeJobStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("/admin/full-time/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};