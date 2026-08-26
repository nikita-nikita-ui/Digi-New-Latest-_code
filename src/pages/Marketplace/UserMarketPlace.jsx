import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Star,
  X,
  Loader2,
  AlertCircle,
  ImageOff,
  AlertTriangle,
  CheckCircle,
  MapPin,
  ShoppingBag,
  Coins,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Search,
  Filter
} from "lucide-react";
import { getAllUserItems, deleteUserItem } from "../../auth/adminLogin";
import { useNavigate, useLocation } from "react-router-dom";

const UserMarketPlace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      4000
    );
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getAllUserItems(page);
      setItems(data.data || []);
      setPagination(data.pagination || null);
      setStats(data);
    } catch (err) {
      showToast(err.message || "Failed to fetch items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  const openDeleteModal = (item) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    setActionLoading(true);
    try {
      await deleteUserItem(currentItem._id);
      setItems(items.filter((item) => item._id !== currentItem._id));
      setIsDeleteModalOpen(false);
      setCurrentItem(null);
      showToast("Item deleted successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to delete item", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen font-sans text-slate-800 relative antialiased selection:bg-indigo-500 selection:text-white">
      {toast.visible && (
        <div className="fixed top-6 right-6 z-[1100] animate-bounce-short">
          <div
            className={`flex items-center gap-3.5 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border text-white font-medium text-xs tracking-wide transition-all duration-300 ${toast.type === "success"
              ? "bg-slate-900/95 border-emerald-500/30 shadow-emerald-950/10"
              : "bg-slate-900/95 border-rose-500/30 shadow-rose-950/10"
              }`}
          >
            <div
              className={`p-1.5 rounded-lg ${toast.type === "success"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-rose-500/20 text-rose-400"
                }`}
            >
              {toast.type === "success" ? (
                <CheckCircle size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
            </div>
            <p className="pr-4">{toast.message}</p>
            <button
              onClick={() => setToast({ ...toast, visible: false })}
              className="ml-auto p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-indigo-100/50 inline-flex items-center gap-1.5 mb-2">
            <Sparkles size={10} className="fill-indigo-100" /> Administrative Panel
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            User Listings
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">
            Monitor, filter, and configure peer-to-peer marketplace items.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
          <select
            value={location.pathname === "/user-marketplace" ? "User" : "Admin"}
            onChange={(e) => {
              if (e.target.value === "Admin") {
                navigate("/Marketplace");
              } else if (e.target.value === "User") {
                navigate("/user-marketplace");
              }
            }}
            className="w-full md:w-40 bg-transparent text-slate-700 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="Admin">Admin Products</option>
            <option value="User">User Listings</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Listings</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{stats?.totalItems || 0}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Listings</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2 tracking-tight">{stats?.activeItems || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Featured Ads</p>
              <p className="text-3xl font-extrabold text-amber-500 mt-2 tracking-tight">{stats?.isFeatured || 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100">
              <Star size={18} className="fill-amber-500 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Value</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">₹{(stats?.totalPriceSum || 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center border border-slate-100">
              <Coins size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/20">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search user listings by name, tags or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 transition-all duration-200 rounded-2xl shadow-sm">
              <Filter size={14} /> Refine List
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-24 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-indigo-500/10 animate-ping" />
                <Loader2 size={28} className="animate-spin text-indigo-600 relative" />
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-2">Fetching listed entries...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">
                    S.No.
                  </th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Listing Item Detail
                  </th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Sub Category
                  </th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Asking Price
                  </th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Promoted
                  </th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Listing Status
                  </th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-indigo-50/10 transition-colors duration-150 group"
                  >
                    <td className="p-5 text-xs font-bold text-slate-400 text-center">
                      {(page - 1) * (pagination?.pageSize || 10) + index + 1}
                    </td>
                    <td className="p-5 max-w-sm">
                      <div className="flex gap-4 items-center">
                        {item.images && item.images.length > 0 ? (
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 flex-shrink-0">
                            <img
                              src={item.images[0]}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              alt=""
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                            <ImageOff size={16} />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-bold text-slate-800 text-sm leading-snug tracking-tight hover:text-indigo-600 transition-colors cursor-pointer">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1.5 font-semibold">
                            <MapPin size={11} className="text-indigo-400" /> {item.location?.address || "No Address Provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-indigo-50/70 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-indigo-100/50">
                        {item.subCategory}
                      </span>
                    </td>
                    <td className="p-5 text-xs font-extrabold text-slate-800">
                      ₹{item.price?.toLocaleString() || "0"}
                    </td>
                    <td className="p-5 text-center">
                      <div className="inline-flex items-center justify-center">
                        <Star
                          size={18}
                          className={
                            item.isFeatured
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]"
                              : "text-slate-200"
                          }
                        />
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`text-[9px] font-bold px-3 py-1.5 rounded-xl tracking-widest inline-block uppercase ${item.isActive
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setEditItem(item);
                            setIsEditModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm"
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-xl border border-rose-100/80 bg-rose-50/50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredItems.length === 0 && (
            <div className="p-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Layers size={36} className="text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-500 mt-2">Empty Records Available</p>
              <p className="text-[10px] text-slate-400 max-w-xs">No user marketplace items were matches under the current filter query.</p>
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-5 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-xl shadow-sm transition-all duration-150 inline-flex items-center gap-1.5"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, pagination.totalPages))
              }
              disabled={page === pagination.totalPages}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-xl shadow-sm transition-all duration-150 inline-flex items-center gap-1.5"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {isDeleteModalOpen && currentItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 text-center border border-slate-100 transform scale-100 transition-all duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Delete This Listing?</h3>
            <p className="text-slate-500 text-xs px-4 leading-relaxed mb-8">
              This action cannot be undone. Are you sure you want to permanently delete <strong>"{currentItem.title}"</strong> from active listings?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-5 py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-xs transition-colors duration-150 bg-white"
              >
                Keep Listing
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 px-5 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-500/25 transition-all duration-150 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                Edit Listing
              </h3>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Title
              </label>
              <input
                type="text"
                defaultValue={editItem.title}
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Sub Category
              </label>
              <input
                type="text"
                defaultValue={editItem.subCategory}
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Price
              </label>
              <input
                type="number"
                defaultValue={editItem.price}
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold"
            >
              Save Changes
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserMarketPlace;