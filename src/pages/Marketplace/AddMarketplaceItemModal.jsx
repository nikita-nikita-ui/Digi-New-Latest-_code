import React, { useState, useEffect } from "react";
import { X, Compass, CheckCircle2, AlertCircle } from "lucide-react";

const AddMarketplaceItemModal = ({
    isAddModalOpen,
    setIsAddModalOpen,
    newItem,
    setNewItem,
    getCurrentLocation,
    handleCreateItem,
    categories,
    loadingCategories, users,
    loadingUsers,
}) => {
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    if (!isAddModalOpen) {
        return null;
    }

    const handleChange = (field, value) => {
        setNewItem((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // ============================================================
    // HANDLE LOCATION + COORDINATES (address + lat/long dono)
    // ============================================================
    const handleLocation = () => {
        if (!navigator.geolocation) {
            setToast({ type: "error", message: "Geolocation is not supported by your browser." });
            return;
        }

        setFetchingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // update coordinates immediately
                setNewItem((prev) => ({
                    ...prev,
                    location: {
                        ...(prev.location || {}),
                        coordinates: [longitude, latitude],
                    },
                }));

                // try to get readable address via reverse geocoding
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await res.json();
                    const address = data?.display_name || "";

                    setNewItem((prev) => ({
                        ...prev,
                        location: {
                            ...(prev.location || {}),
                            coordinates: [longitude, latitude],
                            address: address || prev.location?.address || "",
                        },
                    }));

                    setToast({
                        type: "success",
                        message: "Location, address and coordinates fetched successfully!",
                    });
                } catch (err) {
                    // even if address fetch fails, coordinates are already set
                    setToast({
                        type: "success",
                        message: "Coordinates fetched. Address lookup failed, please enter manually.",
                    });
                } finally {
                    setFetchingLocation(false);
                }

                // agar parent se bhi getCurrentLocation function pass hua ho, use bhi call kar do
                if (typeof getCurrentLocation === "function") {
                    getCurrentLocation(setNewItem);
                }
            },
            (error) => {
                setFetchingLocation(false);
                setToast({
                    type: "error",
                    message: "Unable to fetch location. Please allow location access.",
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // ============================================================
    // CLOSE MODAL
    // ============================================================
    const handleClose = () => {
        setIsAddModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">

            {/* ========================================================
          MODAL CONTAINER
      ======================================================== */}
            <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-100">

                {/* ======================================================
            TOAST (top of popup)
        ====================================================== */}
                {toast && (
                    <div
                        className={`absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold border w-[90%] justify-center animate-in fade-in slide-in-from-top-2 ${
                            toast.type === "success"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                        }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle2 size={15} />
                        ) : (
                            <AlertCircle size={15} />
                        )}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* ======================================================
            HEADER
        ====================================================== */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">
                            Register New Marketplace Entry
                        </h2>

                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                            Add a new marketplace listing
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all duration-200"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* ======================================================
            FORM CONTENT
        ====================================================== */}
                <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-145px)]">

                    {/* ====================================================
              TITLE
          ==================================================== */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            Title
                        </label>

                        <input
                            type="text"
                            value={newItem?.title || ""}
                            onChange={(e) =>
                                handleChange("title", e.target.value)
                            }
                            placeholder="Enter marketplace title"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            Details
                        </label>

                        <textarea
                            rows={4}
                            value={newItem?.details || ""}
                            onChange={(e) =>
                                handleChange("details", e.target.value)
                            }
                            placeholder="Enter marketplace details"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            Price
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={newItem?.price ?? 0}
                            onChange={(e) =>
                                handleChange("price", e.target.value)
                            }
                            placeholder="Enter price"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                        {/* CATEGORY */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-2">
                                Category
                            </label>
                            <select
                                value={newItem?.category || ""}
                                onChange={(e) => {
                                    const categoryId = e.target.value;
                                    handleChange("category", categoryId);
                                    handleChange("subCategory", "");
                                }}
                                disabled={loadingCategories}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                            >
                                <option value="">
                                    {loadingCategories
                                        ? "Loading categories..."
                                        : "Select category"}
                                </option>

                                {categories?.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SUB CATEGORY */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-2">
                                Sub-category
                            </label>

                            <select
                                value={newItem?.subCategory || ""}
                                onChange={(e) =>
                                    handleChange("subCategory", e.target.value)
                                }
                                disabled={!newItem?.category}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                            >
                                <option value="">
                                    {!newItem?.category
                                        ? "Select category first"
                                        : "Select sub-category"}
                                </option>

                                {categories
                                    ?.find(
                                        (category) => category._id === newItem?.category
                                    )
                                    ?.subCategory?.map((subCategory, index) => (
                                        <option key={index} value={subCategory}>
                                            {subCategory}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* ====================================================
              LOCATION ADDRESS
          ==================================================== */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            Location Address
                        </label>

                        <input
                            type="text"
                            value={newItem?.location?.address || ""}
                            onChange={(e) =>
                                setNewItem((prev) => ({
                                    ...prev,
                                    location: {
                                        ...(prev.location || {}),
                                        address: e.target.value,
                                    },
                                }))
                            }
                            placeholder="Enter complete address"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    {/* ====================================================
              FETCH CURRENT LOCATION + COORDINATES
          ==================================================== */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={handleLocation}
                            disabled={fetchingLocation}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-60 text-indigo-600 font-bold text-xs border border-indigo-100 transition-all duration-200"
                        >
                            <Compass size={15} className={fetchingLocation ? "animate-spin" : ""} />
                            {fetchingLocation
                                ? "Fetching location..."
                                : "Fetch Current Location & Coordinates"}
                        </button>
                    </div>

                    {/* ====================================================
              LONGITUDE + LATITUDE
          ==================================================== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                        {/* LONGITUDE */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-2">
                                Longitude
                            </label>

                            <input
                                type="text"
                                value={
                                    newItem?.location?.coordinates?.[0] ?? ""
                                }
                                onChange={(e) =>
                                    setNewItem((prev) => ({
                                        ...prev,
                                        location: {
                                            ...(prev.location || {}),
                                            coordinates: [
                                                Number(e.target.value),
                                                prev.location?.coordinates?.[1] || 0,
                                            ],
                                        },
                                    }))
                                }
                                placeholder="Enter longitude"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                            />
                        </div>

                        {/* LATITUDE */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-2">
                                Latitude
                            </label>

                            <input
                                type="text"
                                value={
                                    newItem?.location?.coordinates?.[1] ?? ""
                                }
                                onChange={(e) =>
                                    setNewItem((prev) => ({
                                        ...prev,
                                        location: {
                                            ...(prev.location || {}),
                                            coordinates: [
                                                prev.location?.coordinates?.[0] || 0,
                                                Number(e.target.value),
                                            ],
                                        },
                                    }))
                                }
                                placeholder="Enter latitude"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* ====================================================
              PREFERRED COMMUNICATION
          ==================================================== */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            Preferred Communication
                        </label>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={
                                        newItem?.preferredCommunication?.call || false
                                    }
                                    onChange={(e) =>
                                        setNewItem((prev) => ({
                                            ...prev,
                                            preferredCommunication: {
                                                ...(prev.preferredCommunication || {}),
                                                call: e.target.checked,
                                            },
                                        }))
                                    }
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">
                                    Call
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={
                                        newItem?.preferredCommunication?.chat || false
                                    }
                                    onChange={(e) =>
                                        setNewItem((prev) => ({
                                            ...prev,
                                            preferredCommunication: {
                                                ...(prev.preferredCommunication || {}),
                                                chat: e.target.checked,
                                            },
                                        }))
                                    }
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">
                                    Chat
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* ====================================================
              ACTIVE STATUS
          ==================================================== */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            Active Status
                        </label>

                        <select
                            value={
                                newItem?.isActive === false
                                    ? "false"
                                    : "true"
                            }
                            onChange={(e) =>
                                setNewItem((prev) => ({
                                    ...prev,
                                    isActive: e.target.value === "true",
                                }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {/* ====================================================
              FEATURED
          ==================================================== */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            Featured
                        </label>

                        <select
                            value={
                                newItem?.isFeatured
                                    ? "true"
                                    : "false"
                            }
                            onChange={(e) =>
                                setNewItem((prev) => ({
                                    ...prev,
                                    isFeatured: e.target.value === "true",
                                }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        >
                            <option value="false">Normal Listing</option>
                            <option value="true">Featured Listing</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-2">
                            User
                        </label>

                        <select
                            value={newItem?.userid || ""}
                            onChange={(e) =>
                                handleChange("userid", e.target.value)
                            }
                            disabled={loadingUsers}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        >
                            <option value="">
                                {loadingUsers ? "Loading users..." : "Select user"}
                            </option>

                            {users?.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* ======================================================
            FOOTER
        ====================================================== */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all duration-200"
                    >
                        Discard
                    </button>

                    <button
                        type="button"
                        onClick={handleCreateItem}
                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-95"
                    >
                        Register Entry
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddMarketplaceItemModal;