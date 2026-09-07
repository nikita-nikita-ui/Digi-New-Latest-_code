import React, { useState, useEffect } from "react";
import {
  getAllLocalJobs,
  createLocalJob,
  deleteLocalJob,
  updateLocalJob,
} from "../../auth/adminLogin";
import { toast } from "react-toastify";
import UnlockedUsersModal from "./Unlockedusersmodal";
import PostTaskModal from "./PostTaskModal";
import { 
  Plus, Eye, Edit3, Trash2, MapPin, Phone, MessageSquare, 
  X, ChevronLeft, ChevronRight, Sparkles, DollarSign, 
  User, Shield, Image, Navigation, HelpCircle
} from "lucide-react";

const LocalNeeds = () => {

  const [tasks, setTasks] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
const [analytics, setAnalytics] = useState({});

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
const [isUserListOpen, setIsUserListOpen] = useState(false);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
       const res = await getAllLocalJobs(page);

setTasks(res.data || []);
setPagination(res.pagination || {});
setAnalytics(res.analytics || {});
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, [page]);
const handlePostNewAPI = async (formData, id) => {
  try {
    let res;

    if (id) {
      // UPDATE
      res = await updateLocalJob(id, formData);

      setTasks((prev) =>
        prev.map((item) =>
          item._id === id ? res.data : item
        )
      );

      toast.success("Updated successfully", {
        autoClose: 4000,
      });
    } else {
      // CREATE
      res = await createLocalJob(formData);

      setTasks((prev) => [res.data, ...prev]);

      toast.success("Posted successfully", {
        autoClose: 4000,
      });
    }

    setIsPostModalOpen(false);
    setSelectedTask(null);
  } catch (err) {
    console.error("Local Job API Error:", err);

    toast.error(
      err?.response?.data?.message || "Something went wrong",
      {
        autoClose: 4000,
      }
    );
  }
};
  const handleDelete = (id) => {
    setSelectedTaskId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLocalJob(selectedTaskId);
      setTasks((prev) => prev.filter((item) => item._id !== selectedTaskId));
      toast.success("Deleted successfully", { autoClose: 4000 });
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsViewMode(false);
    setIsPostModalOpen(true);
  };

  return (
<div className="p-4 md:p-6 min-h-screen font-sans selection:bg-indigo-500 selection:text-white w-full">      <div className="w-full space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sparkles className="text-indigo-600 animate-pulse" size={28} />
              Local Tasks Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Admin Control Hub - Create, update, view and delete regional jobs and assignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
         

            <button
              onClick={() => {
                setSelectedTask(null);
                setIsViewMode(false);
                setIsPostModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-250 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto text-sm cursor-pointer"
            >
              <Plus size={18} strokeWidth={3} />
              Post New Task
            </button>
          </div>
        </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">



<div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Total Tasks
    </p>
    <p className="text-2xl font-extrabold text-slate-900 mt-2">
      {analytics.totalLocalJobs || 0}
    </p>
  </div>

  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Active Tasks
    </p>
    <p className="text-2xl font-extrabold text-emerald-600 mt-2">
      {analytics.activeLocalJobs || 0}
    </p>
  </div>

  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Expired Tasks
    </p>
    <p className="text-2xl font-extrabold text-rose-600 mt-2">
      {analytics.expiredLocalJobs || 0}
    </p>
  </div>

  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Featured Tasks
    </p>
    <p className="text-2xl font-extrabold text-amber-600 mt-2">
      {analytics.featuredLocalJobs || 0}
    </p>
  </div>

  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Total Unlocks
    </p>
    <p className="text-2xl font-extrabold text-indigo-600 mt-2">
      {analytics.totalUnlocksForAllLocalJobs || 0}
    </p>
  </div>

  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Posting Credits
    </p>

    <p className="text-2xl font-extrabold text-slate-900 mt-2">
      {analytics.credits?.totalPostingCredits || 0}
    </p>
  </div>

  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Unlock Credits
    </p>

    <p className="text-2xl font-extrabold text-slate-900 mt-2">
      {analytics.credits?.totalUnlockCredits || 0}
    </p>
  </div>

  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase">
      Total Credits Spent
    </p>

    <p className="text-2xl font-extrabold text-indigo-600 mt-2">
      {analytics.credits?.overallTotalCreditsSpent || 0}
    </p>
  </div>

</div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6 text-center w-16">SNo.</th>
                  <th className="py-4.5 px-4 w-28">Task Asset</th>
                  <th className="py-4.5 px-4 w-52">Title & Specifications</th>
                  <th className="py-4.5 px-4 w-56">Sender profile</th>
                  <th className="py-4.5 px-4 w-70">Location Address</th>
                  <th className="py-4.5 px-4 w-36">Work Format</th>
                  <th className="py-4.5 px-4 w-40">WhatsApp Hub</th>
                  <th className="py-4.5 px-3 w-32">Status</th>
                  <th className="py-4.5 px-4 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tasks.length > 0 ? (
                  tasks.map((t, i) => (
                    <tr key={t._id || i} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                      <td className="py-5 px-6 text-center font-bold text-slate-400">
                        {(page - 1) * 10 + i + 1}
                      </td>
                      <td className="py-5 px-4">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {t.images?.[0] ? (
                            <img
                              src={t.images[0]}
                              alt={t.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Image size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-0.5 overflow-hidden">
                          <p className="font-semibold text-slate-800 text-base truncate group-hover:text-indigo-600 transition-colors duration-150">
                            {t.title}
                          </p>
                          
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                            <User size={13} className="text-slate-400 shrink-0" />
                            {t.userId?.fullName || "N/A"}
                          </span>
                          <span className={`inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                            t.userId?.role === "ADMIN" 
                              ? "bg-purple-50 text-purple-700 border-purple-100" 
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                            <Shield size={10} />
                            {t.userId?.role || "USER"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5 text-slate-500 overflow-hidden">
                          <MapPin size={15} className="text-indigo-500 shrink-0" />
                          <span className="truncate" title={t.location?.address}>
                            {t.location?.address || "No Address Added"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {t.workType}
                        </span>
                      </td>
                      <td className="py-5 px-6 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                          <span className="truncate">{t.whatsappNumber}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          t.status === "active" || t.status === "open"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.status === "active" || t.status === "open" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {t.status || "inactive"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setIsViewMode(true);
                              setIsPostModalOpen(true);
                            }}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-all duration-150 cursor-pointer border border-slate-100"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-900 rounded-xl transition-all duration-150 cursor-pointer border border-indigo-100/50"
                            title="Edit Task"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-950 rounded-xl transition-all duration-150 cursor-pointer border border-rose-100/50"
                            title="Delete Task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-12 px-6 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <HelpCircle size={32} className="text-slate-300 animate-bounce" />
                        <span>No records listed in this database yet.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-t border-slate-100 w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition duration-150 shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
                Prev
              </button>
              <button
                disabled={page === pagination.totalPages || !pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition duration-150 shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

      </div>

   {isPostModalOpen && isViewMode && (
  <ThemedTaskModal
    initialData={selectedTask}
    analytics={analytics}
    isViewMode={isViewMode}
    onClose={() => {
      setIsPostModalOpen(false);
      setSelectedTask(null);
      setIsViewMode(false);
    }}
  />
)}

{isPostModalOpen && !isViewMode && (
  <PostTaskModal
    initialData={selectedTask}
    onSave={handlePostNewAPI}
    onClose={() => {
      setIsPostModalOpen(false);
      setSelectedTask(null);
      setIsViewMode(false);
    }}
  />
)}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 size={28} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Confirm Deletion
                </h2>
                <p className="text-slate-500 text-sm">
                  Are you sure you want to permanently remove this local task assignment? This action is irreversible.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition duration-150 cursor-pointer"
              >
                Cancel Action
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-100 hover:shadow-rose-200 transition duration-150 cursor-pointer"
              >
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ThemedTaskModal = ({
  onSave,
  onClose,
  initialData,
  isViewMode,
  analytics,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isUserListOpen, setIsUserListOpen] = useState(false); 
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    workType: "",
    whatsappNumber: "",
    userName: "",
    userRole: "",
    budget: { min: "", max: "" },
    preferredCommunication: [],
    location: { type: "Point", coordinates: ["", ""], address: "" },
    images: null,
    isFeatured: false,
    status: "expired",
    expiresAt: "",
  });

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      title: initialData.title || "",
      details: initialData.details || "",
      workType: initialData.workType || "",
      whatsappNumber: initialData.whatsappNumber || "",
      userName: initialData.userId?.fullName || "N/A",
      userRole: initialData.userId?.role || "N/A",
      budget: {
        min: initialData.budget?.min || "",
        max: initialData.budget?.max || "",
      },
      preferredCommunication: initialData.preferredCommunication || [],
      location: {
        type: "Point",
        coordinates: initialData.location?.coordinates || ["", ""],
        address: initialData.location?.address || "",
      },
      images: null,
      isFeatured: initialData.isFeatured || false,
      status: initialData.status || "expired",
      expiresAt: initialData.expiresAt || "",
    });

    if (initialData.images?.length) {
      setPreviewImage(initialData.images[0]);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "images") {
      const file = files[0];
      setFormData({ ...formData, images: file });
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else if (name.includes("location")) {
      const updatedLocation = { ...formData.location };
      if (name === "location.address") {
        updatedLocation.address = value;
      } else if (name === "location.coordinates[0]") {
        updatedLocation.coordinates[0] = value;
      } else if (name === "location.coordinates[1]") {
        updatedLocation.coordinates[1] = value;
      }
      setFormData({ ...formData, location: updatedLocation });
    } else if (name === "budget.min") {
      setFormData({
        ...formData,
        budget: { ...formData.budget, min: value },
      });
    } else if (name === "budget.max") {
      setFormData({
        ...formData,
        budget: { ...formData.budget, max: value },
      });
    } else if (name === "preferredCommunication") {
      const updated = formData.preferredCommunication.includes(value)
        ? formData.preferredCommunication.filter((v) => v !== value)
        : [...formData.preferredCommunication, value];
      setFormData({ ...formData, preferredCommunication: updated });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [longitude, latitude],
          },
        }));
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location coordinates");
      },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.details ||
      !formData.workType ||
      !formData.whatsappNumber ||
      !formData.budget.min ||
      !formData.budget.max ||
      !formData.location.address ||
      !formData.location.coordinates[0] ||
      !formData.location.coordinates[1] ||
      formData.preferredCommunication.length === 0
    ) {
      toast.error("Please fill all required fields", { autoClose: 3000 });
      return;
    }
    const whatsapp = formData.whatsappNumber?.toString().replace(/\D/g, "");

    if (whatsapp.length < 10) {
      toast.error("WhatsApp number must be at least 10 digits", {
        autoClose: 3000,
      });
      return;
    }
    onSave(formData, initialData?._id || null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform scale-100 transition-all">
        
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={20} />
            <h2 className="font-extrabold text-base tracking-wide uppercase">
              {isViewMode
                ? "View Specifications"
                : initialData
                  ? "Adjust Task Fields"
                  : "Post A New Task"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white text-slate-700">
          
 {isViewMode && initialData && (
  <div className="space-y-4">
    {/* Profile Card */}
    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
      {initialData.userId?.profilePhoto ? (
        <img
          src={initialData.userId.profilePhoto}
          alt={initialData.userId?.fullName}
          className="w-16 h-16 rounded-full object-cover border border-slate-200"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
          <User size={24} className="text-indigo-600" />
        </div>
      )}
      <div>
        <p className="font-bold text-slate-800 text-base">
          {initialData.userId?.fullName || "N/A"}
        </p>
        <p className="text-sm text-slate-500">
          {initialData.userId?.mobile || "N/A"}
        </p>
        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
          <Shield size={10} />
          {initialData.userId?.role || "USER"}
        </span>
      </div>
    </div>

    {/* Status + Featured */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Status
        </label>
        <div
          className={`w-full border p-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 ${
            initialData.status === "active" || initialData.status === "open"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              initialData.status === "active" || initialData.status === "open"
                ? "bg-emerald-500"
                : "bg-rose-500"
            }`}
          />
          {initialData.status || "inactive"}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Featured
        </label>
        <div
          className={`w-full border p-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 ${
            initialData.isFeatured
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          <Sparkles size={15} className={initialData.isFeatured ? "text-amber-500" : "text-slate-400"} />
          {initialData.isFeatured ? "Yes, Featured" : "Not Featured"}
        </div>
      </div>
    </div>

    {/* WhatsApp Number */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        WhatsApp Contact Number
      </label>
      <div className="w-full border border-slate-200 bg-slate-50 p-3.5 rounded-2xl font-semibold text-slate-800 flex items-center gap-2">
        <Phone size={16} className="text-emerald-500" />
        {initialData.whatsappNumber || "N/A"}
      </div>
    </div>

    {/* Communication Preferences */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Communication Preferences
      </label>
      <div className="flex gap-3">
        {initialData.preferredCommunication?.length > 0 ? (
          initialData.preferredCommunication.map((pref) => (
            <span
              key={pref}
              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl text-sm font-bold"
            >
              {pref === "Chat" ? (
                <MessageSquare size={14} className="text-emerald-500" />
              ) : (
                <Phone size={14} className="text-indigo-500" />
              )}
              {pref}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-400">None specified</span>
        )}
      </div>
    </div>

    {/* Credits + Unlocks */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Credits Spent on Task
        </label>
        <div className="w-full border border-slate-200 bg-slate-50 p-3.5 rounded-2xl text-slate-800 font-bold">
          {initialData.creditsSpent || 0}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Number of Unlocks
        </label>
        <div className="w-full border border-slate-200 bg-slate-50 p-3.5 rounded-2xl text-slate-800 font-bold">
          {initialData.jobUnlockCount || 0}
        </div>
      </div>
    </div>
    {initialData.jobUnlockCount > 0 && (
<button
  type="button"
  onClick={() => setIsUserListOpen(true)}
  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer"
>
  <User size={15} />
  View User Details ({initialData.jobUnlockCount || 0})
</button>
)}
  </div>
)}
          <div className="flex justify-end gap-2.5 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-sm rounded-2xl transition duration-150 cursor-pointer"
            >
              Close Window
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition duration-150 cursor-pointer"
              >
                {initialData ? "Save Alterations" : "Broadcast Task"}
              </button>
            )}
          </div>
        </form>
      </div>
      {isUserListOpen && (
  <UnlockedUsersModal
    users={initialData.unlockedByUsers || []}
    onClose={() => setIsUserListOpen(false)}
  />
)}
    </div>
  );
};

export default LocalNeeds;