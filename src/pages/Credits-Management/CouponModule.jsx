import React, { useState, useEffect } from "react";
import {
  getAllCouponsAPI,
  createCouponAPI,
  searchCouponAPI,
  deleteCouponAPI,
  updateCouponAPI,
} from "../../auth/credit";
import CouponDetailsModal from "../../components/CouponDetailsModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Tag,
  PlusCircle,
  Percent,
  Calendar,
  Users,
  Search,
  Copy,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function Coupon() {
  const [coupons, setCoupons] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    credits: "",
    expiry: "2026-12-31",
    limit: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [editCouponData, setEditCouponData] = useState({
    id: "",
    code: "",
    credits: "",
    expiry: "",
    limit: "",
  });

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getAllCouponsAPI();
        if (response && response.success) {
          setCoupons(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCoupons();
  }, []);

  const handleSearchCoupon = async (value) => {
    setSearchTerm(value);
    try {
      if (!value.trim()) {
        const response = await getAllCouponsAPI();
        setCoupons(response.data);
        return;
      }
      const response = await searchCouponAPI(value);
      if (response?.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.credits || !newCoupon.expiry) {
      toast.error("Please fill out all required fields.");
      return;
    }
    try {
      const payload = {
        code: newCoupon.code.toUpperCase().trim(),
        credits: Number(newCoupon.credits),
        expiryDate: newCoupon.expiry,
        usageLimit: Number(newCoupon.limit) || 100,
      };
      const response = await createCouponAPI(payload);
      if (response?.success) {
        setCoupons((prev) => [...prev, response.data]);
        setNewCoupon({
          code: "",
          credits: "",
          expiry: "2026-12-31",
          limit: "",
        });
        toast.success("Coupon created successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to create coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
  };

  const openDeleteModal = (coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    try {
      const response = await deleteCouponAPI(couponToDelete.id);
      if (response?.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
        if (appliedCoupon && appliedCoupon._id === couponToDelete._id) {
          handleRemoveCoupon();
        }
        toast.success(response.message || "Coupon deleted successfully!");
        setIsDeleteModalOpen(false);
        setCouponToDelete(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to delete coupon");
    }
  };

  const openEditModal = (coupon) => {
    setEditCouponData({
      id: coupon.id,
      code: coupon.code,
      credits: coupon.credits,
      expiry: coupon.expiry,
      limit: coupon.limit,
    });
    setIsEditModalOpen(true);
  };

  const openCouponDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: editCouponData.code.toUpperCase().trim(),
      };
      const response = await updateCouponAPI(editCouponData.id, payload);
      if (response?.success) {
        setCoupons((prev) =>
          prev.map((coupon) =>
            coupon.id === editCouponData.id
              ? { ...coupon, code: payload.code }
              : coupon,
          ),
        );
        toast.success(response.message || "Coupon updated successfully!");
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to update coupon");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfc] p-4 md:p-8 text-slate-800 font-sans m-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Admin Coupon Dashboard
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Manage, search, and distribute promotional coupon campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5 flex items-center gap-2">
              <PlusCircle size={16} className="text-indigo-600" />
              Create Coupon Code
            </h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                  Coupon Code *
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="e.g. SUMMER30"
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, code: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                    Credits Amount *
                  </label>
                  <div className="relative">
                    <Percent
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={newCoupon.credits}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, credits: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                    Usage Limit
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={newCoupon.limit}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, limit: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                  <input
                    type="date"
                    value={newCoupon.expiry}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, expiry: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 mt-4"
              >
                Create Coupon Now
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Tag size={16} className="text-indigo-600" />
                Available Offers
              </h2>
              <div className="relative w-full sm:w-72">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search code..."
                  value={searchTerm}
                  onChange={(e) => handleSearchCoupon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  onClick={() => openCouponDetails(coupon)}
                  className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex justify-between items-center z-10">
                    <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      {coupon.code}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await navigator.clipboard.writeText(coupon.code);
                            setCouponCodeInput(coupon.code);
                            toast.success("Coupon code copied!");
                          } catch {
                            toast.error("Failed to copy code");
                          }
                        }}
                        className="p-2 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200/50 shadow-sm transition-all duration-150"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(coupon);
                        }}
                        className="p-2 bg-white text-slate-800 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-200/50 shadow-sm transition-all duration-150"
                      >
                        <Edit size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(coupon);
                        }}
                        className="p-2 bg-white text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-slate-200/50 shadow-sm transition-all duration-150"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-dashed border-slate-200/80 pt-3.5 text-xs text-slate-500 z-10">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">
                        Allocated Credits
                      </span>
                      <span className="font-bold text-slate-700">
                        {coupon.credits} Credits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">
                        Total Usage
                      </span>
                      <span className="font-bold text-slate-700">
                        {coupon.totalUsed || 0} / {coupon.limit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">
                        Validity Limit
                      </span>
                      <span className="font-bold text-slate-700">
                        {new Date(coupon.expiry).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-50/20 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                </div>
              ))}
              {coupons.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 text-xs">
                  No promotional campaigns active currently
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Delete Coupon Posting
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Are you sure you want to delete campaign{" "}
              <strong>{couponToDelete?.code}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl font-semibold text-xs transition-colors duration-150 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCoupon}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors duration-150"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-850">
                Edit Active Coupon
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={editCouponData.code}
                  onChange={(e) =>
                    setEditCouponData({
                      ...editCouponData,
                      code: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl font-semibold text-xs transition-colors bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <CouponDetailsModal
        isOpen={isDetailsModalOpen}
        coupon={selectedCoupon}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCoupon(null);
        }}
      />
    </div>
  );
}
