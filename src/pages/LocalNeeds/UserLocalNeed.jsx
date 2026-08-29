import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getPublicUserLocalJobs, deleteLocalJob } from "../../auth/adminLogin";
import { 
  Trash2, MapPin, Phone, X, ChevronLeft, ChevronRight, 
  Sparkles, Image, Compass, Eye, DollarSign, Calendar, MessageSquare, User, Shield
} from "lucide-react";

const UserLocalNeeds = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [page, setPage] = useState(1);
  const [jobType, setJobType] = useState(
    window.location.pathname.includes("user-local") ? "USER" : "ADMIN"
  );
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const itemsPerPage = pagination.pageSize || 5;
  const totalPages = pagination.totalPages || 1;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getPublicUserLocalJobs(page, jobType);
        setTasks(res.data || []);
        setPagination(res.pagination || {});
      } catch (err) {
        toast.error("Failed to fetch jobs");
      }
    };

    fetchJobs();
  }, [page, jobType]);

  const handleDelete = (id) => {
    setSelectedTaskId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLocalJob(selectedTaskId);
      setTasks((prev) => prev.filter((item) => item._id !== selectedTaskId));
      toast.success("Deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleOpenView = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  return (
    <>
    <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        height: 8px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
    background: #fafafa !important;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
       background: #e2e8f0 !important;
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
     background: #e2e8f0 !important;
      }
    `}</style>
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans selection:bg-indigo-500 selection:text-white w-full">
      <div className="w-full space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Compass className="text-indigo-600 animate-spin-slow" size={28} />
              User Local Tasks
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Public User Panel - Monitor and oversee jobs initialized by platform end-users.
            </p>
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={jobType}
              onChange={(e) => {
                const value = e.target.value;
                setJobType(value);
                if (value === "ADMIN") {
                  navigate("/needsManagement");
                } else {
                  navigate("/user-local");
                }
              }}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 cursor-pointer appearance-none"
            >
              <option value="ADMIN">Admin View</option>
              <option value="USER">User View</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 w-full">
         
            <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full min-w-[1200px] text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6 text-center w-16">S.No.</th>
                  <th className="py-4.5 px-4 w-28">Image</th>
                  <th className="py-4.5 px-6 w-72">Title</th>
                  <th className="py-4.5 px-6 w-80">Location Address</th>
                  <th className="py-4.5 px-6 w-40">Work Format</th>                 
                   <th className="py-4.5 px-6 w-44">WhatsApp Hub</th>
                  <th className="py-4.5 px-6 w-36">Status</th>
                  <th className="py-4.5 px-6 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tasks.length > 0 ? (
                  tasks.map((t, index) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                      <td className="py-5 px-6 text-center font-bold text-slate-400">
                        {index + 1 + (page - 1) * itemsPerPage}
                      </td>
                      <td className="py-5 px-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {t.images?.[0] ? (
                            <img
                              src={t.images[0]}
                              alt={t.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Image size={18} />
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
                        <div className="flex items-center gap-1.5 text-slate-500 overflow-hidden">
                          <MapPin size={15} className="text-indigo-500 shrink-0" />
                          <span className="truncate" title={t.location?.address}>
                            {t.location?.address || "No Address Specified"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {t.workType ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {t.workType}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-5 px-6 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Phone size={14} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{t.whatsappNumber || t.userId?.mobile || "-"}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          t.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {t.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenView(t)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-all duration-150 cursor-pointer border border-slate-100 inline-flex items-center justify-center shadow-sm"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-950 rounded-xl transition-all duration-150 cursor-pointer border border-rose-100/50 inline-flex items-center justify-center shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 px-6 text-center text-slate-400 font-medium">
                      No user Tasks recorded in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-t border-slate-100 w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Page {page} of {totalPages}
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
                disabled={page === totalPages}
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

      {isViewModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform scale-100 transition-all">
            
            <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400 animate-pulse" size={20} />
                <h2 className="font-extrabold text-base tracking-wide uppercase">
                  Task Specifications Details
                </h2>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white text-slate-700">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {selectedTask.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      selectedTask.isFeatured 
                        ? "bg-amber-50 text-amber-700 border border-amber-200" 
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {selectedTask.isFeatured ? "Featured Need" : "Standard Task"}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      selectedTask.status === "active" || selectedTask.status === "open"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>
                </div>
                
                {selectedTask.images?.[0] && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner shrink-0">
                    <img 
                      src={selectedTask.images[0]} 
                      alt={selectedTask.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Description & Guidelines</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm whitespace-pre-wrap">
                  {selectedTask.details || "No explicit detail specification was written for this job description."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Creator Profile</span>
                  <div className="w-full border border-slate-150 bg-slate-50/50 p-3.5 rounded-2xl text-slate-700 flex items-center gap-2 font-semibold">
                    <User size={16} className="text-indigo-500" />
                    <span>{selectedTask.userId?.name || "N/A"}</span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-auto">
                      {selectedTask.userId?.role || "USER"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Work Format Type</span>
                  <div className="w-full border border-slate-150 bg-slate-50/50 p-3.5 rounded-2xl text-slate-700 flex items-center gap-2 font-semibold">
                    <Sparkles size={16} className="text-indigo-500" />
                    <span>{selectedTask.workType || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Geographical Area</span>
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-sm">{selectedTask.location?.address || "No Area Provided"}</span>
                    {selectedTask.location?.coordinates && (
                      <span className="block text-xs font-mono text-slate-400">
                        LAT: {selectedTask.location.coordinates[1]} | LNG: {selectedTask.location.coordinates[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Compensation Budget</span>
                  <div className="flex items-center gap-1.5 text-indigo-700 font-extrabold text-lg mt-1">
                    <DollarSign size={20} />
                    <span>{selectedTask.budget?.min}</span>
                    <span className="text-slate-400 font-normal text-sm px-1">-</span>
                    <DollarSign size={20} />
                    <span>{selectedTask.budget?.max}</span>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Communication Channels</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {selectedTask.preferredCommunication?.map((medium, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-sm">
                        {medium === "Whatsapp" ? <MessageSquare size={12} className="text-emerald-500" /> : <Phone size={12} className="text-indigo-500" />}
                        {medium}
                      </span>
                    ))}
                    {(!selectedTask.preferredCommunication || selectedTask.preferredCommunication.length === 0) && (
                      <span className="text-xs text-slate-400">None Provided</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Created: {new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <Calendar size={14} className="text-rose-400" />
                  <span>Expires: {new Date(selectedTask.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-gray-50 shrink-0">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md transition duration-150 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100 animate-pulse">
                <Trash2 size={28} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Confirm Deletion
                </h2>
                <p className="text-slate-500 text-sm">
                  Are you sure you want to permanently erase this user task post? This database operation is final.
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
    </div></>
  );
};

export default UserLocalNeeds;