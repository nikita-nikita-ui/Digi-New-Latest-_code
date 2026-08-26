import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Star,
  X,
  ShoppingBag,
  DollarSign,
  Eye,
  MapPin,
  Loader2,
  AlertCircle,
  ImageOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Compass,
  Layers,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  updateMarketplaceItemAPI,
  createMarketplaceItemAPI,
} from "../../auth/adminLogin";

const MarketplaceManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    sum: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = await res.json();

          setCurrentItem((prev) => ({
            ...prev,
            location: {
              address: data.display_name || "",
              coordinates: [Number(lat.toFixed(6)), Number(lng.toFixed(6))],
            },
          }));
        } catch (err) {
          console.log(err);
        }
      },
      (err) => console.log(err),
    );
  };

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 5000);
  };

  const fetchMarketplaceData = async (page = currentPage) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://digiapp-node-1.onrender.com/api/admin/items/Items?page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        setItems(result.data);

        setStats({
          total: result.totalItems || 0,
          active: result.activeItems || 0,
          featured: result.featuredItems || 0,
          sum: result.totalPriceSum || 0,
        });

        setTotalItems(result.totalItems || 0);
        setTotalPages(
          result.totalPages ||
            Math.ceil((result.totalItems || 0) / itemsPerPage),
        );
      } else {
        showToast("Failed to load data", "error");
      }
    } catch {
      showToast("Error fetching job list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData(currentPage);
  }, [currentPage]);

  const openEditModal = (item) => {
    setCurrentItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleUpdateConfirm = async () => {
    if (!currentItem) return;

    if (
      !currentItem.title ||
      !currentItem.price ||
      !currentItem.location?.address ||
      !currentItem.location?.coordinates?.[0] ||
      !currentItem.location?.coordinates?.[1]
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (currentItem.preferredCommunication?.call) {
      if (!currentItem.phone || currentItem.phone.length !== 10) {
        showToast("Phone number must be exactly 10 digits", "error");
        return;
      }
    }
    setActionLoading(true);

    try {
      const result = await updateMarketplaceItemAPI(currentItem._id, {
        title: currentItem.title,
        price: currentItem.price,
        isActive: currentItem.isActive,
        isFeatured: currentItem.isFeatured,
        preferredCommunication: currentItem.preferredCommunication,
        images: currentItem.images,
        location: {
          address: currentItem.location?.address,
          coordinates: currentItem.location?.coordinates,
        },
      });
      if (result.success) {
        setItems(
          items.map((item) =>
            item._id === currentItem._id ? result.data : item,
          ),
        );
        setIsEditModalOpen(false);
        setCurrentItem(null);
        showToast("Updated successfully", "success");
      } else {
        alert("Update failed: " + result.message);
      }
    } catch (err) {
      alert("Error updating item: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://digiapp-node-1.onrender.com/api/admin/items/delete/${currentItem._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      if (result.success) {
        setItems(items.filter((item) => item._id !== currentItem._id));
        setIsDeleteModalOpen(false);
        setCurrentItem(null);
        showToast("Deleted successfully", "success");
      } else {
        alert("Failed to delete item: " + result.message);
      }
    } catch (err) {
      alert("Error deleting item: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const handleCreateItem = async () => {
    try {
      const formData = new FormData();

      Object.keys(newItem).forEach((key) => {
        if (key === "images") {
          newItem.images.forEach((img) => {
            formData.append("images", img);
          });
        } else if (key === "location") {
          formData.append("location", JSON.stringify(newItem.location));
        } else if (key === "preferredCommunication") {
          formData.append(key, newItem[key]);
        } else {
          formData.append(key, newItem[key]);
        }
      });

      const result = await createMarketplaceItemAPI(formData);

      if (result.success) {
        setIsAddModalOpen(false);
        setNewItem({});
        fetchMarketplaceData(currentPage);
        showToast("Item created successfully", "success");
      } else {
        showToast(result.message || "Create failed", "error");
      }
    } catch (err) {
      showToast(err.message || "Error creating item", "error");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen font-sans text-slate-800 relative antialiased selection:bg-indigo-500 selection:text-white">
      {toast.visible && (
        <div className="fixed top-6 right-6 z-[1100] animate-bounce-short">
          <div
            className={`flex items-center gap-3.5 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border text-white font-medium text-xs tracking-wide transition-all duration-300 ${
              toast.type === "success"
                ? "bg-slate-900/95 border-emerald-500/30 shadow-emerald-950/10"
                : "bg-slate-900/95 border-rose-500/30 shadow-rose-950/10"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg ${
                toast.type === "success"
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

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <span className="bg-indigo-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-indigo-100/50 inline-flex items-center gap-1.5 mb-2">
            System Administrator
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Marketplace Manager
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">
            Perform administrative listing tasks, monitor telemetry, and assign
            item parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm flex-1 sm:flex-initial">
            <select
              value={
                location.pathname === "/user-marketplace" ? "User" : "Admin"
              }
              onChange={(e) => {
                if (e.target.value === "Admin") {
                  navigate("/Marketplace");
                } else if (e.target.value === "User") {
                  navigate("/user-marketplace");
                }
              }}
              className="w-full bg-transparent text-slate-700 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Admin">Admin View</option>
              <option value="User">User View</option>
            </select>
          </div>

          <button
            onClick={() => fetchMarketplaceData(currentPage)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl shadow-sm transition-all duration-200 active:scale-95 flex-1 sm:flex-initial"
          >
            <RefreshCw
              size={14}
              className={
                loading ? "animate-spin text-indigo-600" : "text-slate-500"
              }
            />
            Refresh
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex-1 sm:flex-initial"
          >
            <Plus size={14} />
            Create Listing
          </button>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 animate-fade-in">
          <StatCard
            title="Total items"
            value={stats.total}
            icon={<ShoppingBag size={18} />}
            gradient="from-indigo-500 to-blue-600"
          />
          <StatCard
            title="Active items"
            value={stats.active}
            icon={<Eye size={18} />}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Featured ads"
            value={stats.featured}
            icon={<Star size={18} className="fill-white/20" />}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            title="Total valuation"
            value={`₹${stats.sum.toLocaleString()}`}
            icon={<DollarSign size={18} />}
            gradient="from-rose-500 to-pink-600"
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm mb-10">
          <div className="relative mb-4">
            <div className="absolute -inset-1 rounded-full bg-indigo-500/10 animate-ping" />
            <Loader2
              size={32}
              className="animate-spin text-indigo-600 relative"
            />
          </div>
          <p className="text-slate-500 text-xs font-semibold">
            Syncing records database...
          </p>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400">
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest w-16 text-center">
                    #
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest">
                    Listing Item Detail
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest">
                    Category Tag
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest">
                    Asking Price
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-center">
                    Promoted
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-center">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/30 transition-colors duration-150 group"
                  >
                    <td className="p-5 text-xs font-bold text-slate-400 text-center">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="p-5 max-w-sm">
                      <div className="flex gap-4 items-center">
                        {item.images && item.images.length > 0 ? (
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 flex-shrink-0">
                            <img
                              src={item.images[0]}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              alt=""
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                            <ImageOff size={16} />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-bold text-slate-800 text-sm leading-snug tracking-tight">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1.5 font-semibold">
                            <MapPin size={11} className="text-indigo-400" />{" "}
                            {item.location?.address ||
                              "No Coordinates Assigned"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-indigo-100/50">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-5 text-xs font-extrabold text-slate-800">
                      ₹{item.price.toLocaleString()}
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
                        className={`text-[9px] font-bold px-3 py-1.5 rounded-xl tracking-widest inline-block uppercase ${
                          item.isActive
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
                          onClick={() => openEditModal(item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all duration-200 shadow-sm"
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
            {items.length === 0 && (
              <div className="p-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Layers size={36} className="text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-500 mt-2">
                  Zero Listings Found
                </p>
                <p className="text-[10px] text-slate-400 max-w-xs">
                  There are currently no items available inside the marketplace
                  storehouse.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-white border-t border-slate-100 gap-4">
            <p className="text-xs font-semibold text-slate-400">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfFirstItem + items.length, totalItems)} of{" "}
              {totalItems} listings
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-1 transition-all duration-150"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-150 ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "hover:bg-slate-100 text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-all duration-150"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && currentItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform scale-100 transition-all duration-300">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Update Marketplace Listing
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Adjust credentials, status, and tracking info
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Item Title
                </label>
                <input
                  type="text"
                  value={currentItem.title || ""}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={currentItem.price || ""}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Status
                  </label>
                  <select
                    value={currentItem.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Promote Listing
                  </label>
                  <select
                    value={currentItem.isFeatured ? "true" : "false"}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        isFeatured: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="true">Featured (Star Icon)</option>
                    <option value="false">Standard Listing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Contact Channel
                  </label>
                  <input
                    type="text"
                    value={currentItem.preferredCommunication || ""}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        preferredCommunication: e.target.value,
                      })
                    }
                    placeholder="e.g. Call, Chat"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  📍 Fetch Current Location
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Listing Location Address
                </label>
                <input
                  type="text"
                  value={currentItem.location?.address || ""}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      location: {
                        ...currentItem.location,
                        address: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={currentItem.location?.coordinates?.[0] || ""}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        location: {
                          ...currentItem.location,
                          coordinates: [
                            e.target.value,
                            currentItem.location?.coordinates?.[1] || "",
                          ],
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={currentItem.location?.coordinates?.[1] || ""}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        location: {
                          ...currentItem.location,
                          coordinates: [
                            currentItem.location?.coordinates?.[0] || "",
                            e.target.value,
                          ],
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Update Listing Image Preview
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-3xl hover:border-indigo-500 transition-all duration-200">
                  <div className="space-y-1 text-center">
                    <div className="flex text-xs text-slate-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Click to upload new image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const imageUrl = URL.createObjectURL(file);
                              setCurrentItem({
                                ...currentItem,
                                images: [imageUrl],
                              });
                            }
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      JPEG, PNG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-3 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl font-bold text-xs transition-colors bg-white"
              >
                Discard
              </button>
              <button
                onClick={handleUpdateConfirm}
                disabled={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md shadow-indigo-500/10 flex items-center gap-2 disabled:opacity-70"
              >
                {actionLoading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Save Modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform scale-100 transition-all duration-300">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Register New Marketplace Entry
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Configure details, upload files, and allocate location
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Item Title
                </label>
                <input
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Item Description Details
                </label>
                <textarea
                  placeholder="e.g. Gently used audio headsets with original boxing and charge brick..."
                  rows={2}
                  onChange={(e) =>
                    setNewItem({ ...newItem, details: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Category
                  </label>
                  <input
                    placeholder="e.g. Electronics"
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Sub-category
                  </label>
                  <input
                    placeholder="e.g. Audio Gadgets"
                    onChange={(e) =>
                      setNewItem({ ...newItem, subCategory: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Geographic Address Info
                </label>
                <div className="flex gap-2">
                  <input
                    placeholder="Provide a valid marketplace address"
                    value={newItem.location?.address || ""}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        location: {
                          ...newItem.location,
                          address: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-bold hover:bg-indigo-100 transition-all duration-200 flex items-center gap-1.5 border border-indigo-100"
                  >
                    <Compass size={14} /> Fetch Coordinates
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Latitude Coordinates
                  </label>
                  <input
                    placeholder="e.g. 28.6139"
                    value={newItem.location?.coordinates?.[0] || ""}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Longitude Coordinates
                  </label>
                  <input
                    placeholder="e.g. 77.2090"
                    value={newItem.location?.coordinates?.[1] || ""}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Preference
                  </label>
                  <select
                    value={
                      currentItem?.preferredCommunication?.call
                        ? "call"
                        : currentItem?.preferredCommunication?.chat
                          ? "chat"
                          : ""
                    }
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        preferredCommunication: {
                          call: e.target.value === "call",
                          chat: e.target.value === "chat",
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
                  >
                    <option value="">Select Mode</option>
                    <option value="call">Call (Phone Required)</option>
                    <option value="chat">Chat Only</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter 10-digit phone number"
                    value={currentItem.phone || ""}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        phone: e.target.value,
                      })
                    }
                    className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Status Flag
                  </label>
                  <select
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="true">Active State</option>
                    <option value="false">Inactive State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Placement
                  </label>
                  <select
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        isFeatured: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="true">Featured Listing</option>
                    <option value="false">Normal Listing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Attach Image Attachment
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-3xl hover:border-emerald-500 transition-all duration-200">
                  <div className="space-y-1 text-center">
                    <div className="flex text-xs text-slate-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-semibold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                        <span>Click to attach asset image file</span>
                        <input
                          type="file"
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              images: [e.target.files[0]],
                            })
                          }
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      JPEG, PNG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-3 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl font-bold text-xs transition-colors bg-white"
              >
                Discard
              </button>
              <button
                onClick={handleCreateItem}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md shadow-emerald-500/10"
              >
                Register Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && currentItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 transform scale-100 transition-all duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Confirm Listing Removal
              </h2>
              <p className="text-slate-500 text-xs mt-2 px-2 leading-relaxed">
                Are you completely sure you want to permanently remove item{" "}
                <strong className="text-slate-800">
                  "{currentItem.title}"
                </strong>
                ? This action is non-reversible.
              </p>
            </div>
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-rose-500/15"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Confirm Destructive Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading}
                className="w-full bg-white border border-slate-200 text-slate-500 py-3.5 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Abstain Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient }) => {
  return (
    <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-300`}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${gradient} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceManager;
