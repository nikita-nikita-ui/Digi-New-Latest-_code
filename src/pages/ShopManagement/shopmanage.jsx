import React, { useState, useEffect, useCallback } from "react";
import {
    Search, Eye, Trash2, MapPin, Phone, X,
    Loader2, Image as ImageIcon, AlertCircle,
    CheckCircle, XCircle, ShieldAlert, RefreshCcw, Plus, Upload, User, Info, FileText, AlertTriangle,
    Layers, List, Pencil, Wrench
} from "lucide-react";
import Select from "react-select";
import {
    getAllShopsForAdmin,
    getShopDetailsById,
    deletebusiness,
    toggleBusinessStatusAPI,
    createBusinessForUserAPI,
    addServiceToBusinessAPI,
    getBusinessServicesAPI, getUsersForDropdownAPI,     // New
    getCategoriesForDropdownAPI
} from "../../auth/adminLogin";

import ShopEditForm from "./ShopEditForm";
import ServiceEditForm from "./ServiceEditForm";

const DetailSection = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-l-4 border-indigo-600 pl-3">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
);

const DetailItem = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "col-span-2" : "col-span-1"}>
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700 leading-tight">{value || "N/A"}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const configs = {
        Approved: "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500/20",
        active: "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500/20", // Add this
        Pending: "bg-amber-50 text-amber-600 border-amber-200 ring-emerald-500/20",
        Rejected: "bg-rose-50 text-rose-600 border-rose-200 ring-emerald-500/20",
        Blocked: "bg-slate-100 text-slate-600 border-slate-300 ring-slate-500/10",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ring-2 tracking-wider ${configs[status] || configs.Pending}`}>
            {status === 'active' ? 'Approved' : status}
        </span>
    );
};

const ShopListManagement = () => {
    const [shops, setShops] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [shopDetail, setShopDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [feedback, setFeedback] = useState({ show: false, message: "", type: "success" });

    const [formData, setFormData] = useState({
        userId: "", businessName: "", details: "", category: "",
        location: "", address: "", ownerName: "", mobileNumber: "", whatsappNumber: "",
        latitude: "", longitude: ""
    });

    const [formFiles, setFormFiles] = useState({
        businessImages: [], nationalIdImage: null, ownerImage: null
    });

    const [serviceData, setServiceData] = useState({
        serviceTitle: "",
        serviceDetails: ""
    });
    const [serviceImages, setServiceImages] = useState([]);
    const [businessServices, setBusinessServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);

    const showFeedback = (message, type = "success") => {
        setFeedback({ show: true, message, type });
        if (type === 'success') {
            setTimeout(() => setFeedback({ show: false, message: "", type: "success" }), 3000);
        }
    };
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [uRes, cRes] = await Promise.all([
                    getUsersForDropdownAPI(),
                    getCategoriesForDropdownAPI()
                ]);
                setUsers(uRes.data || []);
                setCategories(cRes.data || []);
            } catch (err) {
                console.error("Dropdown loading failed");
            }
        };
        loadDropdownData();
    }, []);
    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            // Send search and filter to the backend so it searches the WHOLE database
            const response = await getAllShopsForAdmin(currentPage, searchTerm, activeFilter);
            setShops(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (err) {
            showFeedback("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, activeFilter]); // Add these dependencies
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "userId") {
            const selectedUserData = users.find(u => u._id === value);
            const autoName = selectedUserData ? (selectedUserData.fullName || selectedUserData.name || "") : "";
            setFormData(prev => ({ ...prev, userId: value, ownerName: autoName }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleServiceInputChange = (e) => {
        const { name, value } = e.target;
        setServiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        if (field === "businessImages") {
            setFormFiles(prev => ({ ...prev, [field]: Array.from(e.target.files) }));
        } else if (field === "serviceImages") {
            setServiceImages(Array.from(e.target.files));
        } else {
            setFormFiles(prev => ({ ...prev, [field]: e.target.files[0] }));
        }
    };

    const handleFetchLocation = () => {
        if ("geolocation" in navigator) {
            // Step 1: Coordinates fetch karna
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                // Coordinates ko turant set karein
                setFormData(prev => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lon.toString(),
                    location: "Fetching address..." // User ko dikhane ke liye loading text
                }));

                try {
                    // Step 2: Reverse Geocoding API call
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
                        headers: { 'Accept-Language': 'en' }
                    });

                    if (!res.ok) throw new Error("API Error");

                    const data = await res.json();

                    // Step 3: Address extract karna (Different possibilities handle karein)
                    const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "";
                    const suburb = data.address.suburb || data.address.neighbourhood || data.address.road || "";

                    // Agar city/suburb mile toh wo dikhayein, varna pura address string
                    let finalLocation = suburb && city ? `${suburb}, ${city}` : data.display_name;

                    // Agar kuch bhi na mile toh Lat/Long dikha dein
                    if (!finalLocation) finalLocation = `Location at ${lat.toFixed(2)}, ${lon.toFixed(2)}`;

                    setFormData(prev => ({
                        ...prev,
                        location: finalLocation
                    }));

                    showFeedback("Location & Address fetched!");
                } catch (err) {
                    console.error("Address fetch failed:", err);
                    // CATCH BLOCK FIX: Agar API fail ho, toh location field khali mat chhodiye
                    setFormData(prev => ({
                        ...prev,
                        location: "Manual entry required (GPS fixed)"
                    }));
                    showFeedback("Coordinates fetched, but address lookup failed", "error");
                }
            }, (err) => {
                showFeedback("Location permission denied", "error");
            }, { enableHighAccuracy: true });
        } else {
            showFeedback("Geolocation not supported", "error");
        }
    };
    const handleAddShopSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (!formData.latitude || !formData.longitude) return showFeedback("Please fetch GPS location", "error");

        setIsProcessing(true);
        const data = new FormData();

        // Normal Fields
        data.append('userId', formData.userId);
        data.append('businessName', formData.businessName);
        data.append('category', formData.category);
        data.append('details', formData.details);
        data.append('ownerName', formData.ownerName);
        data.append('mobileNumber', formData.mobileNumber);
        data.append('whatsappNumber', formData.whatsappNumber);
        data.append('address', formData.address); // Full Detailed Address field

        // NESTED LOCATION (As per your working Postman response)
        data.append('location[type]', 'Point');
        data.append('location[coordinates][0]', formData.longitude); // Longitude (0)
        data.append('location[coordinates][1]', formData.latitude);  // Latitude (1)
        data.append('location[address]', formData.location);        // Area/City field

        // Files
        if (formFiles.nationalIdImage) data.append('nationalIdImage', formFiles.nationalIdImage);
        if (formFiles.ownerImage) data.append('ownerImage', formFiles.ownerImage);
        formFiles.businessImages.forEach(file => data.append('businessImages', file));

        try {
            const response = await createBusinessForUserAPI(data);
            if (response.success) {
                showFeedback("Shop Registered Successfully!");
                closeModal();
                fetchInitialData();
            }
        } catch (err) {
            showFeedback(err.error || err.message, "error");
        } finally {
            setIsProcessing(false);
        }
    };
    const handleAddServiceSubmit = async (e) => {
        e.preventDefault();
        if (!selectedShop?._id) return showFeedback("Shop ID missing", "error");

        setIsProcessing(true);
        const data = new FormData();
        data.append('serviceTitle', serviceData.serviceTitle);
        data.append('serviceDetails', serviceData.serviceDetails);

        if (serviceImages.length > 0) {
            serviceImages.forEach(file => {
                data.append('serviceImage', file);
            });
        }

        try {
            const response = await addServiceToBusinessAPI(selectedShop._id, data);
            if (response.success) {
                showFeedback("Service added successfully!");
                closeModal();
                fetchInitialData();
            }
        } catch (err) {
            showFeedback(err.message || "Failed to add service", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedShop || !modalType) return;

        const statusToUpdate = modalType === 'approve' ? 'Approved' : 'Rejected';
        setIsProcessing(true);
        try {
            const response = await toggleBusinessStatusAPI(selectedShop._id, statusToUpdate);
            if (response.success) {
                setShops(prev => prev.map(s => s._id === selectedShop._id ? { ...s, status: statusToUpdate } : s));
                showFeedback(`Business ${statusToUpdate} Successfully`);
                closeModal();
            }
        } catch (err) {
            showFeedback(err.message || "Failed to update status", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedShop) return;
        setIsProcessing(true);
        try {
            await deletebusiness(selectedShop._id);
            setShops(prev => prev.filter(s => s._id !== selectedShop._id));
            showFeedback("Shop Deleted Successfully");
            closeModal();
        } catch (err) {
            showFeedback(err.message || "Delete failed", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAction = async (type, shop) => {
        setModalType(type);
        setSelectedShop(shop);
        setIsModalOpen(true);

        if (type === 'view' || type === 'edit') {
            setDetailLoading(true);
            try {
                const result = await getShopDetailsById(shop._id);
                setShopDetail(result.data || result);
                setServicesLoading(true);
                const serviceRes = await getBusinessServicesAPI(shop._id);
                setBusinessServices(serviceRes.data || []);
            } catch (err) {
                showFeedback("Error fetching details", "error");
            } finally {
                setDetailLoading(false);
                setServicesLoading(false);
            }
        }

        if (type === 'editService') {
            setServicesLoading(true);
            try {
                const serviceRes = await getBusinessServicesAPI(shop._id);
                setBusinessServices(serviceRes.data || []);
            } catch (err) {
                showFeedback("Error fetching services", "error");
            } finally {
                setServicesLoading(false);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setShopDetail(null);
        setSelectedShop(null);
        setModalType("");
        setIsProcessing(false);
        setEditingService(null);
        setFormData({
            userId: "", businessName: "", details: "", category: "",
            location: "", address: "", ownerName: "", mobileNumber: "", whatsappNumber: ""
        });
        setFormFiles({ businessImages: [], nationalIdImage: null, ownerImage: null });
        setServiceData({ serviceTitle: "", serviceDetails: "" });
        setServiceImages([]);
        setBusinessServices([]);
        setServicesLoading(false);
    };

    const filteredShops = shops.filter(shop => {
        const matchesSearch = shop.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (activeFilter === "All") return true;

        // Status normalization for filtering
        const currentStatus = (shop.status === "active") ? "Approved" : shop.status;
        return currentStatus === activeFilter;
    });

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans relative">

            {feedback.show && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-rose-600 border-rose-400 text-white'}`}>
                        {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="font-bold text-sm tracking-wide">{feedback.message}</p>
                        <button onClick={() => setFeedback({ ...feedback, show: false })} className="ml-4 opacity-70 hover:opacity-100 transition-opacity"><X size={16} /></button>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Shop Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and verify business listings across the platform</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => { setModalType('add'); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        <Plus size={18} /> Register New Shop
                    </button>
                    <button onClick={fetchInitialData} className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm"><RefreshCcw size={18} /></button>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search businesses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 w-64 md:w-80 transition-all shadow-sm font-medium text-slate-700" />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {["All", "Pending", "Approved", "Rejected"].map((f) => (
                    <button key={f} onClick={() => setActiveFilter(f)} className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${activeFilter === f ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>{f}</button>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest w-12">SNo.</th> {/* Add this */}
                                <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Business Info</th>
                                <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Owner Contact</th>
                                <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Verification</th>
                                <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-24 text-center">...</td></tr>
                            ) : filteredShops.length === 0 ? (
                                <tr><td colSpan="5" className="p-24 text-center">...</td></tr>
                            ) : filteredShops.map((shop, index) => {
                                // CALCULATION: (Current Page - 1) * Items Per Page + (Index + 1)
                                // If your backend sends 10 items per page, use 10.
                                const serialNumber = ((currentPage - 1) * 10) + (index + 1);

                                return (
                                    <tr key={shop._id} className="group hover:bg-slate-50/50 transition-all">
                                        {/* Add this TD first */}
                                        <td className="p-6 text-sm font-bold text-slate-400">
                                            {serialNumber.toString().padStart(2, '0')}
                                        </td>
                                        <td className="p-6">
                                            <div className="text-base font-bold text-slate-900">{shop.businessName}</div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded uppercase">{shop.category}</span>
                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                    <MapPin size={10} />
                                                    {shop.location?.address || shop.address || "N/A"}
                                                </span>                                        </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm font-bold text-slate-700">{shop.ownerName}</div>
                                            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-1"><Phone size={10} className="text-slate-300" /> {shop.mobileNumber}</div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <StatusBadge status={shop.status} />
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-end items-center gap-1">
                                                <button onClick={() => handleAction('addService', shop)} className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="Add Service"><Layers size={18} /></button>
                                                <button onClick={() => handleAction('editService', shop)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit Services"><Wrench size={18} /></button>
                                                <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                                                {shop.status !== 'Approved' && (
                                                    <button onClick={() => handleAction('approve', shop)} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Approve Business"><CheckCircle size={18} /></button>
                                                )}
                                                {shop.status !== 'Rejected' && (
                                                    <button onClick={() => handleAction('reject', shop)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Reject Business"><XCircle size={18} /></button>
                                                )}
                                                <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                                                <button onClick={() => handleAction('view', shop)} className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="View Details"><Eye size={18} /></button>
                                                <button onClick={() => handleAction('edit', shop)} className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Edit Business"><Pencil size={18} /></button>
                                                <button onClick={() => handleAction('delete', shop)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                        Showing Page <span className="text-indigo-600">{currentPage}</span> of <span className="text-slate-600">{totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                        </button>

                        <div className="flex gap-1.5">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Logic to show limited page numbers if totalPages is huge
                                if (totalPages > 5 && Math.abs(currentPage - pageNum) > 2) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${currentPage === pageNum
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            disabled={currentPage === totalPages || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[4px] p-4">
                    <div className={`bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transition-all animate-in zoom-in-95 duration-200 ${['view', 'add', 'addService', 'edit', 'editService'].includes(modalType) ? 'w-full max-w-5xl max-h-[90vh]' : 'w-full max-w-md'}`}>

                        <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-20">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                    {modalType === 'view' ? 'Verify Listing' :
                                        modalType === 'editService' ? `Manage Services: ${selectedShop?.businessName}` :
                                            modalType === 'edit' ? `Edit Listing: ${selectedShop?.businessName}` :
                                                modalType === 'add' ? 'Add New Business' :
                                                    modalType === 'addService' ? `Add Service to ${selectedShop?.businessName}` :
                                                        modalType === 'approve' ? 'Approve Listing' :
                                                            modalType === 'reject' ? 'Reject Listing' : 'Confirm Delete'}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><X size={20} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">

                            {modalType === 'add' && (
                                <form id="addShopForm" onSubmit={handleAddShopSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 overflow-hidden">
                                        <div className="col-span-2 space-y-4">
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <User size={16} strokeWidth={3} />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest">Ownership Details</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Replace old User select with this */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Select User (By Name)</label>
                                                    <Select
                                                        options={users.map(u => ({
                                                            label: u.fullName || u.name,
                                                            value: u._id
                                                        }))}
                                                        value={
                                                            formData.userId
                                                                ? {
                                                                    label: users.find(u => u._id === formData.userId)?.fullName || users.find(u => u._id === formData.userId)?.name,
                                                                    value: formData.userId
                                                                }
                                                                : null
                                                        }
                                                        onChange={(selected) => {
                                                            const found = users.find(u => u._id === selected.value);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                userId: selected.value,
                                                                ownerName: found ? (found.fullName || found.name || "") : ""
                                                            }));
                                                        }}
                                                        placeholder="-- Choose User Name --"
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                            control: (base) => ({
                                                                ...base,
                                                                borderRadius: '0.75rem',
                                                                padding: '2px',
                                                                backgroundColor: '#f8fafc',
                                                                borderColor: '#e2e8f0',
                                                                fontSize: '14px',
                                                                fontWeight: '700'
                                                            }),
                                                            menuList: (base) => ({
                                                                ...base,
                                                                maxHeight: 150,
                                                                overflowY: "auto"
                                                            })
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Legal Owner Name</label>
                                                    <input type="text" name="ownerName" value={formData.ownerName} placeholder="Legal name of the business owner" required onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <Info size={16} strokeWidth={3} />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest">Business Information</h4>
                                            </div>
                                            <div className="space-y-3">
                                                <input type="text" name="businessName" placeholder="Business Name" required onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                                <Select
                                                    options={categories.map(cat => ({
                                                        label: cat,
                                                        value: cat
                                                    }))}
                                                    value={formData.category ? { label: formData.category, value: formData.category } : null}
                                                    onChange={(selected) => {
                                                        setFormData(prev => ({ ...prev, category: selected.value }));
                                                    }}
                                                    placeholder="-- Select Category --"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                        control: (base) => ({
                                                            ...base,
                                                            borderRadius: '0.75rem',
                                                            padding: '2px',
                                                            backgroundColor: '#f8fafc',
                                                            borderColor: '#e2e8f0',
                                                            fontSize: '14px',
                                                            fontWeight: '700'
                                                        }),
                                                        menuList: (base) => ({
                                                            ...base,
                                                            maxHeight: 150,
                                                            overflowY: "auto"
                                                        })
                                                    }}
                                                />
                                                <textarea name="details" placeholder="Brief business details..." rows="3" required onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none"></textarea>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <Phone size={16} strokeWidth={3} />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest">Contact & Address</h4>
                                            </div>

                                            <div className="col-span-2 grid grid-cols-2 gap-4 mt-4">
                                                <input type="text" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                                                <input type="text" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                                                <button type="button" onClick={handleFetchLocation} className="col-span-2 flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-900 text-xs font-bold uppercase tracking-widest">
                                                    Fetch GPS Location
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input type="tel" name="mobileNumber" placeholder="Mobile Number" required onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                                    <input type="tel" name="whatsappNumber" placeholder="WhatsApp Number" required onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    placeholder="Area / City"
                                                    required
                                                    value={formData.location}  // <--- YE ADD KARNA ZAROORI HAI
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                                />                                                <input type="text" name="address" placeholder="Full Detailed Address" required onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <FileText size={16} strokeWidth={3} />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest">Identity & Gallery Documents</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase ml-1">National ID</p>
                                                    <label className="flex flex-col items-center justify-center h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                                                        <Upload size={20} className="text-slate-400 mb-1 group-hover:text-indigo-600" />
                                                        <span className="text-[10px] font-bold text-slate-500">{formFiles.nationalIdImage ? 'File Selected' : 'Upload ID'}</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'nationalIdImage')} />
                                                    </label>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase ml-1">Owner Photo</p>
                                                    <label className="flex flex-col items-center justify-center h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                                                        <User size={20} className="text-slate-400 mb-1 group-hover:text-indigo-600" />
                                                        <span className="text-[10px] font-bold text-slate-500">{formFiles.ownerImage ? 'Photo Selected' : 'Upload Photo'}</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'ownerImage')} />
                                                    </label>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase ml-1">Shop Images</p>
                                                    <label className="flex flex-col items-center justify-center h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                                                        <ImageIcon size={20} className="text-slate-400 mb-1 group-hover:text-indigo-600" />
                                                        <span className="text-[10px] font-bold text-slate-500">{formFiles.businessImages.length > 0 ? `${formFiles.businessImages.length} Files` : 'Upload Gallery'}</span>
                                                        <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'businessImages')} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {modalType === 'edit' && shopDetail && (
                                <ShopEditForm
                                    shopData={selectedShop}
                                    users={users}
                                    categories={categories}
                                    onClose={(shouldRefresh) => {
                                        if (shouldRefresh) {
                                            fetchInitialData(); // ✅ सही फंक्शन कॉल
                                        }
                                        closeModal(); // ✅ सही क्लोज फंक्शन
                                    }}
                                />)}

                            {modalType === 'editService' && (
                                <div className="space-y-6">
                                    {editingService ? (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <button onClick={() => setEditingService(null)} className="mb-4 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">← Back to Services List</button>
                                            <ServiceEditForm serviceData={editingService} shopId={selectedShop?._id} onClose={() => setEditingService(null)} onSuccess={() => { setEditingService(null); handleAction('editService', selectedShop); }} />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {servicesLoading ? (
                                                <div className="col-span-2 py-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
                                            ) : businessServices.length === 0 ? (
                                                <p className="col-span-2 text-center text-slate-500 py-10">No services found for this business.</p>
                                            ) : (
                                                businessServices.map(service => (
                                                    <div key={service._id} className="p-4 border border-slate-200 rounded-2xl flex justify-between items-center bg-slate-50 hover:border-indigo-300 transition-all shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            {service.serviceImages?.[0] && <img src={service.serviceImages[0]} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" alt="" />}
                                                            <div>
                                                                <h5 className="font-bold text-slate-800 text-sm">{service.serviceTitle}</h5>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {service._id.slice(-6)}</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => setEditingService(service)} className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all"><Pencil size={16} /></button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalType === 'addService' && (
                                <form id="addServiceForm" onSubmit={handleAddServiceSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <Layers size={18} strokeWidth={3} />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest">Service Information</h4>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Service Title</label>
                                                    <input type="text" name="serviceTitle" placeholder="e.g. AC Installation & Maintenance" required value={serviceData.serviceTitle} onChange={handleServiceInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Service Details</label>
                                                    <textarea name="serviceDetails" placeholder="Describe what's included in this service..." rows="4" required value={serviceData.serviceDetails} onChange={handleServiceInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <ImageIcon size={18} strokeWidth={3} />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest">Service Gallery</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase ml-1">Upload Work Images (Multiple)</p>
                                                <label className="flex flex-col items-center justify-center h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                                                    <Upload size={24} className="text-slate-400 mb-2 group-hover:text-indigo-600" />
                                                    <span className="text-xs font-bold text-slate-500">{serviceImages.length > 0 ? `${serviceImages.length} Images Selected` : 'Click to upload service photos'}</span>
                                                    <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'serviceImages')} />
                                                </label>
                                                {serviceImages.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {Array.from(serviceImages).map((file, idx) => (
                                                            <div key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold flex items-center gap-2">
                                                                <ImageIcon size={12} /> {file.name.substring(0, 10)}...
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {modalType === 'delete' && (
                                <div className="text-center py-6">
                                    <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="text-rose-500" size={40} /></div>
                                    <h2 className="text-xl font-black text-slate-800 mb-2">Delete Shop?</h2>
                                    <p className="text-slate-500 text-sm px-4">Are you sure you want to remove <span className="font-bold text-slate-900">"{selectedShop?.businessName}"</span>? This action cannot be undone.</p>
                                </div>
                            )}

                            {modalType === 'approve' && (
                                <div className="text-center py-6">
                                    <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="text-emerald-500" size={40} /></div>
                                    <h2 className="text-xl font-black text-slate-800 mb-2">Approve Business?</h2>
                                    <p className="text-slate-500 text-sm px-4">By approving, <span className="font-bold text-slate-900">"{selectedShop?.businessName}"</span> will be visible to all users on the platform.</p>
                                </div>
                            )}

                            {modalType === 'reject' && (
                                <div className="text-center py-6">
                                    <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="text-amber-500" size={40} /></div>
                                    <h2 className="text-xl font-black text-slate-800 mb-2">Reject Business?</h2>
                                    <p className="text-slate-500 text-sm px-4">Are you sure you want to reject <span className="font-bold text-slate-900">"{selectedShop?.businessName}"</span>? The owner will need to re-submit details.</p>
                                </div>
                            )}

                            {modalType === 'view' && (
                                detailLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading business profile...</p>
                                    </div>
                                ) : shopDetail ? (
                                    <div className="space-y-10">
                                        <div className="relative h-60 w-full rounded-3xl overflow-hidden shadow-lg bg-slate-200">
                                            <img src={shopDetail.businessImages?.[0] || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="Banner" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-6 left-6 flex items-end gap-5">
                                                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white"><img src={shopDetail.ownerImage} className="w-full h-full object-cover" alt="Owner" /></div>
                                                <div className="mb-1 text-white">
                                                    <h2 className="text-3xl font-black">{shopDetail.businessName}</h2>
                                                    <p className="text-indigo-200 font-bold text-[10px] uppercase tracking-widest">{shopDetail.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-10">
                                                <DetailSection title="Core Information">
                                                    <DetailItem label="Representative" value={shopDetail.ownerName} />
                                                    <DetailItem label="Contact No." value={shopDetail.mobileNumber} />
                                                    <DetailItem label="WhatsApp" value={shopDetail.whatsappNumber} />
                                                    {/* Update this: */}
                                                    <DetailItem label="Location" value={shopDetail.location?.address || shopDetail.location} />
                                                    <DetailItem label="Full Address" value={shopDetail.address || shopDetail.location?.address} fullWidth />
                                                    <DetailItem label="Description" value={shopDetail.details} fullWidth />
                                                </DetailSection>
                                                <DetailSection title="Documents Preview">
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Govt ID Proof</p>
                                                        <img src={shopDetail.nationalIdImage} className="rounded-2xl border border-slate-200 w-full h-48 object-cover shadow-sm" alt="ID" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portrait</p>
                                                        <img src={shopDetail.ownerImage} className="rounded-2xl border border-slate-200 w-full h-48 object-cover shadow-sm" alt="Owner" />
                                                    </div>
                                                </DetailSection>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                                                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Gallery Showcase</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {shopDetail.businessImages?.map((img, i) => (
                                                            <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm"><img src={img} className="w-full h-full object-cover" alt="Gallery" /></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-[2rem] shadow-lg border border-indigo-100 p-6">
                                            <h4 className="text-xl font-black text-indigo-700 mb-5 flex items-center gap-2 border-b pb-3"><List size={22} /> All Services ({businessServices.length})</h4>
                                            {servicesLoading ? <div className="flex justify-center items-center py-10"><Loader2 className="animate-spin text-indigo-500" size={30} /></div> : businessServices.length === 0 ? <p className="text-center text-slate-500 font-medium italic py-10">No services listed for this business yet.</p> : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {businessServices.map(service => (
                                                        <div key={service._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-slate-50">
                                                            <h5 className="text-lg font-bold text-slate-800 mb-1">{service.serviceTitle}</h5>
                                                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{service.serviceDetails}</p>
                                                            {service.serviceImages?.[0] && <img src={service.serviceImages[0]} alt={service.serviceTitle} className="w-full h-32 object-cover rounded-lg mb-3 border border-slate-100" />}
                                                            <p className='text-[10px] text-indigo-500 font-semibold'>Images: {service.serviceImages?.length || 0}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null
                            )}
                        </div>

                        <div className="px-8 py-6 border-t bg-slate-50 flex justify-between items-center gap-4 sticky bottom-0 z-20">
                            {modalType === 'view' ? (
                                <>
                                    <div className="flex gap-2">
                                        {shopDetail?.status !== 'Approved' && <button onClick={() => { setSelectedShop(shopDetail); setModalType('approve'); }} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-700 shadow-md transition-all">Approve</button>}
                                        {shopDetail?.status !== 'Rejected' && <button onClick={() => { setSelectedShop(shopDetail); setModalType('reject'); }} className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all">Deny / Reject</button>}
                                    </div>
                                    <button onClick={closeModal} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase">Close</button>
                                </>
                            ) : modalType === 'edit' ? (
                                null
                            ) : modalType === 'add' ? (
                                <>
                                    <button type="button" onClick={closeModal} className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase hover:text-slate-600">Cancel</button>
                                    <button form="addShopForm" type="submit" disabled={isProcessing} className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all">{isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />} Save Business</button>
                                </>
                            ) : modalType === 'addService' ? (
                                <>
                                    <button type="button" onClick={closeModal} className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase hover:text-slate-600">Cancel</button>
                                    <button form="addServiceForm" type="submit" disabled={isProcessing} className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all">{isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />} Add Service</button>
                                </>
                            ) : modalType === 'editService' && !editingService ? (
                                <button onClick={closeModal} className="w-full px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase">Close Panel</button>
                            ) : modalType === 'delete' ? (
                                <>
                                    <button onClick={closeModal} className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase">Cancel</button>
                                    <button onClick={confirmDelete} disabled={isProcessing} className="px-10 py-3 bg-rose-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2 transition-all">{isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Confirm Delete</button>
                                </>
                            ) : modalType === 'approve' ? (
                                <>
                                    <button onClick={() => setModalType('view')} className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase">Back</button>
                                    <button onClick={handleUpdateStatus} disabled={isProcessing} className="px-10 py-3 bg-emerald-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all">{isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />} Confirm Approval</button>
                                </>
                            ) : modalType === 'reject' ? (
                                <>
                                    <button onClick={() => setModalType('view')} className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase">Back</button>
                                    <button onClick={handleUpdateStatus} disabled={isProcessing} className="px-10 py-3 bg-rose-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2 transition-all">{isProcessing ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />} Confirm Reject</button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopListManagement;