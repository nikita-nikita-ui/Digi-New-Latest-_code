import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  X,
  Star,
  CheckCircle,
  Plus,
  ChevronDown,
  Upload,
  MapPin,
  Briefcase,
  IndianRupee,
  Users,
  GraduationCap,
  Phone,
  Info,
  Layout,
  Navigation,
  FileText,
  Eye,
  Trash2,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllFullTimeJobs,
  createNewFullTimeJob,
  getAllUsersAPI,
  deleteFullTimeJob,
  updateFullTimeJob,
  updateFullTimeJobStatus,
  getFullTimeJobStats,
} from "../../auth/adminLogin";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const normalizeJobData = (job) => {
  if (!job) return null;
  const salary = job.salaryRange || {};
  return {
    _id: job._id || Math.random().toString(),
    name: job.userId?.fullName || job.userId?.name || "N/A",
    title: job.title || "Untitled Job",
    companyName: job.companyName || "Individual",
    location: job.location?.address || "Location Not Set",
    jobRole: job.jobRole || "Not Specified",
    budget: {
      min: salary.min || 0,
      max: salary.max || 0,
    },
    isFeatured: !!job.isFeatured,
    status: job.status || "active",
    isActive: job.status === "active",
    description: job.description || "No description provided.",
    details: job.details || "No details provided.",
    vacancies: job.vacancies || "N/A",
    experience: job.experience || "N/A",
    qualification: job.qualification || "N/A",
    whatsappNumber: job.whatsappNumber || "N/A",
  };
};

const InputField = ({ icon: Icon, label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
      {Icon && <Icon size={12} className="text-slate-400" />} {label}
    </label>
    <input
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-slate-600"
    />
  </div>
);

const FullTimeJobManagement = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editJobForm, setEditJobForm] = useState(null);
  const [isEditSuccessVisible, setIsEditSuccessVisible] = useState(false);
  const [jobType, setJobType] = useState("FULL");
  const navigate = useNavigate();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("active");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [stats, setStats] = useState(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const initialNewJobForm = {
    userId: "",
    title: "",
    companyName: "",
    description: "",
    details: "",
    jobRole: "",
    vacancies: "",
    whatsappNumber: "",
    experience: "",
    qualification: "",
    salaryMin: "",
    salaryMax: "",
    address: "",
    lng: import.meta.env.VITE_DEFAULT_LNG || "77.2090",
    lat: import.meta.env.VITE_DEFAULT_LAT || "28.6139",
    images: null,
  };

  const [newJobForm, setNewJobForm] = useState(initialNewJobForm);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsersAPI();
        setUsersList(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsResponse, statsResponse] = await Promise.all([
        getAllFullTimeJobs(currentPage),
        getFullTimeJobStats(),
      ]);

      const jobsArray = Array.isArray(jobsResponse?.data)
        ? jobsResponse.data
        : [];
      setAllJobs(jobsArray.map(normalizeJobData).filter(Boolean));
      setTotalPages(jobsResponse?.pagination?.totalPages || 1);

      if (statsResponse?.success && statsResponse?.data) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewJobForm((prev) => ({ ...prev, images: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setNewJobForm((prev) => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
        }));

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
          );
          const data = await response.json();

          if (data.status === "OK" && data.results[0]) {
            setNewJobForm((prev) => ({
              ...prev,
              address: data.results[0].formatted_address,
            }));
          } else {
            alert("Coordinates fetched! Please enter address manually.");
          }
        } catch (err) {
          // Added 'err' here
          alert("Failed to get address. Please type it manually.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => {
        setIsFetchingLocation(false);
        alert("Location access denied. Please enable GPS.");
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  const handleNewJobSubmit = async (e) => {
    e.preventDefault();
    if (!newJobForm.userId) {
      alert("Please select a posting user");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    if (newJobForm.images) {
      formData.append("images", newJobForm.images);
    }

    formData.append("title", newJobForm.title);
    formData.append("description", newJobForm.description);
    formData.append("companyName", newJobForm.companyName);
    formData.append("details", newJobForm.details);
    formData.append(
      "salaryRange",
      JSON.stringify({
        min: Number(newJobForm.salaryMin),
        max: Number(newJobForm.salaryMax),
      }),
    );
    formData.append("jobRole", newJobForm.jobRole);
    formData.append("vacancies", newJobForm.vacancies);
    formData.append("whatsappNumber", newJobForm.whatsappNumber);
    formData.append("experience", newJobForm.experience);
    formData.append("qualification", newJobForm.qualification);
    formData.append("location[coordinates][0]", newJobForm.lng);
    formData.append("location[coordinates][1]", newJobForm.lat);
    formData.append("location[address]", newJobForm.address);
    formData.append("userId", newJobForm.userId);

    try {
      await createNewFullTimeJob(formData);
      await fetchJobs();
      setIsAddModalOpen(false);
      setNewJobForm(initialNewJobForm);
      setImagePreview(null);
      setIsSuccessModalOpen(true);
    } catch (err) {
      alert(err.message || "Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewModal = (job) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (job) => {
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  };

  const openStatusModal = (job) => {
    setSelectedJob(job);
    setStatusToUpdate(job.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdateConfirm = async () => {
    if (!selectedJob) return;
    setIsUpdatingStatus(true);
    try {
      await updateFullTimeJobStatus(selectedJob._id, statusToUpdate);
      await fetchJobs();
      setIsStatusModalOpen(false);
      setSelectedJob(null);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;
    setIsDeleting(true);
    try {
      if (typeof deleteFullTimeJob === "function") {
        await deleteFullTimeJob(selectedJob._id);
      }
      await fetchJobs();
      setIsDeleteModalOpen(false);
      setSelectedJob(null);
    } catch (error) {
      alert(error.message || "Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (job) => {
    setEditJobForm({
      id: job._id,
      title: job.title,
      details: job.details,
      status: job.status,
      workType: job.jobRole || "",
      salaryMin: job.budget?.min || 0,
      salaryMax: job.budget?.max || 0,
      preferredCommunication: "Text",
      images: null,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", editJobForm.title);
      formData.append("details", editJobForm.details);
      formData.append("status", editJobForm.status);
      formData.append("jobRole", editJobForm.workType);
      formData.append(
        "salaryRange",
        JSON.stringify({
          min: Number(editJobForm.salaryMin),
          max: Number(editJobForm.salaryMax),
        }),
      );
      if (editJobForm.images) formData.append("images", editJobForm.images);

      await updateFullTimeJob(editJobForm.id, formData);
      await fetchJobs();
      setIsEditModalOpen(false);
      setIsEditSuccessVisible(true);

      setTimeout(() => {
        setIsEditSuccessVisible(false);
      }, 5000);
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "active":
        return "text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50";
      case "closed":
        return "text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100/50";
      case "expired":
        return "text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100/50";
      default:
        return "text-slate-600 bg-slate-50 border border-slate-100 hover:bg-slate-100/50";
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#fafbfe] min-h-screen font-sans relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Full Time Job Board
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage and post full-time opportunities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={jobType}
            onChange={(e) => {
              const value = e.target.value;
              setJobType(value);
              if (value === "FULL") {
                navigate("/FullTimeJobs");
              } else {
                navigate("/user-full");
              }
            }}
            className="w-36 bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
          >
            <option value="FULL">Admin Jobs</option>
            <option value="PART">User Jobs</option>
          </select>
          <button
            onClick={() => {
              setNewJobForm(initialNewJobForm);
              setIsAddModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={15} /> Post New Job
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Total Jobs
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.totalJobs}
              </h3>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Admin Jobs
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.adminJobsCount}
              </h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                User Jobs
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.userJobsCount}
              </h3>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Expired Jobs
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.expiredJobsCount}
              </h3>
            </div>
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={24} />
          <p className="text-slate-400 text-xs">Loading records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-14 text-center">
                    S.No
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Role & Company
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Featured
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-16 text-center text-slate-400 text-sm"
                    >
                      No active listings found
                    </td>
                  </tr>
                ) : (
                  allJobs.map((job, idx) => {
                    const serialNumber = (currentPage - 1) * 10 + (idx + 1);
                    return (
                      <tr
                        key={job._id}
                        className="hover:bg-slate-50/50 transition-colors duration-150"
                      >
                        <td className="p-4 text-xs font-semibold text-slate-400 text-center">
                          {serialNumber}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-700 text-sm leading-tight">
                            {job.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Briefcase size={12} className="text-slate-300" />{" "}
                            {job.companyName}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-500 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                            {job.jobRole}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-600">
                          {job.name}
                        </td>
                        <td className="p-4 text-center">
                          <Star
                            size={16}
                            className={
                              job.isFeatured
                                ? "text-amber-400 fill-amber-400 mx-auto"
                                : "text-slate-200 mx-auto"
                            }
                          />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => openStatusModal(job)}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg tracking-wider uppercase transition-all duration-200 ${getStatusBadgeStyle(job.status)}`}
                          >
                            {job.status}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-1.5">
                            <ActionBtn
                              text="View"
                              variant="indigo"
                              icon={<Eye size={12} />}
                              onClick={() => openViewModal(job)}
                            />
                            <ActionBtn
                              text="Edit"
                              variant="slate"
                              icon={<Edit size={12} />}
                              onClick={() => openEditModal(job)}
                            />
                            <ActionBtn
                              text="Delete"
                              variant="rose"
                              icon={<Trash2 size={12} />}
                              onClick={() => openDeleteModal(job)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Page <span className="text-indigo-600">{currentPage}</span> of{" "}
              {totalPages}
            </div>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg transition-all duration-150"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg transition-all duration-150"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layout className="text-indigo-600" size={18} /> Create
                Full-Time Listing
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleNewJobSubmit}
              className="p-6 overflow-y-auto space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 ml-1">
                    <Users size={12} className="text-slate-400" /> Posting User
                    ID
                  </label>
                  <div
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="border border-slate-200 bg-slate-50 p-3 rounded-xl flex justify-between items-center cursor-pointer text-xs font-semibold text-slate-600 hover:border-slate-300 transition-colors"
                  >
                    <span>
                      {usersList.find((u) => u._id === newJobForm.userId)
                        ?.fullName || "Select User"}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                  {isUserDropdownOpen && (
                    <div className="absolute z-[100] w-full bg-white border border-slate-100 mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                      {usersList.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => {
                            setNewJobForm({ ...newJobForm, userId: u._id });
                            setIsUserDropdownOpen(false);
                          }}
                          className="p-3 hover:bg-indigo-50/50 cursor-pointer text-xs flex flex-col"
                        >
                          <span className="font-bold text-slate-700">
                            {u.fullName || u.mobile}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {u._id}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <InputField
                  label="Company Name"
                  name="companyName"
                  icon={Briefcase}
                  placeholder="Tech Solutions Ltd"
                  required
                  value={newJobForm.companyName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Job Title"
                    name="title"
                    icon={Info}
                    placeholder="Senior Software Engineer"
                    required
                    value={newJobForm.title}
                    onChange={handleInputChange}
                  />
                </div>
                <InputField
                  label="Job Role"
                  name="jobRole"
                  icon={Layout}
                  placeholder="Developer"
                  required
                  value={newJobForm.jobRole}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputField
                  label="Min Salary"
                  name="salaryMin"
                  icon={IndianRupee}
                  type="number"
                  required
                  value={newJobForm.salaryMin}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Max Salary"
                  name="salaryMax"
                  icon={IndianRupee}
                  type="number"
                  required
                  value={newJobForm.salaryMax}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Experience"
                  name="experience"
                  icon={Briefcase}
                  placeholder="3-5 Years"
                  required
                  value={newJobForm.experience}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Vacancies"
                  name="vacancies"
                  icon={Users}
                  type="number"
                  placeholder="5"
                  required
                  value={newJobForm.vacancies}
                  onChange={handleInputChange}
                />
              </div>

              <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} /> Location Details
                  </h3>
                  <button
                    type="button"
                    onClick={handleAutoFetchLocation}
                    disabled={isFetchingLocation}
                    className="flex items-center gap-1.5 bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                  >
                    {isFetchingLocation ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Navigation size={12} />
                    )}
                    {isFetchingLocation
                      ? "Fetching..."
                      : "Auto-fetch Coordinates"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <InputField
                      label="Full Address"
                      name="address"
                      placeholder="New Delhi, India"
                      required
                      value={newJobForm.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label="Longitude"
                      name="lng"
                      required
                      value={newJobForm.lng}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Latitude"
                      name="lat"
                      required
                      value={newJobForm.lat}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Qualification"
                  name="qualification"
                  icon={GraduationCap}
                  placeholder="B.Tech / MCA"
                  required
                  value={newJobForm.qualification}
                  onChange={handleInputChange}
                />
                <InputField
                  label="WhatsApp Number"
                  name="whatsappNumber"
                  icon={Phone}
                  placeholder="9123456789"
                  required
                  value={newJobForm.whatsappNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 ml-1">
                    <Info size={12} className="text-slate-400" /> Short
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Full-time role summary..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 h-20 resize-none text-slate-600"
                    required
                    value={newJobForm.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 ml-1">
                    <FileText size={12} className="text-slate-400" /> Full Role
                    Details (Benefits, Timing, etc.)
                  </label>
                  <textarea
                    name="details"
                    placeholder="Comprehensive overview of expectations, package, timings..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 h-28 resize-none text-slate-600"
                    required
                    value={newJobForm.details}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current.click()}
                className="border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50/50 hover:border-indigo-500 transition-colors duration-200 bg-slate-50"
              >
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {imagePreview ? (
                  <div className="relative group rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <p className="text-white text-xs font-bold">
                        Replace Banner
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-white p-3 rounded-full inline-block mb-2 text-slate-400 shadow-sm">
                      <Upload size={20} className="text-indigo-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      Upload Job Banner (Images)
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle size={15} />
                  )}
                  {isSubmitting ? "PUBLISHING..." : "PUBLISH JOB NOW"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye className="text-indigo-600" size={18} /> Job Details
                Overview
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Job Title
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.title}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Company Name
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Role Profile
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.jobRole}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.location}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Salary Range
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    ₹{selectedJob.budget.min} - ₹{selectedJob.budget.max}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Experience
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.experience}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Vacancies
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.vacancies} Positions
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Qualification
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.qualification}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    WhatsApp Contact
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedJob.whatsappNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Listing Status
                  </p>
                  <span
                    className={`inline-flex text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 tracking-wider uppercase ${getStatusBadgeStyle(selectedJob.status)}`}
                  >
                    {selectedJob.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Brief Summary
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Listing details
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                    {selectedJob.details}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all duration-200"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Edit className="text-indigo-600" size={16} /> Update Status
              </h2>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Select the current status for{" "}
                <strong>{selectedJob.title}</strong>:
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {["active", "closed", "expired"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusToUpdate(st)}
                    className={`px-3 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
                      statusToUpdate === st
                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-700 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100/70"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                disabled={isUpdatingStatus}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdateConfirm}
                disabled={isUpdatingStatus}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {isUpdatingStatus ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CheckCircle size={12} />
                )}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Delete Job Posting?
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              This action is permanent and cannot be undone for{" "}
              <strong>{selectedJob.title}</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl font-semibold text-xs transition-colors duration-150 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors duration-150 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8 text-center transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Listing Live!
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Your job listing has been successfully published
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && editJobForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit className="text-indigo-600" size={18} /> Edit Job Listing
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <InputField
                label="Job Title"
                value={editJobForm.title}
                onChange={(e) =>
                  setEditJobForm({ ...editJobForm, title: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Work Type / Role"
                  value={editJobForm.workType}
                  onChange={(e) =>
                    setEditJobForm({ ...editJobForm, workType: e.target.value })
                  }
                />
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                    Status
                  </label>

                  <div
                    onClick={() =>
                      setIsStatusDropdownOpen(!isStatusDropdownOpen)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-600 flex justify-between items-center cursor-pointer hover:border-indigo-400 transition-all duration-200"
                  >
                    <span className="capitalize">{editJobForm.status}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isStatusDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                      {["active", "closed", "expired"].map((status) => (
                        <div
                          key={status}
                          onClick={() => {
                            setEditJobForm({ ...editJobForm, status });
                            setIsStatusDropdownOpen(false);
                          }}
                          className="px-4 py-3 text-xs font-medium text-slate-600 hover:bg-indigo-50 cursor-pointer capitalize"
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Min Salary (₹)"
                  type="number"
                  value={editJobForm.salaryMin}
                  onChange={(e) =>
                    setEditJobForm({
                      ...editJobForm,
                      salaryMin: e.target.value,
                    })
                  }
                />
                <InputField
                  label="Max Salary (₹)"
                  type="number"
                  value={editJobForm.salaryMax}
                  onChange={(e) =>
                    setEditJobForm({
                      ...editJobForm,
                      salaryMax: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                  Full Job Details/Description
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 h-24 resize-none"
                  value={editJobForm.details}
                  onChange={(e) =>
                    setEditJobForm({ ...editJobForm, details: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Update Banner Image
                </label>
                <input
                  type="file"
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  onChange={(e) =>
                    setEditJobForm({
                      ...editJobForm,
                      images: e.target.files[0],
                    })
                  }
                />
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 shadow-sm"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditSuccessVisible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1001] animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 min-w-[320px]">
            <div className="bg-emerald-500 p-2 rounded-full shadow-lg shadow-emerald-500/20">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-xs tracking-wide">
                SUCCESSFULLY UPDATED
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                Changes are now live
              </p>
            </div>
            <button
              onClick={() => setIsEditSuccessVisible(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({ text, variant, onClick, icon }) => {
  const styles = {
    rose: "bg-rose-50/70 text-rose-600 border-rose-100 hover:bg-rose-500 hover:text-white hover:border-transparent",
    slate:
      "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-800 hover:text-white hover:border-transparent",
    indigo:
      "bg-indigo-50/70 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-transparent",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-150 ${styles[variant]}`}
    >
      {icon} {text}
    </button>
  );
};

export default FullTimeJobManagement;
