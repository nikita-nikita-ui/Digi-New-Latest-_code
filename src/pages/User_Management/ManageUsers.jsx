import React, { useState, useEffect } from "react";
import {
  Search,
  Ban,
  CheckCircle,
  UserCircle,
  Edit,
  Trash2,
  X,
  Save,
  Phone,
  MessageCircle,
  Eye,
} from "lucide-react";
import {
  getAllMasterUsers,
  updateUserProfileAPI,
  deleteUserAPI,
  searchUsersAPI,
} from "../../auth/adminLogin";
import toast, { Toaster } from "react-hot-toast";

export default function UserMasterProfile() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const mapUserData = (apiData) => {
    return apiData.map((u) => ({
      id: u._id,
      name: u.fullName || u.name || "Unknown User",
      photo: u.profilePhoto || "",
      mobile: u.mobile || "N/A",
      whatsapp: u.mobile || "N/A",
      gender: u.gender || "N/A",
      location:
        typeof u.location === "object"
          ? u.location.address || "Point"
          : u.location || "N/A",
      blood: u.bloodGroup || "N/A",
      role: u.role || "N/A",
      credits: u.credits !== undefined ? u.credits : 0,
      status: u.status || "Active",
      isVerified: u.isVerified || false,
      joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
      lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "N/A",
    }));
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAllMasterUsers(page);
      if (response.success) {
        const mappedData = mapUserData(response.data);
        setUsers(mappedData);
        setTotalPages(response.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim() !== "") {
        try {
          const response = await searchUsersAPI(search);
          if (response.status) {
            const mapped = mapUserData(response.data);
            setUsers(mapped);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        fetchUsers(currentPage);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = (user) => {
    setDeleteModal({ isOpen: true, userId: user.id, userName: user.name });
  };

  const confirmDelete = async () => {
    try {
      const loadingToast = toast.loading("Deleting user...");
      await deleteUserAPI(deleteModal.userId);
      setUsers(users.filter((u) => u.id !== deleteModal.userId));
      toast.success("User deleted successfully!", { id: loadingToast });
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
    }
  };

  const handleBlockToggle = (id) => {
    setUsers(
      users.map((user) => {
        if (user.id === id) {
          return {
            ...user,
            status: user.status === "Active" ? "Blocked" : "Active",
          };
        }
        return user;
      }),
    );
  };

  const handleEditClick = (user) => {
    setCurrentUser({ ...user });
    setIsModalOpen(true);
  };

  const handleViewClick = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", currentUser.name);
      formData.append("mobile", currentUser.mobile);
      formData.append("gender", currentUser.gender);
      formData.append("bloodGroup", currentUser.blood);
      formData.append("role", currentUser.role);
      formData.append("credits", currentUser.credits);

      if (currentUser.profileImageFile) {
        formData.append("profilePhoto", currentUser.profileImageFile);
      }

      const loadingToast = toast.loading("Updating profile...");
      const response = await updateUserProfileAPI(currentUser.id, formData);

      if (response.status) {
        toast.success("Profile updated successfully!", { id: loadingToast });
        fetchUsers(currentPage);
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen font-sans m-5">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master User Profile
          </h1>
          <p className="text-sm text-gray-500">
            Admin View - Manage all user details
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 mb-6 max-w-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-orange-200 bg-orange-50 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-x-auto">
        <table className="min-w-[1400px] w-full text-sm">
          <thead className="bg-orange-100/50 text-gray-700 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-4 text-left">SNo.</th>
              <th className="px-4 py-4 text-left">Profile</th>
              <th className="px-4 py-4 text-left">Name</th>
              <th className="px-4 py-4 text-left">Contact Info</th>
              <th className="px-4 py-4 text-left">Role & Gender</th>
              <th className="px-4 py-4 text-left">Location</th>
              <th className="px-4 py-4 text-left">Blood</th>
              <th className="px-4 py-4 text-left">Credits</th>
              <th className="px-4 py-4 text-left">Dates</th>
              <th className="px-4 py-4 text-left">Status</th>
              <th className="px-4 py-4 text-center">Admin Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-orange-50">
            {users.map((u, index) => (
              <tr
                key={u.id}
                className="hover:bg-orange-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-500">
                  {(currentPage - 1) * 10 + (index + 1)}
                </td>
                <td className="px-4 py-3">
                  {u.photo ? (
                    <img
                      src={u.photo}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-orange-200"
                    />
                  ) : (
                    <UserCircle className="w-10 h-10 text-gray-300" />
                  )}
                </td>

                <td className="px-4 py-3 font-medium text-gray-800">
                  {u.name}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Phone size={12} /> {u.mobile}
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <MessageCircle size={12} /> {u.whatsapp}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{u.role}</span>
                    <span className="text-xs text-gray-500">{u.gender}</span>
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-600">{u.location}</td>
                <td className="px-4 py-3 text-gray-600 font-medium">
                  {u.blood || "-"}
                </td>
                <td className="px-4 py-3 font-bold text-orange-600">
                  {u.credits}
                </td>

                <td className="px-4 py-3 text-xs text-gray-500">
                  <div>Joined: {u.joined}</div>
                  <div>Active: {u.lastActive}</div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      u.status === "Active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewClick(u)}
                      className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View Profile Details"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => handleEditClick(u)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit Fields"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleBlockToggle(u.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        u.status === "Active"
                          ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                      title={
                        u.status === "Active" ? "Block User" : "Unblock User"
                      }
                    >
                      {u.status === "Active" ? (
                        <Ban size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(u)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Permanently Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-orange-100">
        <div className="text-sm text-gray-500">
          Page <span className="font-medium text-gray-700">{currentPage}</span>{" "}
          of <span className="font-medium text-gray-700">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Trash2 size={18} className="text-red-500" /> Delete User
              </h2>
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, userId: null, userName: "" })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={26} className="text-red-500" />
              </div>
              <p className="text-gray-700 font-semibold text-base mb-1">
                Are you sure?
              </p>
              <p className="text-gray-500 text-sm">
                You are about to permanently delete{" "}
                <span className="font-bold text-red-600">
                  {deleteModal.userName}
                </span>
                . This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, userId: null, userName: "" })
                }
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <Trash2 size={16} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Edit User Profile
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      profileImageFile: e.target.files[0],
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentUser.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Role
                </label>
                <select
                  name="role"
                  value={currentUser.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm bg-white"
                >
                  <option value="SERVICE_PROVIDER">Service Provider</option>
                  <option value="BUSINESS_SHOPS">Business Shops</option>
                  <option value="JOB_SEEKER">Job Seeker</option>
                  <option value="GENERAL_USER">General User</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={currentUser.mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  WhatsApp
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={currentUser.whatsapp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={currentUser.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Gender
                </label>
                <select
                  name="gender"
                  value={currentUser.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Blood Group
                </label>
                <select
                  name="blood"
                  value={currentUser.blood}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Credits Balance
                </label>
                <input
                  type="number"
                  name="credits"
                  value={currentUser.credits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <label className="text-xs text-gray-400 block">
                    Joined Date
                  </label>
                  <p className="text-sm font-medium text-gray-600">
                    {currentUser.joined}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">
                    Last Active
                  </label>
                  <p className="text-sm font-medium text-gray-600">
                    {currentUser.lastActive}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserCircle className="text-orange-500" size={22} /> User
                Detailed Profile
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="flex flex-col items-center pb-6 border-b border-gray-100 mb-6">
                {viewUser.photo ? (
                  <img
                    src={viewUser.photo}
                    alt={viewUser.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-100 shadow-sm"
                  />
                ) : (
                  <UserCircle className="w-24 h-24 text-gray-300" />
                )}
                <h3 className="text-xl font-bold text-gray-800 mt-3">
                  {viewUser.name}
                </h3>
                <p className="text-sm font-semibold text-orange-600 mt-1 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
                  {viewUser.role}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User ID
                  </span>
                  <span className="text-gray-800 font-mono text-xs">
                    {viewUser.id}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Mobile Number
                  </span>
                  <span className="text-gray-800 flex items-center gap-1 mt-1">
                    <Phone size={14} className="text-gray-400" />{" "}
                    {viewUser.mobile}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    WhatsApp Number
                  </span>
                  <span className="text-gray-800 flex items-center gap-1 mt-1">
                    <MessageCircle size={14} className="text-green-500" />{" "}
                    {viewUser.whatsapp}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Gender
                  </span>
                  <span className="text-gray-800 capitalize mt-1 block">
                    {viewUser.gender}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Blood Group
                  </span>
                  <span className="text-gray-800 font-bold mt-1 block">
                    {viewUser.blood || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Credits Balance
                  </span>
                  <span className="text-orange-600 font-bold text-lg mt-1 block">
                    {viewUser.credits}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center font-medium mt-1 text-xs px-2.5 py-0.5 rounded-full border ${
                      viewUser.status === "Active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {viewUser.status}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Joined On
                  </span>
                  <span className="text-gray-600 mt-1 block">
                    {viewUser.joined}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Last Activity
                  </span>
                  <span className="text-gray-600 mt-1 block">
                    {viewUser.lastActive}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-900 text-white rounded-xl transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
