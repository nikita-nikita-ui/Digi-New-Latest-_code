import React from "react";
import { X, Compass } from "lucide-react";

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
    // HANDLE LOCATION
    // ============================================================
    const handleLocation = () => {
        getCurrentLocation(setNewItem);
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
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-100">

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

                                    const selectedCategory = categories?.find(
                                        (category) => category._id === categoryId
                                    );

                                    handleChange("category", categoryId);

                                    // Category change hote hi subcategory reset
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
              FETCH CURRENT LOCATION
          ==================================================== */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={handleLocation}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs border border-indigo-100 transition-all duration-200"
                        >
                            <Compass size={15} />
                            Fetch Current Coordinates
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

                            {/* CALL */}
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

                            {/* CHAT */}
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
                            <option value="true">
                                Active
                            </option>

                            <option value="false">
                                Inactive
                            </option>
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
                            <option value="false">
                                Normal Listing
                            </option>

                            <option value="true">
                                Featured Listing
                            </option>
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

                    {/* DISCARD */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all duration-200"
                    >
                        Discard
                    </button>

                    {/* REGISTER */}
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