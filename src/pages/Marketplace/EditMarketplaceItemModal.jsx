import React from "react";
import { X, Loader2, Compass ,ChevronDown ,} from "lucide-react";

const EditMarketplaceItemModal = ({
    isEditModalOpen,
    setIsEditModalOpen,
    currentItem,
    setCurrentItem,
    handleUpdateConfirm,
    actionLoading,
    getCurrentLocation,
    categories,
    loadingCategories,
    users,
    loadingUsers,
}) => {
    if (!isEditModalOpen || !currentItem) {
        return null;
    }

    const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

const selectedUserName = users?.find(
    (u) => u._id === (currentItem.userid || currentItem.user?._id)
)?.fullName;
    const handleChange = (field, value) => {
        setCurrentItem((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleClose = () => {
        setIsEditModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">

                {/* HEADER */}
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
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">

                    {/* TITLE */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Item Title
                        </label>
                        <input
                            type="text"
                            value={currentItem.title || ""}
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                        />
                    </div>

                    {/* DETAILS */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Item Details
                        </label>
                        <textarea
                            rows={3}
                            value={currentItem.details || ""}
                            onChange={(e) => handleChange("details", e.target.value)}
                            placeholder="Enter marketplace details"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                        />
                    </div>

                    {/* CATEGORY + SUBCATEGORY */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Category
                            </label>
                            <select
                                value={currentItem.category || ""}
                                onChange={(e) => {
                                    const categoryId = e.target.value;
                                    setCurrentItem((prev) => ({
                                        ...prev,
                                        category: categoryId,
                                        subCategory: "",
                                    }));
                                }}
                                disabled={loadingCategories}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none cursor-pointer"
                            >
                                <option value="">
                                    {loadingCategories ? "Loading categories..." : "Select category"}
                                </option>

                                {categories?.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Sub-category
                            </label>
                            <select
                                value={currentItem.subCategory || ""}
                                onChange={(e) => handleChange("subCategory", e.target.value)}
                                disabled={!currentItem.category}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none cursor-pointer"
                            >
                                <option value="">
                                    {!currentItem.category ? "Select category first" : "Select sub-category"}
                                </option>

                                {categories
                                    ?.find((category) => category._id === currentItem.category)
                                    ?.subCategory?.map((subCategory, index) => (
                                        <option key={index} value={subCategory}>
                                            {subCategory}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* PRICE + STATUS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Price (₹)
                            </label>
                            <input
                                type="number"
                                value={currentItem.price || ""}
                                onChange={(e) => handleChange("price", Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Status
                            </label>
                            <select
                                value={currentItem.isActive ? "true" : "false"}
                                onChange={(e) => handleChange("isActive", e.target.value === "true")}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none cursor-pointer"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* FEATURED */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Promote Listing
                        </label>
                        <select
                            value={currentItem.isFeatured ? "true" : "false"}
                            onChange={(e) => handleChange("isFeatured", e.target.value === "true")}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none cursor-pointer"
                        >
                            <option value="true">Featured (Star Icon)</option>
                            <option value="false">Standard Listing</option>
                        </select>
                    </div>

                    {/* PREFERRED COMMUNICATION - matches Add modal (call/chat checkboxes) */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Preferred Communication
                        </label>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentItem.preferredCommunication?.call || false}
                                    onChange={(e) =>
                                        setCurrentItem((prev) => ({
                                            ...prev,
                                            preferredCommunication: {
                                                ...(prev.preferredCommunication || {}),
                                                call: e.target.checked,
                                            },
                                        }))
                                    }
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-semibold text-slate-700">Call</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentItem.preferredCommunication?.chat || false}
                                    onChange={(e) =>
                                        setCurrentItem((prev) => ({
                                            ...prev,
                                            preferredCommunication: {
                                                ...(prev.preferredCommunication || {}),
                                                chat: e.target.checked,
                                            },
                                        }))
                                    }
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-semibold text-slate-700">Chat</span>
                            </label>
                        </div>
                    </div>

                    {/* PHONE - only relevant if call is checked, kept from original validation logic */}
                    {currentItem.preferredCommunication?.call && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Contact Phone Number
                            </label>
                            <input
                                type="text"
                                maxLength={10}
                                value={currentItem.phone || ""}
                                onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                                placeholder="10 digit phone number"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
                            />
                        </div>
                    )}

                    {/* USER - custom dropdown */}
                    <div className="relative">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Assigned User
                        </label>

                        <button
                            type="button"
                            onClick={() => setUserDropdownOpen((prev) => !prev)}
                            disabled={loadingUsers}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none cursor-pointer"
                        >
                            <span className={selectedUserName ? "text-slate-800" : "text-slate-400"}>
                                {loadingUsers
                                    ? "Loading users..."
                                    : selectedUserName || "Select user"}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-slate-400 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {userDropdownOpen && !loadingUsers && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-lg max-h-48 overflow-y-auto">
                                <div
                                    onClick={() => {
                                        handleChange("userid", "");
                                        setUserDropdownOpen(false);
                                    }}
                                    className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-50 cursor-pointer"
                                >
                                    Select user
                                </div>

                                {users?.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => {
                                            handleChange("userid", user._id);
                                            setUserDropdownOpen(false);
                                        }}
                                        className={`px-4 py-2.5 text-xs font-medium hover:bg-indigo-50 cursor-pointer ${(currentItem.userid || currentItem.user?._id) === user._id
                                                ? "bg-indigo-50 text-indigo-600 font-bold"
                                                : "text-slate-700"
                                            }`}
                                    >
                                        {user.fullName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* LOCATION BUTTON */}
                    <div>
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 transition"
                        >
                            <Compass size={15} />
                            Fetch Current Location & Coordinates
                        </button>
                    </div>

                    {/* ADDRESS */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Listing Location Address
                        </label>
                        <input
                            type="text"
                            value={currentItem.location?.address || ""}
                            onChange={(e) =>
                                setCurrentItem((prev) => ({
                                    ...prev,
                                    location: {
                                        ...(prev.location || {}),
                                        address: e.target.value,
                                    },
                                }))
                            }
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
                        />
                    </div>

                    {/* COORDINATES - kept as [longitude, latitude] to match backend/create payload */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Longitude
                            </label>
                            <input
                                type="text"
                                value={currentItem.location?.coordinates?.[0] ?? ""}
                                onChange={(e) =>
                                    setCurrentItem((prev) => ({
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
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Latitude
                            </label>
                            <input
                                type="text"
                                value={currentItem.location?.coordinates?.[1] ?? ""}
                                onChange={(e) =>
                                    setCurrentItem((prev) => ({
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
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
                            />
                        </div>
                    </div>

                    {/* IMAGE */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Update Listing Image Preview
                        </label>

                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-3xl hover:border-indigo-500 transition-all duration-200">
                            <div className="space-y-1 text-center">
                                <div className="flex text-xs text-slate-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                                        <span>Click to upload new image file</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];

                                                if (file) {
                                                    const imageUrl = URL.createObjectURL(file);
                                                    setCurrentItem((prev) => ({
                                                        ...prev,
                                                        images: [imageUrl],
                                                    }));
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

                {/* FOOTER */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-5 py-3 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl font-bold text-xs transition-colors bg-white"
                    >
                        Discard
                    </button>

                    <button
                        onClick={handleUpdateConfirm}
                        disabled={actionLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-70"
                    >
                        {actionLoading && <Loader2 size={14} className="animate-spin" />}
                        Save Modifications
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditMarketplaceItemModal;