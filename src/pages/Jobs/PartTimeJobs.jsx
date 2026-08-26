import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AlertCircle,
  X,
  Star,
  Trash2,
  PlusCircle,
  Loader2,
  Eye,
  Upload,
  Image as ImageIcon,
  User,
  MapPin,
  MessageSquare,
  Navigation,
  AlignLeft,
  Phone,
  Calendar,
  Briefcase,
  IndianRupee,
} from "lucide-react";
import {
  getAllJobs,
  updateJob,
  deleteJob,
  createNewJob,
  getAllUsersAPI,
} from "../../auth/adminLogin";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const JobViewModal = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Job Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {job.images && job.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {job.images.map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-2xl border border-slate-100 aspect-video bg-slate-50">
                  <img
                    src={img}
                    alt="Job"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {job.jobCategory}
              </span>
              {job.isFeatured && (
                <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> FEATURED
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{job.title}</h1>
            <p className="text-slate-400 text-xs font-medium flex items-center gap-1.5 mt-1.5">
              <MapPin size={13} className="text-slate-400" />{" "}
              {job.location?.address || "No address provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="text-center md:text-left border-r border-slate-100 last:border-0 md:pl-2">
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                Salary Range
              </p>
              <p className="text-sm font-bold text-slate-700">
                ₹{job.salaryRange?.min} - {job.salaryRange?.max}
              </p>
            </div>
            <div className="text-center md:text-left border-r border-slate-100 last:border-0 md:pl-4">
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                Vacancies
              </p>
              <p className="text-sm font-bold text-slate-700">
                {job.vacancies} Posts
              </p>
            </div>
            <div className="text-center md:text-left border-r border-slate-100 last:border-0 md:pl-4">
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                Experience
              </p>
              <p className="text-sm font-bold text-slate-700">
                {job.experience}
              </p>
            </div>
            <div className="text-center md:text-left last:border-0 md:pl-4">
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                Qualification
              </p>
              <p className="text-sm font-bold text-slate-700">
                {job.qualification}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                <AlignLeft size={14} className="text-slate-400" /> Job Description
              </h4>
              <div className="bg-slate-50/50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed whitespace-pre-line border border-slate-100">
                {job.details || "No detailed description available."}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Company Info
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {job.companyName || "N/A"}
                </p>
                <p className="text-xs text-indigo-500 font-medium mt-1 uppercase">
                  {job.jobRole}
                </p>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Contact Preference
                </p>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Phone size={13} />{" "}
                  <span>{job.whatsappNumber || "No Number"}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Method: {job.preferredCommunication?.join(", ") || "WhatsApp"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all duration-200"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

const PartTimeJobManagement = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [createImages, setCreateImages] = useState([]);
  const [editNewImages, setEditNewImages] = useState([]);

  const createFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState(null);
  const [jobType, setJobType] = useState("ADMIN");
  const navigate = useNavigate();
  const initialJobState = {
    userId: "",
    title: "",
    description: "",
    companyName: "",
    jobRole: "",
    vacancies: 5,
    minPay: "",
    maxPay: "",
    details: "",
    whatsappNumber: "",
    experience: "Fresher",
    qualification: "10th Pass",
    address: "",
    latitude: "19.0760",
    longitude: "72.8777",
    status: "active",
    isFeatured: false,
    preferredCommunication: ["WhatsApp"],
  };

  const [newJob, setNewJob] = useState(initialJobState);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllJobs(currentPage);
      const jobs = response?.data?.data || response?.data || response;

      const sortedJobs = Array.isArray(jobs)
        ? jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      setAllJobs(sortedJobs);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (err) {
      toast.error("Error fetching job list");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsersAPI();
      if (response.success) setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const category = String(job.jobCategory || "").toLowerCase();
      return category.includes("part");
    });
  }, [allJobs]);

  const handleFetchLocation = (type) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );
          const osmData = await osmRes.json();
          const address = osmData.display_name || "Location Found";

          if (type === "create") {
            setNewJob((prev) => ({ ...prev, latitude, longitude, address }));
          } else {
            setSelectedJob((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                address,
                coordinates: [longitude, latitude],
              },
            }));
          }
          toast.success("Location updated!");
        } catch (error) {
          toast.error("Error resolving address");
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setLocLoading(false);
      },
    );
  };

  const handleCreateNewJob = async () => {
    if (!newJob.userId) return toast.error("Select a User first!");
    if (!newJob.title?.trim()) return toast.error("Job Title is required!");

    try {
      setSaveLoading(true);
      const formData = new FormData();

      formData.append("title", newJob.title);
      formData.append("description", newJob.description);
      formData.append("details", newJob.details);
      formData.append("companyName", newJob.companyName);
      formData.append("jobRole", newJob.jobRole);
      formData.append("vacancies", newJob.vacancies);
      formData.append("whatsappNumber", newJob.whatsappNumber);
      formData.append("experience", newJob.experience);
      formData.append("qualification", newJob.qualification);
      formData.append("isFeatured", String(newJob.isFeatured));
      formData.append("jobCategory", "PART_TIME_JOB");

      formData.append("salaryRange[min]", newJob.minPay);
      formData.append("salaryRange[max]", newJob.maxPay);

      formData.append("location[address]", newJob.address);
      formData.append("location[type]", "Point");
      formData.append("location[coordinates][0]", newJob.longitude);
      formData.append("location[coordinates][1]", newJob.latitude);

      createImages.forEach((file) => formData.append("images", file));

      const response = await createNewJob(formData);
      const isSuccess = response?.success || response?.data?.success;

      if (isSuccess) {
        toast.success("Job posted successfully!");
        setIsCreateModalOpen(false);
        setNewJob(initialJobState);
        setCreateImages([]);
        await fetchData();
      } else {
        toast.error(response?.message || "Failed to create job");
      }
    } catch (err) {
      console.error("Error details:", err);
      toast.error("Error creating job");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!selectedJob?._id) {
      toast.error("Invalid Job ID! Please refresh and try again.");
      return;
    }

    try {
      setSaveLoading(true);
      const formData = new FormData();

      formData.append("title", selectedJob.title || "");
      formData.append("description", selectedJob.description || "");
      formData.append("details", selectedJob.details || "");
      formData.append("companyName", selectedJob.companyName || "");
      formData.append("jobRole", selectedJob.jobRole || "");
      formData.append("vacancies", Number(selectedJob.vacancies) || 0);
      formData.append("experience", selectedJob.experience || "Fresher");
      formData.append(
        "qualification",
        selectedJob.qualification || "10th Pass",
      );
      formData.append("whatsappNumber", selectedJob.whatsappNumber || "");
      formData.append("isFeatured", String(selectedJob.isFeatured));

      formData.append("salaryRange[min]", selectedJob.salaryRange?.min || "");
      formData.append("salaryRange[max]", selectedJob.salaryRange?.max || "");

      formData.append("location[address]", selectedJob.location?.address || "");
      formData.append("location[type]", "Point");

      const lng = parseFloat(selectedJob.location?.coordinates?.[0]) || 72.8777;
      const lat = parseFloat(selectedJob.location?.coordinates?.[1]) || 19.076;
      formData.append("location[coordinates][0]", lng);
      formData.append("location[coordinates][1]", lat);

      if (editNewImages && editNewImages.length > 0) {
        editNewImages.forEach((file) => {
          if (file instanceof File) {
            formData.append("images", file);
          }
        });
      }

      const res = await updateJob(selectedJob._id, formData);
      const isSuccess = res.success || res.data?.success;
      const msg = res.message || res.data?.message;

      if (isSuccess) {
        toast.success(msg || "Job updated successfully!");
        setIsEditModalOpen(false);
        setEditNewImages([]);
        fetchData();
      } else {
        toast.error(msg || "Update failed from server");
      }
    } catch (err) {
      console.error("Update Error:", err);
      const errorMessage =
        err.response?.data?.message || "Job not found on server";
      toast.error(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteConfirm = (id) => {
    setJobIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobIdToDelete) return;

    try {
      setLoading(true);
      const response = await deleteJob(jobIdToDelete);
      if (response.success || response.data?.success) {
        toast.success("Job deleted successfully");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete job");
    } finally {
      setIsDeleteModalOpen(false);
      setJobIdToDelete(null);
    }
  };

  const openEditModal = (job) => {
    setSelectedJob({
      ...job,
      experience: job.experience || "Fresher",
      qualification: job.qualification || "10th Pass",
      whatsappNumber: job.whatsappNumber || "",
      location: {
        address: job.location?.address || "",
        coordinates: job.location?.coordinates || [72.8777, 19.076],
        type: "Point",
      },
      salaryRange: {
        min: job.salaryRange?.min || "",
        max: job.salaryRange?.max || "",
      },
    });
    setEditNewImages([]);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 bg-[#fafbfe] min-h-screen font-sans relative">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Part-time Job Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Create, view, and organize active part-time listings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={jobType}
            onChange={(e) => {
              const value = e.target.value;
              setJobType(value);

              if (value === "ADMIN") {
                navigate("/PartTimeJobs");
              } else if (value === "USER") {
                navigate("/user-part");
              }
            }}
            className="w-36 bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <PlusCircle size={15} />
            Post New Job
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-14 text-center">
                  S.No
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Job Posted By
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Salary Range
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Featured
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={24} />
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-slate-400 text-sm">
                    No active part-time listings found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, idx) => {
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
                        <div className="flex items-center gap-3">
                          <img
                            src={job.images?.[0] || "https://placehold.co/150"}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-100 bg-slate-50 flex-shrink-0"
                            alt="job"
                          />
                          <div>
                            <div className="font-semibold text-slate-700 text-sm leading-tight">
                              {job.title}
                            </div>
                            <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">
                              {job.jobRole}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-700">
                          {job.userId?.fullName || job.userId?.name || "N/A"}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                          {job.userId?.role || "N/A"}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-600">
                        ₹{job.salaryRange?.min} - {job.salaryRange?.max}
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
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <ActionBtn
                            text="View"
                            variant="indigo"
                            icon={<Eye size={12} />}
                            onClick={() => {
                              setSelectedJob(job);
                              setIsViewModalOpen(true);
                            }}
                          />
                          <ActionBtn
                            text="Edit"
                            variant="slate"
                            icon={<PlusCircle size={12} />}
                            onClick={() => openEditModal(job)}
                          />
                          <ActionBtn
                            text="Delete"
                            variant="rose"
                            icon={<Trash2 size={12} />}
                            onClick={() => handleDeleteConfirm(job._id)}
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
            Page {currentPage} of {totalPages}
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Post New Part-time Job
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" /> Select Job Poster (User)*
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                    value={newJob.userId}
                    onChange={(e) =>
                      setNewJob({ ...newJob, userId: e.target.value })
                    }
                  >
                    <option value="">Choose a user...</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.fullName || u.mobile} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Job Title*"
                  value={newJob.title}
                  onChange={(v) => setNewJob({ ...newJob, title: v })}
                />
                <Input
                  label="Short Description*"
                  value={newJob.description}
                  onChange={(v) => setNewJob({ ...newJob, description: v })}
                />
              </div>

              <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
                    <MapPin size={14} /> Job Location
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFetchLocation("create")}
                    disabled={locLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-150"
                  >
                    {locLoading ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Navigation size={11} />
                    )}{" "}
                    Fetch Location
                  </button>
                </div>
                <Input
                  label="Full Address*"
                  value={newJob.address}
                  onChange={(v) => setNewJob({ ...newJob, address: v })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    value={newJob.latitude}
                    onChange={(v) => setNewJob({ ...newJob, latitude: v })}
                  />
                  <Input
                    label="Longitude"
                    value={newJob.longitude}
                    onChange={(v) => setNewJob({ ...newJob, longitude: v })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={newJob.companyName}
                  onChange={(v) => setNewJob({ ...newJob, companyName: v })}
                />
                <Input
                  label="Job Role"
                  value={newJob.jobRole}
                  onChange={(v) => setNewJob({ ...newJob, jobRole: v })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Min Pay (₹)*"
                    type="number"
                    value={newJob.minPay}
                    onChange={(v) => setNewJob({ ...newJob, minPay: v })}
                  />
                  <Input
                    label="Max Pay (₹)*"
                    type="number"
                    value={newJob.maxPay}
                    onChange={(v) => setNewJob({ ...newJob, maxPay: v })}
                  />
                </div>
                <Input
                  label="Vacancies"
                  type="number"
                  value={newJob.vacancies}
                  onChange={(v) => setNewJob({ ...newJob, vacancies: v })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Whatsapp Number"
                  value={newJob.whatsappNumber}
                  onChange={(v) => setNewJob({ ...newJob, whatsappNumber: v })}
                />
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Experience</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                    value={newJob.experience}
                    onChange={(e) =>
                      setNewJob({ ...newJob, experience: e.target.value })
                    }
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1+ Year">1+ Year</option>
                    <option value="2+ Year">2+ Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Qualification</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                    value={newJob.qualification}
                    onChange={(e) =>
                      setNewJob({ ...newJob, qualification: e.target.value })
                    }
                  >
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="BCA/MCA">BCA/MCA</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Full Job Details/Description*
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 min-h-[100px] resize-none"
                  placeholder="Requirements..."
                  value={newJob.details}
                  onChange={(e) =>
                    setNewJob({ ...newJob, details: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={14} /> Job Images (Max 5)
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {createImages.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                      <button
                        onClick={() =>
                          setCreateImages(
                            createImages.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-1.5 right-1.5 bg-white/90 text-rose-500 rounded-full p-1 shadow-sm backdrop-blur-sm"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {createImages.length < 5 && (
                    <button
                      onClick={() => createFileInputRef.current.click()}
                      className="aspect-square border border-dashed border-slate-200 hover:border-indigo-500 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors duration-200 bg-slate-50"
                    >
                      <PlusCircle size={20} />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={createFileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setCreateImages([
                      ...createImages,
                      ...Array.from(e.target.files),
                    ])
                  }
                />
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewJob}
                  disabled={saveLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2"
                >
                  {saveLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Post Job Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Edit Part-time Job
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Current & New Images</label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {selectedJob.images?.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-indigo-100 bg-slate-50"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt="Existing"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-indigo-600/90 backdrop-blur text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold">
                        LIVE
                      </div>
                    </div>
                  ))}
                  {editNewImages.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-emerald-100 bg-slate-50"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        alt="New"
                      />
                      <button
                        onClick={() =>
                          setEditNewImages(
                            editNewImages.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-1.5 right-1.5 bg-white/90 text-rose-500 rounded-full p-1 shadow-sm backdrop-blur-sm"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {(selectedJob.images?.length || 0) + editNewImages.length <
                    5 && (
                    <button
                      onClick={() => editFileInputRef.current.click()}
                      className="aspect-square border border-dashed border-slate-200 hover:border-indigo-500 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors duration-200 bg-slate-50"
                    >
                      <PlusCircle size={20} />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setEditNewImages([
                      ...editNewImages,
                      ...Array.from(e.target.files),
                    ])
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  value={selectedJob.title}
                  onChange={(v) => setSelectedJob({ ...selectedJob, title: v })}
                />
                <Input
                  label="Short Description"
                  value={selectedJob.description}
                  onChange={(v) =>
                    setSelectedJob({ ...selectedJob, description: v })
                  }
                />
              </div>

              <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Job Location
                  </label>
                  <button
                    onClick={() => handleFetchLocation("edit")}
                    disabled={locLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-150"
                  >
                    {locLoading ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Navigation size={11} />
                    )}{" "}
                    Update Current
                  </button>
                </div>
                <Input
                  label="Full Address"
                  value={selectedJob.location?.address}
                  onChange={(v) =>
                    setSelectedJob({
                      ...selectedJob,
                      location: { ...selectedJob.location, address: v },
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Longitude"
                    value={selectedJob.location?.coordinates[0]}
                    onChange={(v) =>
                      setSelectedJob({
                        ...selectedJob,
                        location: {
                          ...selectedJob.location,
                          coordinates: [v, selectedJob.location.coordinates[1]],
                        },
                      })
                    }
                  />
                  <Input
                    label="Latitude"
                    value={selectedJob.location?.coordinates[1]}
                    onChange={(v) =>
                      setSelectedJob({
                        ...selectedJob,
                        location: {
                          ...selectedJob.location,
                          coordinates: [selectedJob.location.coordinates[0], v],
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={selectedJob.companyName}
                  onChange={(v) =>
                    setSelectedJob({ ...selectedJob, companyName: v })
                  }
                />
                <Input
                  label="Job Role"
                  value={selectedJob.jobRole}
                  onChange={(v) =>
                    setSelectedJob({ ...selectedJob, jobRole: v })
                  }
                />
                <Input
                  label="Min Pay (₹)"
                  value={selectedJob.salaryRange?.min}
                  onChange={(v) =>
                    setSelectedJob({
                      ...selectedJob,
                      salaryRange: { ...selectedJob.salaryRange, min: v },
                    })
                  }
                />
                <Input
                  label="Max Pay (₹)"
                  value={selectedJob.salaryRange?.max}
                  onChange={(v) =>
                    setSelectedJob({
                      ...selectedJob,
                      salaryRange: { ...selectedJob.salaryRange, max: v },
                    })
                  }
                />
                <Input
                  label="Vacancies"
                  value={selectedJob.vacancies}
                  onChange={(v) =>
                    setSelectedJob({ ...selectedJob, vacancies: v })
                  }
                />
                <Input
                  label="Whatsapp Number"
                  value={selectedJob.whatsappNumber}
                  onChange={(v) =>
                    setSelectedJob({ ...selectedJob, whatsappNumber: v })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Experience</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                    value={selectedJob.experience}
                    onChange={(e) =>
                      setSelectedJob({
                        ...selectedJob,
                        experience: e.target.value,
                      })
                    }
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1+ Year">1+ Year</option>
                    <option value="2+ Year">2+ Year</option>
                    <option value="5+ Year">5+ Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Qualification</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                    value={selectedJob.qualification}
                    onChange={(e) =>
                      setSelectedJob({
                        ...selectedJob,
                        qualification: e.target.value,
                      })
                    }
                  >
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="editFeat"
                  checked={selectedJob.isFeatured}
                  onChange={(e) =>
                    setSelectedJob({
                      ...selectedJob,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 h-4 w-4"
                />
                <label
                  htmlFor="editFeat"
                  className="text-xs font-bold text-slate-600 cursor-pointer select-none"
                >
                  Mark as Featured Job
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Full Job Details/Description*
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 min-h-[120px] resize-none"
                  value={selectedJob.details}
                  onChange={(e) =>
                    setSelectedJob({ ...selectedJob, details: e.target.value })
                  }
                />
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateJob}
                  disabled={saveLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 shadow-sm"
                >
                  {saveLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Update Job Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <JobViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        job={selectedJob}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Delete Job Posting?
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              This action permanent and cannot be undone
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl font-semibold text-xs transition-colors duration-150 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, type = "text", value, onChange }) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
    />
  </div>
);

const ActionBtn = ({ text, variant, onClick, icon }) => {
  const styles = {
    rose: "bg-rose-50/70 text-rose-600 border-rose-100 hover:bg-rose-500 hover:text-white hover:border-transparent",
    slate: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-800 hover:text-white hover:border-transparent",
    indigo: "bg-indigo-50/70 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-transparent",
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

export default PartTimeJobManagement;