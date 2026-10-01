// import React, { useState, useEffect } from "react";
// import { getLocalJobUsers } from "../../auth/adminLogin";
// import UserDetailModal from "./UserDetailModal";
// import { getAllItemCategories, createItem } from "../../auth/marketplace";
// import AddMarketplaceItemModal from "./AddMarketplaceItemModal";
// import { toast } from "react-toastify";
// import {
//   Edit,
//   Package,
//   Clock,
//   CreditCard,
//   Trash2,
//   Star,
//   X,
//   ShoppingBag,
//   DollarSign,
//   Eye,
//   MapPin,
//   Loader2,
//   AlertCircle,
//   ImageOff,
//   AlertTriangle,
//   CheckCircle,
//   RefreshCw,
//   Plus,
//   Compass,
//   Layers,
//   ChevronLeft,
//   ChevronRight,
//   PhoneCall,
//   MessageSquare,
// } from "lucide-react";

// import { useNavigate, useLocation } from "react-router-dom";

// import { getItemsUsers } from "../../auth/marketplace";

// import {
//   updateMarketplaceItemAPI,
//   createMarketplaceItemAPI,
// } from "../../auth/adminLogin";

// const MarketplaceManager = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [items, setItems] = useState([]);

//   const [stats, setStats] = useState({
//     totalItems: 0,
//     activeItems: 0,
//     totalCreditsSpent: 0,
//     isFeatured: 0,
//   });
//   const [categories, setCategories] = useState([]);
//   const [loadingCategories, setLoadingCategories] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [errors, setErrors] = useState({});

//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

//   const [currentItem, setCurrentItem] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [newItem, setNewItem] = useState({});

//   // NOTE: renamed from `toast` -> `toastState` because `toast` from
//   // react-toastify was being shadowed by this local state variable.
//   const [toastState, setToastState] = useState({
//     visible: false,
//     message: "",
//     type: "success",
//   });

//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const itemsPerPage = 10;

//   // User Detail Modal
//   const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);

//   const [selectedUser, setSelectedUser] = useState(null);

//   // =========================================================
//   // FETCH CURRENT LOCATION
//   // =========================================================

//   const getCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       showToast("Geolocation is not supported by your browser", "error");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const lat = position.coords.latitude;
//         const lng = position.coords.longitude;

//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
//           );

//           const data = await res.json();

//           setCurrentItem((prev) => ({
//             ...prev,
//             location: {
//               address: data.display_name || "",
//               coordinates: [
//                 Number(lat.toFixed(6)),
//                 Number(lng.toFixed(6)),
//               ],
//             },
//           }));
//         } catch (err) {
//           console.log(err);
//           showToast("Unable to fetch location", "error");
//         }
//       },
//       (err) => {
//         console.log(err);
//         showToast("Location permission denied", "error");
//       }
//     );
//   };

//   // =========================================================
//   // LOCAL BANNER TOAST (top-right box in this component)
//   // =========================================================

//   const showToast = (message, type = "success") => {
//     setToastState({ visible: true, message, type });

//     setTimeout(() => {
//       setToastState({ visible: false, message: "", type: "success" });
//     }, 5000);
//   };

//   // =========================================================
//   // FETCH MARKETPLACE DATA
//   // =========================================================

//   const fetchMarketplaceData = async (page = currentPage) => {
//     setLoading(true);

//     try {
//       const result = await getItemsUsers(page, itemsPerPage);

//       if (result.success) {
//         setItems(result.data || []);

//         setStats({
//           totalItems: result?.totalItems ?? 0,
//           activeItems: result?.activeItems ?? 0,
//           totalCreditsSpent: result?.totalCreditsSpent ?? 0,
//           isFeatured: result?.isFeatured ?? 0,
//         });

//         setTotalItems(result?.totalItems ?? 0);

//         setTotalPages(
//           result?.pagination?.totalPages ??
//             Math.ceil((result?.totalItems ?? 0) / itemsPerPage)
//         );
//       } else {
//         showToast("Failed to load data", "error");
//       }
//     } catch (error) {
//       console.error(error);
//       showToast("Error fetching item list", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMarketplaceData(currentPage);
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setLoadingCategories(true);

//         const response = await getAllItemCategories(1, 100);

//         if (response?.success) {
//           setCategories(response?.data || []);
//         }
//       } catch (error) {
//         console.error("Failed to fetch categories:", error);
//       } finally {
//         setLoadingCategories(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setLoadingUsers(true);

//         const response = await getLocalJobUsers(1, 100);

//         if (response?.success) {
//           setUsers(response?.data || []);
//         }
//       } catch (error) {
//         console.error("Failed to fetch users:", error);
//       } finally {
//         setLoadingUsers(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const openEditModal = (item) => {
//     setCurrentItem({ ...item });
//     setIsEditModalOpen(true);
//   };

//   // =========================================================
//   // OPEN VIEW MODAL
//   // =========================================================

//   const openViewModal = (item) => {
//     setCurrentItem(item);
//     setIsViewModalOpen(true);
//   };

//   // =========================================================
//   // OPEN USER DETAIL MODAL
//   // =========================================================

//   const openUserDetailModal = () => {
//     if (!currentItem?.user) {
//       showToast("User details not available", "error");
//       return;
//     }

//     setSelectedUser(currentItem.user);
//     setIsUserDetailModalOpen(true);
//   };

//   // =========================================================
//   // CLOSE USER DETAIL MODAL
//   // =========================================================

//   const closeUserDetailModal = () => {
//     setIsUserDetailModalOpen(false);
//     setSelectedUser(null);
//   };

//   // =========================================================
//   // UPDATE ITEM
//   // =========================================================

//   const handleUpdateConfirm = async () => {
//     if (!currentItem) return;

//     if (
//       !currentItem.title ||
//       !currentItem.price ||
//       !currentItem.location?.address ||
//       !currentItem.location?.coordinates?.[0] ||
//       !currentItem.location?.coordinates?.[1]
//     ) {
//       showToast("Please fill all required fields", "error");
//       return;
//     }

//     if (currentItem.preferredCommunication?.call) {
//       if (!currentItem.phone || currentItem.phone.length !== 10) {
//         showToast("Phone number must be exactly 10 digits", "error");
//         return;
//       }
//     }

//     setActionLoading(true);

//     try {
//       const result = await updateMarketplaceItemAPI(currentItem._id, {
//         title: currentItem.title,
//         price: currentItem.price,
//         isActive: currentItem.isActive,
//         isFeatured: currentItem.isFeatured,
//         preferredCommunication: currentItem.preferredCommunication,
//         images: currentItem.images,

//         location: {
//           address: currentItem.location?.address,
//           coordinates: currentItem.location?.coordinates,
//         },
//       });

//       if (result.success) {
//         setItems((prevItems) =>
//           prevItems.map((item) =>
//             item._id === currentItem._id ? result.data : item
//           )
//         );

//         setIsEditModalOpen(false);
//         setCurrentItem(null);

//         showToast("Updated successfully", "success");
//       } else {
//         showToast(result.message || "Update failed", "error");
//       }
//     } catch (err) {
//       console.error(err);

//       showToast(err.message || "Error updating item", "error");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // =========================================================
//   // OPEN DELETE MODAL
//   // =========================================================

//   const openDeleteModal = (item) => {
//     setCurrentItem(item);
//     setIsDeleteModalOpen(true);
//   };

//   // =========================================================
//   // DELETE ITEM
//   // =========================================================

//   const handleDeleteConfirm = async () => {
//     if (!currentItem) return;

//     setActionLoading(true);

//     try {
//       const token = localStorage.getItem("token");

//       const response = await fetch(
//         `https://digiapp-node-1.onrender.com/api/admin/items/delete/${currentItem._id}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const result = await response.json();

//       if (result.success) {
//         setItems((prevItems) =>
//           prevItems.filter((item) => item._id !== currentItem._id)
//         );

//         setIsDeleteModalOpen(false);
//         setCurrentItem(null);

//         showToast("Deleted successfully", "success");
//       } else {
//         showToast(result.message || "Failed to delete item", "error");
//       }
//     } catch (err) {
//       console.error(err);

//       showToast(err.message || "Error deleting item", "error");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // =========================================================
//   // PAGINATION
//   // =========================================================

//   const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

//   // =========================================================
//   // CREATE ITEM
//   // =========================================================

//   const handleCreateItem = async () => {
//     try {
//       const payload = {
//         title: newItem?.title || "",
//         details: newItem?.details || "",

//         // Category ID
//         category: newItem?.category || "",

//         // Sub-category string
//         subCategory: newItem?.subCategory || "",

//         // Price
//         price: Number(newItem?.price || 0),

//         // Images
//         images: newItem?.images || [],

//         // Location mapping
//         location: {
//           type: "Point",
//           coordinates: [
//             Number(newItem?.location?.coordinates?.[0] || 0), // longitude
//             Number(newItem?.location?.coordinates?.[1] || 0), // latitude
//           ],
//           address: newItem?.location?.address || "",
//         },

//         // Communication mapping
//         preferredCommunication: {
//           call: Boolean(newItem?.preferredCommunication?.call),
//           chat: Boolean(newItem?.preferredCommunication?.chat),
//         },

//         // Status
//         isActive: newItem?.isActive !== false,
//         isFeatured: Boolean(newItem?.isFeatured),

//         // Selected user
//         userid: newItem?.userid || "",
//       };

//       const response = await createItem(payload);

//       if (response?.success) {
//         // success toast (react-toastify)
//         toast.success(response?.message || "Item created successfully");

//         setIsAddModalOpen(false);

//         // reset form
//         setNewItem({
//           title: "",
//           details: "",
//           category: "",
//           subCategory: "",
//           price: 0,
//           images: [],
//           location: {
//             type: "Point",
//             coordinates: [0, 0],
//             address: "",
//           },
//           preferredCommunication: {
//             call: false,
//             chat: false,
//           },
//           isActive: true,
//           isFeatured: false,
//           userid: "",
//         });

//         // refresh marketplace list
//         fetchMarketplaceData(currentPage);
//       } else {
//         toast.error(response?.message || "Failed to create marketplace item");
//       }
//     } catch (error) {
//       console.error("Create item error:", error);

//       toast.error(
//         error?.response?.data?.message || "Failed to create marketplace item"
//       );
//     }
//   };

//   return (
//     <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen font-sans text-slate-800 relative antialiased selection:bg-indigo-500 selection:text-white">
//       {/* =====================================================
//           LOCAL TOAST BANNER
//       ===================================================== */}

//       {toastState.visible && (
//         <div className="fixed top-6 right-6 z-[1200] animate-bounce-short">
//           <div
//             className={`flex items-center gap-3.5 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border text-white font-medium text-xs tracking-wide transition-all duration-300 ${
//               toastState.type === "success"
//                 ? "bg-slate-900/95 border-emerald-500/30 shadow-emerald-950/10"
//                 : "bg-slate-900/95 border-rose-500/30 shadow-rose-950/10"
//             }`}
//           >
//             <div
//               className={`p-1.5 rounded-lg ${
//                 toastState.type === "success"
//                   ? "bg-emerald-500/20 text-emerald-400"
//                   : "bg-rose-500/20 text-rose-400"
//               }`}
//             >
//               {toastState.type === "success" ? (
//                 <CheckCircle size={15} />
//               ) : (
//                 <AlertCircle size={15} />
//               )}
//             </div>

//             <p className="pr-4">{toastState.message}</p>

//             <button
//               onClick={() =>
//                 setToastState({ ...toastState, visible: false })
//               }
//               className="ml-auto p-1 rounded-lg hover:bg-slate-800 transition-colors"
//             >
//               <X size={14} className="text-slate-400" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
//         <div>
//           <span className="bg-indigo-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-indigo-100/50 inline-flex items-center gap-1.5 mb-2">
//             System Administrator
//           </span>

//           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
//             Marketplace Manager
//           </h1>

//           <p className="text-slate-500 text-xs mt-1.5 font-medium">
//             Perform administrative listing tasks, monitor telemetry, and
//             assign item parameters.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
//           <button
//             onClick={() => fetchMarketplaceData(currentPage)}
//             className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl shadow-sm transition-all duration-200 active:scale-95 flex-1 sm:flex-initial"
//           >
//             <RefreshCw
//               size={14}
//               className={
//                 loading ? "animate-spin text-indigo-600" : "text-slate-500"
//               }
//             />
//             Refresh
//           </button>

//           <button
//             onClick={() => setIsAddModalOpen(true)}
//             className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex-1 sm:flex-initial"
//           >
//             <Plus size={14} />
//             Create Listing
//           </button>
//         </div>
//       </div>

//       {/* =====================================================
//           STATS
//       ===================================================== */}

//       {!loading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//           {/* TOTAL POSTS */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                   Total Posts
//                 </p>
//                 <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
//                   {stats?.totalItems ?? 0}
//                 </h3>
//               </div>
//               <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
//                 <Package size={19} />
//               </div>
//             </div>
//           </div>

//           {/* ACTIVE POSTS */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                   Active Posts
//                 </p>
//                 <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
//                   {stats?.activeItems ?? 0}
//                 </h3>
//               </div>
//               <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition">
//                 <Eye size={19} />
//               </div>
//             </div>
//           </div>

//           {/* EXPIRED POSTS */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                   Expired Posts
//                 </p>
//                 <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
//                   {(stats?.totalItems ?? 0) - (stats?.activeItems ?? 0)}
//                 </h3>
//               </div>
//               <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
//                 <Package size={19} />
//               </div>
//             </div>
//           </div>

//           {/* TOTAL CREDITS */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                   Total Credits Spent
//                 </p>
//                 <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
//                   {stats?.totalCreditsSpent ?? 0}
//                 </h3>
//               </div>
//               <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
//                 <CreditCard size={19} />
//               </div>
//             </div>
//           </div>

//           {/* FEATURED */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                   Featured Posts
//                 </p>
//                 <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
//                   {stats?.isFeatured ?? 0}
//                 </h3>
//               </div>
//               <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
//                 <Star size={19} />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           LOADING
//       ===================================================== */}

//       {loading && (
//         <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm mb-10">
//           <div className="relative mb-4">
//             <div className="absolute -inset-1 rounded-full bg-indigo-500/10 animate-ping" />
//             <Loader2 size={32} className="animate-spin text-indigo-600 relative" />
//           </div>
//           <p className="text-slate-500 text-xs font-semibold">
//             Syncing records database...
//           </p>
//         </div>
//       )}

//       {/* =====================================================
//           TABLE
//       ===================================================== */}

//       {!loading && (
//         <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-10">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400">
//                   <th className="p-5 text-[10px] font-bold uppercase tracking-widest w-16 text-center">
//                     #
//                   </th>
//                   <th className="p-5 text-[10px] font-bold uppercase tracking-widest">
//                     Listing Item Detail
//                   </th>
//                   <th className="p-5 text-[10px] font-bold uppercase tracking-widest">
//                     Category Tag
//                   </th>
//                   <th className="p-5 text-[10px] font-bold uppercase tracking-widest">
//                     Asking Price
//                   </th>
//                   <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-center">
//                     Promoted
//                   </th>
//                   <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-center">
//                     Status
//                   </th>
//                   <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-center">
//                     Operations
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {items.map((item, index) => (
//                   <tr
//                     key={item._id}
//                     className="hover:bg-slate-50/30 transition-colors duration-150 group"
//                   >
//                     <td className="p-5 text-xs font-bold text-slate-400 text-center">
//                       {indexOfFirstItem + index + 1}
//                     </td>

//                     <td className="p-5 max-w-sm">
//                       <div className="flex gap-4 items-center">
//                         {item.images && item.images.length > 0 ? (
//                           <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 flex-shrink-0">
//                             <img
//                               src={item.images[0]}
//                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                               alt=""
//                             />
//                           </div>
//                         ) : (
//                           <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
//                             <ImageOff size={16} />
//                           </div>
//                         )}

//                         <div className="truncate">
//                           <p className="font-bold text-slate-800 text-sm leading-snug tracking-tight">
//                             {item.title}
//                           </p>
//                           <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1.5 font-semibold">
//                             <MapPin size={11} className="text-indigo-400" />
//                             {item.location?.address ||
//                               "No Coordinates Assigned"}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="p-5">
//                       <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-indigo-100/50">
//                         {item.category}
//                       </span>
//                     </td>

//                     <td className="p-5 text-xs font-extrabold text-slate-800">
//                       ₹{Number(item.price || 0).toLocaleString()}
//                     </td>

//                     <td className="p-5 text-center">
//                       <div className="inline-flex items-center justify-center">
//                         <Star
//                           size={18}
//                           className={
//                             item.isFeatured
//                               ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]"
//                               : "text-slate-200"
//                           }
//                         />
//                       </div>
//                     </td>

//                     <td className="p-5 text-center">
//                       <span
//                         className={`text-[9px] font-bold px-3 py-1.5 rounded-xl tracking-widest inline-block uppercase ${
//                           item.isActive
//                             ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
//                             : "bg-rose-50 text-rose-600 border border-rose-100"
//                         }`}
//                       >
//                         {item.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>

//                     <td className="p-5">
//                       <div className="flex justify-center items-center gap-2">
//                         <button
//                           onClick={() => openViewModal(item)}
//                           className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition"
//                         >
//                           <Eye size={16} />
//                         </button>

//                         <button
//                           onClick={() => openEditModal(item)}
//                           className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all duration-200 shadow-sm"
//                         >
//                           <Edit size={12} />
//                           Edit
//                         </button>

//                         <button
//                           onClick={() => openDeleteModal(item)}
//                           className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-xl border border-rose-100/80 bg-rose-50/50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm"
//                         >
//                           <Trash2 size={12} />
//                           Remove
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* EMPTY */}
//             {items.length === 0 && (
//               <div className="p-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
//                 <Layers size={36} className="text-slate-300 stroke-[1.5]" />
//                 <p className="text-xs font-bold text-slate-500 mt-2">
//                   Zero Listings Found
//                 </p>
//                 <p className="text-[10px] text-slate-400 max-w-xs">
//                   There are currently no items available inside the
//                   marketplace storehouse.
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* PAGINATION */}

//           <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-white border-t border-slate-100 gap-4">
//             <p className="text-xs font-semibold text-slate-400">
//               Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to{" "}
//               {Math.min(indexOfFirstItem + items.length, totalItems)} of{" "}
//               {totalItems} listings
//             </p>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.max(prev - 1, 1))
//                 }
//                 disabled={currentPage === 1}
//                 className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-1 transition-all duration-150"
//               >
//                 <ChevronLeft size={14} />
//                 Previous
//               </button>

//               <div className="flex items-center gap-1">
//                 {[...Array(totalPages)].map((_, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setCurrentPage(i + 1)}
//                     className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-150 ${
//                       currentPage === i + 1
//                         ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
//                         : "hover:bg-slate-100 text-slate-500"
//                     }`}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}
//               </div>

//               <button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages || totalPages === 0}
//                 className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-all duration-150"
//               >
//                 Next
//                 <ChevronRight size={14} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           EDIT MODAL
//       ===================================================== */}

//       {isEditModalOpen && currentItem && (
//         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300">
//           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
//             {/* HEADER */}
//             <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
//               <div>
//                 <h2 className="text-base font-extrabold text-slate-900">
//                   Update Marketplace Listing
//                 </h2>
//                 <p className="text-[10px] text-slate-400 font-medium mt-0.5">
//                   Adjust credentials, status, and tracking info
//                 </p>
//               </div>

//               <button
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* BODY */}
//             <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
//               {/* TITLE */}
//               <div>
//                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                   Item Title
//                 </label>
//                 <input
//                   type="text"
//                   value={currentItem.title || ""}
//                   onChange={(e) =>
//                     setCurrentItem({ ...currentItem, title: e.target.value })
//                   }
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
//                 />
//               </div>

//               {/* PRICE + STATUS */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                     Price (₹)
//                   </label>
//                   <input
//                     type="number"
//                     value={currentItem.price || ""}
//                     onChange={(e) =>
//                       setCurrentItem({
//                         ...currentItem,
//                         price: Number(e.target.value),
//                       })
//                     }
//                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all duration-200"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                     Status
//                   </label>
//                   <select
//                     value={currentItem.isActive ? "true" : "false"}
//                     onChange={(e) =>
//                       setCurrentItem({
//                         ...currentItem,
//                         isActive: e.target.value === "true",
//                       })
//                     }
//                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none cursor-pointer"
//                   >
//                     <option value="true">Active</option>
//                     <option value="false">Inactive</option>
//                   </select>
//                 </div>
//               </div>

//               {/* FEATURED + COMMUNICATION */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                     Promote Listing
//                   </label>
//                   <select
//                     value={currentItem.isFeatured ? "true" : "false"}
//                     onChange={(e) =>
//                       setCurrentItem({
//                         ...currentItem,
//                         isFeatured: e.target.value === "true",
//                       })
//                     }
//                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none cursor-pointer"
//                   >
//                     <option value="true">Featured (Star Icon)</option>
//                     <option value="false">Standard Listing</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                     Contact Channel
//                   </label>
//                   <input
//                     type="text"
//                     value={
//                       typeof currentItem.preferredCommunication === "string"
//                         ? currentItem.preferredCommunication
//                         : ""
//                     }
//                     onChange={(e) =>
//                       setCurrentItem({
//                         ...currentItem,
//                         preferredCommunication: e.target.value,
//                       })
//                     }
//                     placeholder="e.g. Call, Chat"
//                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
//                   />
//                 </div>
//               </div>

//               {/* LOCATION BUTTON */}
//               <div className="mb-4">
//                 <button
//                   type="button"
//                   onClick={getCurrentLocation}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
//                 >
//                   📍 Fetch Current Location
//                 </button>
//               </div>

//               {/* ADDRESS */}
//               <div>
//                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                   Listing Location Address
//                 </label>
//                 <input
//                   type="text"
//                   value={currentItem.location?.address || ""}
//                   onChange={(e) =>
//                     setCurrentItem({
//                       ...currentItem,
//                       location: {
//                         ...currentItem.location,
//                         address: e.target.value,
//                       },
//                     })
//                   }
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
//                 />
//               </div>

//               {/* COORDINATES */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                     Latitude
//                   </label>
//                   <input
//                     type="text"
//                     value={currentItem.location?.coordinates?.[0] || ""}
//                     onChange={(e) =>
//                       setCurrentItem({
//                         ...currentItem,
//                         location: {
//                           ...currentItem.location,
//                           coordinates: [
//                             e.target.value,
//                             currentItem.location?.coordinates?.[1] || "",
//                           ],
//                         },
//                       })
//                     }
//                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                     Longitude
//                   </label>
//                   <input
//                     type="text"
//                     value={currentItem.location?.coordinates?.[1] || ""}
//                     onChange={(e) =>
//                       setCurrentItem({
//                         ...currentItem,
//                         location: {
//                           ...currentItem.location,
//                           coordinates: [
//                             currentItem.location?.coordinates?.[0] || "",
//                             e.target.value,
//                           ],
//                         },
//                       })
//                     }
//                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium"
//                   />
//                 </div>
//               </div>

//               {/* IMAGE */}
//               <div>
//                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//                   Update Listing Image Preview
//                 </label>

//                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-3xl hover:border-indigo-500 transition-all duration-200">
//                   <div className="space-y-1 text-center">
//                     <div className="flex text-xs text-slate-600">
//                       <label className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
//                         <span>Click to upload new image file</span>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={(e) => {
//                             const file = e.target.files?.[0];

//                             if (file) {
//                               const imageUrl = URL.createObjectURL(file);

//                               setCurrentItem({
//                                 ...currentItem,
//                                 images: [imageUrl],
//                               });
//                             }
//                           }}
//                           className="sr-only"
//                         />
//                       </label>
//                     </div>

//                     <p className="text-[10px] text-slate-400 font-medium">
//                       JPEG, PNG, GIF up to 10MB
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* FOOTER */}
//             <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
//               <button
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="px-5 py-3 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl font-bold text-xs transition-colors bg-white"
//               >
//                 Discard
//               </button>

//               <button
//                 onClick={handleUpdateConfirm}
//                 disabled={actionLoading}
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-70"
//               >
//                 {actionLoading && <Loader2 size={14} className="animate-spin" />}
//                 Save Modifications
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           VIEW MODAL
//       ===================================================== */}

//       {isViewModalOpen && currentItem && (
//         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
//           <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
//             {/* HEADER */}
//             <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/70">
//               <div>
//                 <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
//                   Marketplace
//                 </span>
//                 <h2 className="text-xl font-extrabold text-slate-900 mt-1">
//                   Marketplace Item Details
//                 </h2>
//                 <p className="text-[10px] text-slate-400 mt-1">
//                   Complete information about this marketplace listing
//                 </p>
//               </div>

//               <button
//                 onClick={() => setIsViewModalOpen(false)}
//                 className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* CONTENT */}
//             <div className="p-7 max-h-[75vh] overflow-y-auto">
//               {/* IMAGES */}
//               <div className="mb-7">
//                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
//                   Listing Images
//                 </h3>

//                 <div className="flex gap-4 flex-wrap">
//                   {currentItem.images?.length > 0 ? (
//                     currentItem.images.map((image, index) => (
//                       <div
//                         key={index}
//                         className="w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm"
//                       >
//                         <img
//                           src={image}
//                           alt="Item"
//                           className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                         />
//                       </div>
//                     ))
//                   ) : (
//                     <div className="w-28 h-28 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
//                       <ImageOff size={22} />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* MAIN DETAILS */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Title
//                   </p>
//                   <p className="text-sm font-bold text-slate-800 mt-1">
//                     {currentItem.title || "-"}
//                   </p>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Price
//                   </p>
//                   <p className="text-sm font-bold text-emerald-600 mt-1">
//                     ₹{currentItem.price?.toLocaleString() || "-"}
//                   </p>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Category
//                   </p>
//                   <p className="text-sm font-semibold text-slate-700 mt-1">
//                     {currentItem.category || "-"}
//                   </p>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Sub Category
//                   </p>
//                   <p className="text-sm font-semibold text-slate-700 mt-1">
//                     {currentItem.subCategory || "-"}
//                   </p>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Posted By
//                   </p>
//                   <button
//                     type="button"
//                     onClick={openUserDetailModal}
//                     className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline mt-1"
//                   >
//                     User Details
//                   </button>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Phone
//                   </p>
//                   <p className="text-sm font-semibold text-slate-700 mt-1">
//                     {currentItem.user?.mobile || currentItem.phone || "-"}
//                   </p>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Status
//                   </p>
//                   <span
//                     className={`inline-flex mt-1 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
//                       currentItem.isActive
//                         ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
//                         : "bg-rose-50 text-rose-600 border border-rose-100"
//                     }`}
//                   >
//                     {currentItem.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Featured
//                   </p>
//                   <div className="flex items-center gap-2 mt-1">
//                     <Star
//                       size={16}
//                       className={
//                         currentItem.isFeatured
//                           ? "text-amber-400 fill-amber-400"
//                           : "text-slate-300"
//                       }
//                     />
//                     <span className="text-sm font-semibold text-slate-700">
//                       {currentItem.isFeatured ? "Yes" : "No"}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Preferred Communication
//                   </p>
//                   <p className="text-sm font-semibold text-slate-700 mt-1">
//                     {currentItem.preferredCommunication?.call
//                       ? "Call"
//                       : currentItem.preferredCommunication?.chat
//                       ? "Chat"
//                       : typeof currentItem.preferredCommunication === "string"
//                       ? currentItem.preferredCommunication
//                       : "-"}
//                   </p>
//                 </div>

//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
//                     Coordinates
//                   </p>
//                   <p className="text-sm font-semibold text-slate-700 mt-1">
//                     {currentItem.location?.coordinates?.length
//                       ? `${currentItem.location.coordinates[0]}, ${currentItem.location.coordinates[1]}`
//                       : "-"}
//                   </p>
//                 </div>
//               </div>

//               {/* DESCRIPTION */}
//               <div className="mt-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
//                 <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-2">
//                   Description
//                 </p>
//                 <p className="text-sm text-slate-600 leading-relaxed">
//                   {currentItem.description ||
//                     currentItem.details ||
//                     "No description available"}
//                 </p>
//               </div>

//               {/* LOCATION */}
//               <div className="mt-4 bg-indigo-50/60 rounded-2xl p-5 border border-indigo-100">
//                 <div className="flex items-center gap-2 mb-2">
//                   <MapPin size={16} className="text-indigo-500" />
//                   <p className="text-[9px] uppercase tracking-widest font-bold text-indigo-500">
//                     Listing Location
//                   </p>
//                 </div>
//                 <p className="text-sm font-semibold text-slate-700">
//                   {currentItem.location?.address || "No location available"}
//                 </p>
//               </div>
//             </div>

//             {/* FOOTER */}
//             <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
//               <button
//                 onClick={() => setIsViewModalOpen(false)}
//                 className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
//               >
//                 Close Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <AddMarketplaceItemModal
//         isAddModalOpen={isAddModalOpen}
//         setIsAddModalOpen={setIsAddModalOpen}
//         newItem={newItem}
//         setNewItem={setNewItem}
//         getCurrentLocation={getCurrentLocation}
//         handleCreateItem={handleCreateItem}
//         categories={categories}
//         loadingCategories={loadingCategories}
//         users={users}
//         loadingUsers={loadingUsers}
//       />

//       {isDeleteModalOpen && currentItem && (
//         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
//           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
//             <div className="p-8 text-center">
//               <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
//                 <AlertTriangle size={28} />
//               </div>

//               <h2 className="text-base font-extrabold text-slate-900">
//                 Confirm Listing Removal
//               </h2>

//               <p className="text-slate-500 text-xs mt-2 px-2 leading-relaxed">
//                 Are you completely sure you want to permanently remove item{" "}
//                 <strong className="text-slate-800">
//                   "{currentItem.title}"
//                 </strong>
//                 ? This action is non-reversible.
//               </p>
//             </div>

//             <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
//               <button
//                 onClick={handleDeleteConfirm}
//                 disabled={actionLoading}
//                 className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg"
//               >
//                 {actionLoading ? (
//                   <Loader2 size={14} className="animate-spin" />
//                 ) : (
//                   <Trash2 size={14} />
//                 )}
//                 Confirm Destructive Delete
//               </button>

//               <button
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 disabled={actionLoading}
//                 className="w-full bg-white border border-slate-200 text-slate-500 py-3.5 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-colors"
//               >
//                 Abstain Action
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

   

//       {isUserDetailModalOpen && selectedUser && (
//         <UserDetailModal
//           isOpen={isUserDetailModalOpen}
//           user={selectedUser}
//           onClose={closeUserDetailModal}
//         />
//       )}
//     </div>
//   );
// };

// export default MarketplaceManager;

import React, { useState, useEffect } from "react";
import { getLocalJobUsers } from "../../auth/adminLogin";
import UserDetailModal from "./UserDetailModal";
import { getAllItemCategories, createItem } from "../../auth/marketplace";
import AddMarketplaceItemModal from "./AddMarketplaceItemModal";
import EditMarketplaceItemModal from "./EditMarketplaceItemModal";
import { toast } from "react-toastify";
import {
  Edit,
  Package,
  Clock,
  CreditCard,
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

import { getItemsUsers } from "../../auth/marketplace";

import {
  updateMarketplaceItemAPI,
  createMarketplaceItemAPI,
} from "../../auth/adminLogin";

const MarketplaceManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);

  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    totalCreditsSpent: 0,
    isFeatured: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentItem, setCurrentItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({});

  // NOTE: renamed from `toast` -> `toastState` because `toast` from
  // react-toastify was being shadowed by this local state variable.
  const [toastState, setToastState] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const itemsPerPage = 10;

  // User Detail Modal
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // =========================================================
  // FETCH CURRENT LOCATION
  // Standardized to [longitude, latitude] (GeoJSON order) to
  // match the Add modal / createItem payload.
  // =========================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const data = await res.json();

          setCurrentItem((prev) => ({
            ...prev,
            location: {
              ...(prev?.location || {}),
              address: data.display_name || prev?.location?.address || "",
              coordinates: [
                Number(lng.toFixed(6)), // longitude first
                Number(lat.toFixed(6)), // latitude second
              ],
            },
          }));

          showToast("Location & coordinates fetched successfully", "success");
        } catch (err) {
          console.log(err);
          showToast("Unable to fetch address, but coordinates were set", "error");

          setCurrentItem((prev) => ({
            ...prev,
            location: {
              ...(prev?.location || {}),
              coordinates: [
                Number(lng.toFixed(6)),
                Number(lat.toFixed(6)),
              ],
            },
          }));
        }
      },
      (err) => {
        console.log(err);
        showToast("Location permission denied", "error");
      }
    );
  };

  // =========================================================
  // LOCAL BANNER TOAST (top-right box in this component)
  // =========================================================

  const showToast = (message, type = "success") => {
    setToastState({ visible: true, message, type });

    setTimeout(() => {
      setToastState({ visible: false, message: "", type: "success" });
    }, 5000);
  };

  // =========================================================
  // FETCH MARKETPLACE DATA
  // =========================================================

  const fetchMarketplaceData = async (page = currentPage) => {
    setLoading(true);

    try {
      const result = await getItemsUsers(page, itemsPerPage);

      if (result.success) {
        setItems(result.data || []);

        setStats({
          totalItems: result?.totalItems ?? 0,
          activeItems: result?.activeItems ?? 0,
          totalCreditsSpent: result?.totalCreditsSpent ?? 0,
          isFeatured: result?.isFeatured ?? 0,
        });

        setTotalItems(result?.totalItems ?? 0);

        setTotalPages(
          result?.pagination?.totalPages ??
            Math.ceil((result?.totalItems ?? 0) / itemsPerPage)
        );
      } else {
        showToast("Failed to load data", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error fetching item list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await getAllItemCategories(1, 100);

        if (response?.success) {
          setCategories(response?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const response = await getLocalJobUsers(1, 100);

        if (response?.success) {
          setUsers(response?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const openEditModal = (item) => {
    setCurrentItem({ ...item });
    setIsEditModalOpen(true);
  };

  // =========================================================
  // OPEN VIEW MODAL
  // =========================================================

  const openViewModal = (item) => {
    setCurrentItem(item);
    setIsViewModalOpen(true);
  };

  // =========================================================
  // OPEN USER DETAIL MODAL
  // =========================================================

  const openUserDetailModal = () => {
    if (!currentItem?.user) {
      showToast("User details not available", "error");
      return;
    }

    setSelectedUser(currentItem.user);
    setIsUserDetailModalOpen(true);
  };

  // =========================================================
  // CLOSE USER DETAIL MODAL
  // =========================================================

  const closeUserDetailModal = () => {
    setIsUserDetailModalOpen(false);
    setSelectedUser(null);
  };

  // =========================================================
  // UPDATE ITEM
  // Payload now mirrors the create payload: category,
  // subCategory, details, userid, preferredCommunication{call,chat}
  // =========================================================

  const handleUpdateConfirm = async () => {
    if (!currentItem) return;

    if (
      !currentItem.title ||
      !currentItem.price ||
      !currentItem.location?.address ||
      currentItem.location?.coordinates?.[0] === undefined ||
      currentItem.location?.coordinates?.[1] === undefined
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
        details: currentItem.details || "",
        category: currentItem.category || "",
        subCategory: currentItem.subCategory || "",
        price: currentItem.price,
        isActive: currentItem.isActive,
        isFeatured: currentItem.isFeatured,
        phone: currentItem.phone || "",
        preferredCommunication: {
          call: Boolean(currentItem.preferredCommunication?.call),
          chat: Boolean(currentItem.preferredCommunication?.chat),
        },
        images: currentItem.images,
        userid: currentItem.userid || currentItem.user?._id || "",

        location: {
          address: currentItem.location?.address,
          coordinates: currentItem.location?.coordinates,
        },
      });

      if (result.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === currentItem._id ? result.data : item
          )
        );

        setIsEditModalOpen(false);
        setCurrentItem(null);

        showToast("Updated successfully", "success");
      } else {
        showToast(result.message || "Update failed", "error");
      }
    } catch (err) {
      console.error(err);

      showToast(err.message || "Error updating item", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const openDeleteModal = (item) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  // =========================================================
  // DELETE ITEM
  // =========================================================

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
        }
      );

      const result = await response.json();

      if (result.success) {
        setItems((prevItems) =>
          prevItems.filter((item) => item._id !== currentItem._id)
        );

        setIsDeleteModalOpen(false);
        setCurrentItem(null);

        showToast("Deleted successfully", "success");
      } else {
        showToast(result.message || "Failed to delete item", "error");
      }
    } catch (err) {
      console.error(err);

      showToast(err.message || "Error deleting item", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

  // =========================================================
  // CREATE ITEM
  // =========================================================

  const handleCreateItem = async () => {
    try {
      const payload = {
        title: newItem?.title || "",
        details: newItem?.details || "",

        // Category ID
        category: newItem?.category || "",

        // Sub-category string
        subCategory: newItem?.subCategory || "",

        // Price
        price: Number(newItem?.price || 0),

        // Images
        images: newItem?.images || [],

        // Location mapping
        location: {
          type: "Point",
          coordinates: [
            Number(newItem?.location?.coordinates?.[0] || 0), // longitude
            Number(newItem?.location?.coordinates?.[1] || 0), // latitude
          ],
          address: newItem?.location?.address || "",
        },

        // Communication mapping
        preferredCommunication: {
          call: Boolean(newItem?.preferredCommunication?.call),
          chat: Boolean(newItem?.preferredCommunication?.chat),
        },

        // Status
        isActive: newItem?.isActive !== false,
        isFeatured: Boolean(newItem?.isFeatured),

        // Selected user
        userid: newItem?.userid || "",
      };

      const response = await createItem(payload);

      if (response?.success) {
        // success toast (react-toastify)
        toast.success(response?.message || "Item created successfully");

        setIsAddModalOpen(false);

        // reset form
        setNewItem({
          title: "",
          details: "",
          category: "",
          subCategory: "",
          price: 0,
          images: [],
          location: {
            type: "Point",
            coordinates: [0, 0],
            address: "",
          },
          preferredCommunication: {
            call: false,
            chat: false,
          },
          isActive: true,
          isFeatured: false,
          userid: "",
        });

        // refresh marketplace list
        fetchMarketplaceData(currentPage);
      } else {
        toast.error(response?.message || "Failed to create marketplace item");
      }
    } catch (error) {
      console.error("Create item error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to create marketplace item"
      );
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen font-sans text-slate-800 relative antialiased selection:bg-indigo-500 selection:text-white">
      {/* =====================================================
          LOCAL TOAST BANNER
      ===================================================== */}

      {toastState.visible && (
        <div className="fixed top-6 right-6 z-[1200] animate-bounce-short">
          <div
            className={`flex items-center gap-3.5 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border text-white font-medium text-xs tracking-wide transition-all duration-300 ${
              toastState.type === "success"
                ? "bg-slate-900/95 border-emerald-500/30 shadow-emerald-950/10"
                : "bg-slate-900/95 border-rose-500/30 shadow-rose-950/10"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg ${
                toastState.type === "success"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {toastState.type === "success" ? (
                <CheckCircle size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
            </div>

            <p className="pr-4">{toastState.message}</p>

            <button
              onClick={() =>
                setToastState({ ...toastState, visible: false })
              }
              className="ml-auto p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <span className="bg-indigo-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-indigo-100/50 inline-flex items-center gap-1.5 mb-2">
            System Administrator
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Marketplace Manager
          </h1>

          <p className="text-slate-500 text-xs mt-1.5 font-medium">
            Perform administrative listing tasks, monitor telemetry, and
            assign item parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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

      {/* =====================================================
          STATS
      ===================================================== */}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* TOTAL POSTS */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Posts
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {stats?.totalItems ?? 0}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Package size={19} />
              </div>
            </div>
          </div>

          {/* ACTIVE POSTS */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Posts
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {stats?.activeItems ?? 0}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition">
                <Eye size={19} />
              </div>
            </div>
          </div>

          {/* EXPIRED POSTS */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Expired Posts
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {(stats?.totalItems ?? 0) - (stats?.activeItems ?? 0)}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Package size={19} />
              </div>
            </div>
          </div>

          {/* TOTAL CREDITS */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Credits Spent
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {stats?.totalCreditsSpent ?? 0}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <CreditCard size={19} />
              </div>
            </div>
          </div>

          {/* FEATURED */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Featured Posts
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {stats?.isFeatured ?? 0}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star size={19} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm mb-10">
          <div className="relative mb-4">
            <div className="absolute -inset-1 rounded-full bg-indigo-500/10 animate-ping" />
            <Loader2 size={32} className="animate-spin text-indigo-600 relative" />
          </div>
          <p className="text-slate-500 text-xs font-semibold">
            Syncing records database...
          </p>
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

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
                            <MapPin size={11} className="text-indigo-400" />
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
                      ₹{Number(item.price || 0).toLocaleString()}
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
                          onClick={() => openViewModal(item)}
                          className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all duration-200 shadow-sm"
                        >
                          <Edit size={12} />
                          Edit
                        </button>

                        <button
                          onClick={() => openDeleteModal(item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-xl border border-rose-100/80 bg-rose-50/50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY */}
            {items.length === 0 && (
              <div className="p-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Layers size={36} className="text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-500 mt-2">
                  Zero Listings Found
                </p>
                <p className="text-[10px] text-slate-400 max-w-xs">
                  There are currently no items available inside the
                  marketplace storehouse.
                </p>
              </div>
            )}
          </div>

          {/* PAGINATION */}

          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-white border-t border-slate-100 gap-4">
            <p className="text-xs font-semibold text-slate-400">
              Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfFirstItem + items.length, totalItems)} of{" "}
              {totalItems} listings
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-1 transition-all duration-150"
              >
                <ChevronLeft size={14} />
                Previous
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
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODAL — now a separate component
      ===================================================== */}

      <EditMarketplaceItemModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        handleUpdateConfirm={handleUpdateConfirm}
        actionLoading={actionLoading}
        getCurrentLocation={getCurrentLocation}
        categories={categories}
        loadingCategories={loadingCategories}
        users={users}
        loadingUsers={loadingUsers}
      />

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {isViewModalOpen && currentItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
            {/* HEADER */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/70">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
                  Marketplace
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Marketplace Item Details
                </h2>
                <p className="text-[10px] text-slate-400 mt-1">
                  Complete information about this marketplace listing
                </p>
              </div>

              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-7 max-h-[75vh] overflow-y-auto">
              {/* IMAGES */}
              <div className="mb-7">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Listing Images
                </h3>

                <div className="flex gap-4 flex-wrap">
                  {currentItem.images?.length > 0 ? (
                    currentItem.images.map((image, index) => (
                      <div
                        key={index}
                        className="w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm"
                      >
                        <img
                          src={image}
                          alt="Item"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                      <ImageOff size={22} />
                    </div>
                  )}
                </div>
              </div>

              {/* MAIN DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Title
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {currentItem.title || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Price
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    ₹{currentItem.price?.toLocaleString() || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Category
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {currentItem.category || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Sub Category
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {currentItem.subCategory || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Posted By
                  </p>
                  <button
                    type="button"
                    onClick={openUserDetailModal}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline mt-1"
                  >
                    User Details
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {currentItem.user?.mobile || currentItem.phone || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Status
                  </p>
                  <span
                    className={`inline-flex mt-1 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                      currentItem.isActive
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}
                  >
                    {currentItem.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Featured
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star
                      size={16}
                      className={
                        currentItem.isFeatured
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {currentItem.isFeatured ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Preferred Communication
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {currentItem.preferredCommunication?.call
                      ? "Call"
                      : currentItem.preferredCommunication?.chat
                      ? "Chat"
                      : typeof currentItem.preferredCommunication === "string"
                      ? currentItem.preferredCommunication
                      : "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    Coordinates
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {currentItem.location?.coordinates?.length
                      ? `${currentItem.location.coordinates[0]}, ${currentItem.location.coordinates[1]}`
                      : "-"}
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                  Description
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {currentItem.description ||
                    currentItem.details ||
                    "No description available"}
                </p>
              </div>

              {/* LOCATION */}
              <div className="mt-4 bg-indigo-50/60 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-indigo-500" />
                  <p className="text-[9px] uppercase tracking-widest font-bold text-indigo-500">
                    Listing Location
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {currentItem.location?.address || "No location available"}
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <AddMarketplaceItemModal
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        newItem={newItem}
        setNewItem={setNewItem}
        getCurrentLocation={getCurrentLocation}
        handleCreateItem={handleCreateItem}
        categories={categories}
        loadingCategories={loadingCategories}
        users={users}
        loadingUsers={loadingUsers}
      />

      {isDeleteModalOpen && currentItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
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
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg"
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

      {isUserDetailModalOpen && selectedUser && (
        <UserDetailModal
          isOpen={isUserDetailModalOpen}
          user={selectedUser}
          onClose={closeUserDetailModal}
        />
      )}
    </div>
  );
};

export default MarketplaceManager;