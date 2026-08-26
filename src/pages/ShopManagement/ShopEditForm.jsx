import React, { useState, useEffect } from "react";
import {
    CheckCircle, User, Info, AlertCircle,
    Pencil, Loader2, MapPin
} from 'lucide-react';
import { updateBusinessDetailsAPI } from "../../auth/adminLogin";
import Select from "react-select";
const ShopEditForm = ({ shopData, users, categories, onClose }) => {

    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────
    const [editFormData, setEditFormData] = useState({
        userId: shopData?.userId?._id || shopData?.userId || "",
        businessName: shopData?.businessName || "",
        details: shopData?.details || "",
        category: shopData?.category || "",
        locationAddress: shopData?.location?.address || "",
        ownerName: shopData?.ownerName || "",
        mobileNumber: shopData?.mobileNumber || "",
        whatsappNumber: shopData?.whatsappNumber || "",
        latitude: shopData?.location?.coordinates?.[1] || "",
        longitude: shopData?.location?.coordinates?.[0] || "",
    });

    const [formFiles, setFormFiles] = useState({
        businessImages: [],
        nationalIdImage: null,
        ownerImage: null,
    });

    const [previews, setPreviews] = useState({
        businessImages: [],
        nationalIdImage: null,
        ownerImage: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingGps, setIsFetchingGps] = useState(false);

    // Full-screen modal  →  sirf Update result ke liye
    const [modal, setModal] = useState({ show: false, message: "", type: "success" });

    // Bottom toast  →  sirf GPS fetch ke liye (modal KABHI close nahi karta)
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    // ─────────────────────────────────────────────
    // CLEANUP OBJECT URLs
    // ─────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (previews.nationalIdImage) URL.revokeObjectURL(previews.nationalIdImage);
            if (previews.ownerImage) URL.revokeObjectURL(previews.ownerImage);
            previews.businessImages.forEach(u => URL.revokeObjectURL(u));
        };
    }, [previews]);

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    const showModal = (message, type = "success") => {
        setModal({ show: true, message, type });

        if (type === "success") {
            // 👇 instantly close + refresh
            if (onClose) onClose();
        }

        setTimeout(() => {
            setModal({ show: false, message: "", type: "success" });
        }, 1500);
    };

    /** Chhota bottom toast — modal se bilkul alag, onClose() nahi */
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
    };

    // ─────────────────────────────────────────────
    // GPS FETCH  (toast only, modal NEVER closes)
    // ─────────────────────────────────────────────
    const handleFetchLocation = () => {
        if (!("geolocation" in navigator)) {
            showToast("Geolocation not supported", "error");
            return;
        }
        setIsFetchingGps(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                setEditFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
                    );
                    const data = await res.json();
                    if (data?.display_name) {
                        setEditFormData(prev => ({
                            ...prev,
                            locationAddress: data.display_name,
                        }));
                        showToast("📍 Location fetched successfully!", "success"); // ✅ SIRF TOAST
                    }
                } catch {
                    showToast("GPS ok, address lookup failed", "error");
                } finally {
                    setIsFetchingGps(false);
                }
            },
            (err) => {
                setIsFetchingGps(false);
                showToast("Location error: " + err.message, "error");
            }
        );
    };

    // ─────────────────────────────────────────────
    // INPUT HANDLERS
    // ─────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "userId") {
            const found = users.find(u => u._id === value);
            setEditFormData(prev => ({
                ...prev,
                userId: value,
                ownerName: found ? (found.fullName || found.name || "") : "",
            }));
        } else {
            setEditFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, field) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (field === "businessImages") {
            const arr = Array.from(files);
            setFormFiles(prev => ({ ...prev, businessImages: arr }));
            setPreviews(prev => ({ ...prev, businessImages: arr.map(f => URL.createObjectURL(f)) }));
        } else {
            const file = files[0];
            setFormFiles(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
    };

    const fileLabel = (field) => {
        if (field === "businessImages")
            return formFiles.businessImages.length > 0
                ? `${formFiles.businessImages.length} New File(s)`
                : "Upload Gallery";
        return formFiles[field] ? "Change File" : "Upload File";
    };

    // ─────────────────────────────────────────────
    // SUBMIT  →  FormData mapped exactly as backend expects
    // ─────────────────────────────────────────────
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const fd = new FormData();

        // ── Flat fields ──
        fd.append("businessName", editFormData.businessName);
        fd.append("details", editFormData.details);
        fd.append("category", editFormData.category);
        fd.append("ownerName", editFormData.ownerName);
        fd.append("mobileNumber", editFormData.mobileNumber);
        fd.append("whatsappNumber", editFormData.whatsappNumber);

        // ── Location object  (backend expects location[type], location[coordinates][0], etc.) ──
        fd.append("location[type]", "Point");
        fd.append("location[coordinates][0]", editFormData.longitude);   // lng = index 0
        fd.append("location[coordinates][1]", editFormData.latitude);    // lat = index 1
        fd.append("location[address]", editFormData.locationAddress);

        // ── Files ──
        if (formFiles.businessImages.length > 0)
            formFiles.businessImages.forEach(file => fd.append("businessImages", file));

        if (formFiles.nationalIdImage)
            fd.append("nationalIdImage", formFiles.nationalIdImage);

        if (formFiles.ownerImage)
            fd.append("ownerImage", formFiles.ownerImage);

        try {
            const response = await updateBusinessDetailsAPI(shopData._id, fd);

            // ✅ Strict success check — response.success must be explicitly true
            if (response && response.success === true) {

                // ✅ UPDATE UI STATE WITH NEW DATA
                const updated = response.data;

                setEditFormData({
                    userId: updated.userId,
                    businessName: updated.businessName,
                    details: updated.details,
                    category: updated.category,
                    locationAddress: updated.location?.address,
                    ownerName: updated.ownerName,
                    mobileNumber: updated.mobileNumber,
                    whatsappNumber: updated.whatsappNumber,
                    latitude: updated.location?.coordinates?.[1],
                    longitude: updated.location?.coordinates?.[0],
                });
                if (onClose) onClose(true);
                showModal("Business Updated Successfully!", "success");
                setTimeout(() => {
                    if (onClose) onClose(true);
                }, 1500);
            }
            else {
                // API returned 200 but success=false
                showModal(response?.message || "Update failed. Please try again.", "error");
            }
        } catch (error) {
            showModal(error?.message || "Something went wrong!", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────
    return (
        <form onSubmit={handleUpdateSubmit} className="space-y-8 relative min-h-[500px] pb-10">

            {/* ── Full-screen modal (Update result only) ── */}
            {modal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-white/20">
                    <div className={`flex flex-col items-center gap-3 px-10 py-8 rounded-3xl shadow-2xl border
                        ${modal.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
                        {modal.type === 'success'
                            ? <CheckCircle size={50} />
                            : <AlertCircle size={50} />}
                        <h4 className="text-xl font-black uppercase tracking-widest">
                            {modal.type === 'success' ? 'Successful' : 'Error'}
                        </h4>
                        <p className="font-bold text-sm opacity-90">{modal.message}</p>
                    </div>
                </div>
            )}

            {/* ── Bottom toast (GPS fetch only — NEVER closes modal) ── */}
            {toast.show && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
                    <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-bold
                        ${toast.type === 'success' ? 'bg-slate-800' : 'bg-rose-600'}`}>
                        {toast.type === 'success'
                            ? <MapPin size={15} />
                            : <AlertCircle size={15} />}
                        {toast.message}
                    </div>
                </div>
            )}

            {/* ── Submitting overlay ── */}
            {isSubmitting && !modal.show && (
                <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                    <div className="flex flex-col items-center bg-white px-8 py-5 rounded-2xl shadow-xl border border-slate-100">
                        <Loader2 className="animate-spin text-amber-600 mb-2" size={35} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">
                            Updating Database...
                        </span>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
                FORM FIELDS
            ═══════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* ── Ownership ── */}
                <div className="col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 border-b border-slate-100 pb-2">
                        <User size={16} strokeWidth={3} />
                        <h4 className="text-[10px] font-black uppercase tracking-[2px]">Ownership Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            options={users.map(u => ({
                                label: u.fullName || u.name,
                                value: u._id
                            }))}
                            value={
                                editFormData.userId
                                    ? {
                                        label: users.find(u => u._id === editFormData.userId)?.fullName || users.find(u => u._id === editFormData.userId)?.name,
                                        value: editFormData.userId
                                    }
                                    : null
                            }
                            onChange={(selected) => {
                                const found = users.find(u => u._id === selected.value);
                                setEditFormData(prev => ({
                                    ...prev,
                                    userId: selected.value,
                                    ownerName: found ? (found.fullName || found.name || "") : ""
                                }));
                            }}
                            placeholder="Choose User"
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                menu: (base) => ({ ...base }),
                                menuList: (base) => ({
                                    ...base,
                                    maxHeight: 150,
                                    overflowY: "auto"
                                })
                            }}
                        />
                        <input
                            type="text" name="ownerName" placeholder="Owner Name" required
                            value={editFormData.ownerName} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white"
                        />
                    </div>
                </div>

                {/* ── Business Info ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Info size={16} strokeWidth={3} />
                        <h4 className="text-[10px] font-black uppercase tracking-[2px]">Business Basic Info</h4>
                    </div>
                    <input
                        type="text" name="businessName" placeholder="Business Name" required
                        value={editFormData.businessName} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white"
                    />
                    <Select
                        options={categories.map(cat => ({
                            label: cat,
                            value: cat
                        }))}
                        value={
                            editFormData.category
                                ? { label: editFormData.category, value: editFormData.category }
                                : null
                        }
                        onChange={(selected) =>
                            setEditFormData(prev => ({
                                ...prev,
                                category: selected.value
                            }))
                        }
                        placeholder="Select Category"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            menu: (base) => ({ ...base }),
                            menuList: (base) => ({
                                ...base,
                                maxHeight: 150,
                                overflowY: "auto"
                            })
                        }}
                    />
                    <textarea
                        name="details" placeholder="Details..." rows="3" required
                        value={editFormData.details} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white resize-none"
                    />
                </div>

                {/* ── Location & Contact ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-600">
                        <MapPin size={16} strokeWidth={3} />
                        <h4 className="text-[10px] font-black uppercase tracking-[2px]">Location & Contact</h4>
                    </div>

                    {/* GPS Button */}
                    <button
                        type="button"
                        onClick={handleFetchLocation}
                        disabled={isFetchingGps}
                        className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isFetchingGps
                            ? <><Loader2 size={14} className="animate-spin" /> Fetching...</>
                            : <><MapPin size={14} /> Fetch GPS & Address</>}
                    </button>

                    {/* Show fetched lat/lng (read-only display) */}
                    {editFormData.latitude && editFormData.longitude && (
                        <div className="flex gap-2">
                            <input
                                readOnly value={`Lat: ${Number(editFormData.latitude).toFixed(6)}`}
                                className="w-1/2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 cursor-default"
                            />
                            <input
                                readOnly value={`Lng: ${Number(editFormData.longitude).toFixed(6)}`}
                                className="w-1/2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 cursor-default"
                            />
                        </div>
                    )}

                    {/* Contact numbers */}
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="tel" name="mobileNumber" placeholder="Mobile" required
                            value={editFormData.mobileNumber} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                        <input
                            type="tel" name="whatsappNumber" placeholder="WhatsApp" required
                            value={editFormData.whatsappNumber} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                    </div>

                    {/* Address (auto-filled by GPS or manual) */}
                    <input
                        type="text" name="locationAddress"
                        placeholder="Full Address (auto-filled or type manually)" required
                        value={editFormData.locationAddress} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                </div>

                {/* ── Media ── */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                    {['nationalIdImage', 'ownerImage', 'businessImages'].map((field) => (
                        <div key={field} className="p-3 bg-white border border-slate-100 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 text-center">
                                {field === 'businessImages' ? 'Business Gallery' : field.replace('Image', ' Image')}
                            </p>
                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-200 relative bg-slate-50">
                                <img
                                    src={
                                        previews[field]
                                            ? (Array.isArray(previews[field]) ? previews[field][0] : previews[field])
                                            : (Array.isArray(shopData[field]) ? shopData[field][0] : shopData[field])
                                    }
                                    className="w-full h-full object-cover"
                                    alt="preview"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-all cursor-pointer">
                                    <Pencil size={18} className="text-white drop-shadow-md" />
                                    <input
                                        type="file"
                                        multiple={field === 'businessImages'}
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, field)}
                                    />
                                </label>
                            </div>
                            <p className="text-[9px] font-bold text-center mt-2 text-amber-600 truncate px-2">
                                {fileLabel(field)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Submit ── */}
                <div className="col-span-2 flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#B45309] hover:bg-[#92400E] text-white px-10 py-3.5 rounded-full font-black text-sm uppercase tracking-wider flex items-center gap-3 shadow-lg shadow-amber-900/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting
                            ? <Loader2 className="animate-spin" size={18} />
                            : <Pencil size={18} />}
                        UPDATE DETAILS
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ShopEditForm;
