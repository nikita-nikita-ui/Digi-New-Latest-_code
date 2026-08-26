import React, { useState, useEffect } from "react";
import { Search, UserPlus, Edit2, Lock, Unlock, Trash2, X } from "lucide-react";
import {
  getAllAdminData,
  registerAdmin,
  searchAdminAPI,
  deleteAdminAPI,
  updateAdminAPI,
} from "../../auth/adminLogin";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ name: "", email: "" });
  const [adminToUpdateId, setAdminToUpdateId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchUsers = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAdminData(page);
      if (response && response.admins) {
        setUsers(response.admins); // ✅ सही
        setTotalPages(Math.ceil(response.totalAdmins / itemsPerPage)); // ✅ pagination fix
        setTotalItems(response.totalAdmins);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError("Failed to load admin data.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const result = await registerAdmin(
        formData.name,
        formData.email,
        formData.password,
      );
      if (result) {
        setToast({ visible: true, message: "Admin added successfully!" });
        setIsModalOpen(false);
        setFormData({ name: "", email: "", password: "" });
        setCurrentPage(1);
        fetchUsers(1);
        setTimeout(() => setToast({ visible: false, message: "" }), 5000);
      }
    } catch (err) {
      alert(err.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const handleSearch = async (val) => {
    setSearchQuery(val);
    try {
      if (val.trim() === "") {
        await fetchUsers(1);
        setCurrentPage(1);
      } else {
        const res = await searchAdminAPI(val);
        setUsers(res.admins || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setDeleteLoading(true);
    try {
      const result = await deleteAdminAPI(adminToDelete);
      if (result) {
        setToast({ visible: true, message: "Admin deleted successfully!" });
        setUsers(
          users.filter((user) => (user.id || user._id) !== adminToDelete),
        );
        setIsDeleteModalOpen(false);
        setAdminToDelete(null);
        setTimeout(() => setToast({ visible: false, message: "" }), 3000);
      }
    } catch (err) {
      alert(err.message || "Failed to delete admin");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openUpdateModal = (user) => {
    setAdminToUpdateId(user.id || user._id);
    setUpdateFormData({ name: user.name, email: user.email });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const result = await updateAdminAPI(adminToUpdateId, updateFormData);
      if (result) {
        setToast({ visible: true, message: "Admin updated successfully!" });
        setUsers(
          users.map((u) =>
            (u.id || u._id) === adminToUpdateId
              ? { ...u, ...updateFormData }
              : u,
          ),
        );
        setIsUpdateModalOpen(false);
        setTimeout(() => setToast({ visible: false, message: "" }), 3000);
      }
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans m-4">
      {toast.visible && (
        <div className="fixed top-5 right-5 z-[2000] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          ✅ {toast.message}
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Admin</h1>
        <p className="text-gray-500">
          Manage all registered admin on the platform.
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium">
          All Admin
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/4">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search Admin..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-700"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus size={18} /> Add Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {" "}
        {loading && (
          <div className="p-6 text-center text-blue-600">
            Loading Admin...
          </div>
        )}
        {error && (
          <div className="p-6 text-center text-red-600 bg-red-50">{error}</div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="p-6 text-center text-gray-500">No Admin found.</div>
        )}
        {!loading && users.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold tracking-wider">
                <th className="px-6 py-4">S.NO</th>
                <th className="px-6 py-4">ADMIN NAME</th>
                <th className="px-6 py-4">EMAIL</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => {
                const serialNumber = indexOfFirstItem + index + 1;
                return (
                  <tr
                    key={user.id || user._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {serialNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                            alt="avatar"
                            className="w-8 h-8"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {user.name}
                          </p>
                         
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {user.role || "UNKNOWN"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          user.status === "BLOCKED"
                            ? "bg-red-50 text-red-400 border border-red-100"
                            : "bg-green-50 text-green-500 border border-green-100"
                        }`}
                      >
                        {user.status || "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4 ">
                        <Edit2
                          size={18}
                          className="cursor-pointer hover:text-blue-500"
                          onClick={() => openUpdateModal(user)}
                        />
                      
                        <Trash2
                          size={18}
                          className="cursor-pointer hover:text-red-500"
                          onClick={() => {
                            setAdminToDelete(user.id || user._id);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="text-sm text-gray-500 font-medium">
          Showing{" "}
          <span className="text-indigo-600 font-bold">
            {indexOfFirstItem + 1}
          </span>{" "}
          to{" "}
          <span className="text-indigo-600 font-bold">
            {Math.min(indexOfFirstItem + users.length, totalItems)}
          </span>{" "}
          of <span className="text-indigo-600 font-bold">{totalItems}</span>{" "}
          entries
        </div>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Register New Admin
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  required
                  type="password"
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border rounded-lg font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {regLoading ? "Registering..." : "Register Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={30} className="text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Are you sure?
            </h2>
            <p className="text-gray-500 mb-6">
              Do you really want to delete this admin? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Admin Details
              </h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={updateFormData.name}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={updateFormData.email}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border rounded-lg font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
