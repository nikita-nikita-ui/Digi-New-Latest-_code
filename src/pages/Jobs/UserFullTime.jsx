import React, { useState, useEffect } from "react";
import { Trash2, Eye, MapPin, Briefcase, Star, X, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNonAdminFullTimeJobs } from "../../auth/adminLogin";

const UserFullJobs = () => {
    // --- STATIC / DUMMY DATA ---
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [jobIdToDelete, setJobIdToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
const [selectedJob, setSelectedJob] = useState(null);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                // Pass the currentPage to your API function
                const response = await getNonAdminFullTimeJobs(currentPage);
                setJobs(response.data);
                setPagination(response.pagination); // Save pagination metadata
            } catch (error) {
                console.error("Failed to fetch jobs");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [currentPage]);
    // Delete Logic (Static)
    const confirmDelete = () => {
        setJobs(jobs.filter(job => job._id !== jobIdToDelete));
        setIsDeleteModalOpen(false);
        setJobIdToDelete(null);
    };

    // Filter Search
    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-job-container">
            {/* INTERNAL CSS */}
            <style>{`
        .admin-job-container {
          padding: 2rem;
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #334155;
        }

        /* Header Section */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .page-title p {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 2px;
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-box input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          outline: none;
          background: white;
          font-size: 0.875rem;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        /* Table Card Layout */
        .table-wrapper {
          background: white;
          border-radius: 1.25rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          padding: 1rem 1.5rem;
          background-color: #f8fafc;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.875rem;
          vertical-align: middle;
        }

        tr:hover {
          background-color: #fdfdfd;
        }

        /* Job Detail Column */
        .job-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .job-logo {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #dbeafe;
        }

        .job-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .job-name {
          font-weight: 700;
          color: #1e293b;
          font-size: 0.95rem;
        }

        .job-loc {
          font-size: 0.7rem;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 2px;
        }

        /* Status & Badges */
        .salary-badge {
          font-weight: 800;
          color: #334155;
        }

        /* Action Buttons */
        .action-flex {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 6px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-view {
          background-color: #f0f7ff;
          color: #2563eb;
          border-color: #dbeafe;
        }

        .btn-view:hover { background: #2563eb; color: white; }

        .btn-del {
          background-color: #fef2f2;
          color: #dc2626;
          border-color: #fee2e2;
        }

        .btn-del:hover { background: #dc2626; color: white; }

        /* Modal Overlay */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal {
          background: white;
          width: 100%;
          max-width: 380px;
          padding: 2rem;
          border-radius: 1.5rem;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .icon-box {
          width: 64px;
          height: 64px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .modal-btns {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .modal-btns button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
        .c-cancel { background: #f1f5f9; color: #64748b; }
        .c-delete { background: #dc2626; color: white; }
      `}</style>

            {/* Header */}
            <div className="page-header">
                <div className="page-title">
                    <h1>Full-time Job Management</h1>
                    <p>You have {jobs.length} active listings</p>
                </div>

                {/* --- ADDED DROPDOWN SECTION --- */}
                <select
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "ADMIN") navigate("/FullTimeJobs");
                        else if (val === "USER") navigate("/user-full");
                    }}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm outline-none cursor-pointer hover:border-blue-400"
                >
                    <option value="USER">User Jobs</option>
                    <option value="ADMIN">Admin Jobs</option>
                </select>

                <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            {/* Main Table */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: "60px" }}>S.No</th>
                            <th>Job Information</th>
                            <th>Compensation (LPA)</th>
                            <th style={{ textAlign: "center" }}>Featured</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "3rem" }}>
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </td>
                            </tr>
                        ) : filteredJobs.length > 0 ? (
                            filteredJobs.map((job, index) => (
                                <tr key={job._id}>
                                    <td style={{ fontWeight: "700", color: "#cbd5e1" }}>
                                        {String((currentPage - 1) * 10 + index + 1).padStart(2, '0')}
                                    </td>
                                    <td>
                                        <div className="job-cell">
                                            <div className="job-logo">
                                                {job.images && job.images[0] ? (
                                                    <img src={job.images[0]} alt="job" />
                                                ) : (
                                                    <Briefcase size={20} color="#94a3b8" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="job-name">{job.title}</div>
                                                <div className="job-loc">
                                                    <MapPin size={10} /> {job.location?.address?.split(',')[0] || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="salary-badge">
                                            ₹{job.salaryRange?.min} - {job.salaryRange?.max}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <Star
                                            size={20}
                                            fill={job.isFeatured ? "#fbbf24" : "none"}
                                            stroke={job.isFeatured ? "#fbbf24" : "#e2e8f0"}
                                            style={{ margin: "0 auto" }}
                                        />
                                    </td>
                                    <td>
                                        <div className="action-flex">
                                        <button
    className="btn btn-view"
    onClick={() => {
        setSelectedJob(job);
        setIsViewModalOpen(true);
    }}
>
    <Eye size={12} /> View
</button>
                                            <button
                                                className="btn btn-del"
                                                onClick={() => { setJobIdToDelete(job._id); setIsDeleteModalOpen(true); }}
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                    No full-time jobs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm font-bold">Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>


{/* VIEW JOB MODAL */}
{isViewModalOpen && selectedJob && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">

<div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">

                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Job Details
                    </h2>

                    <p className="text-sm text-slate-500">
                        Complete job information
                    </p>
                </div>

                <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                    <X size={20} />
                </button>

            </div>

            {/* Content */}
            <div className="space-y-6 p-6">

                {/* Job Information */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                        Job Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">

                       

                        <div>
                            <p className="text-xs text-slate-500">Title</p>
                            <p className="font-semibold text-slate-800">
                                {selectedJob.title}
                            </p>
                        </div>

                       
                        

                        <div>
                            <p className="text-xs text-slate-500">Sub Category</p>
                            <p className="font-semibold text-slate-800">
                                {selectedJob.subCategory}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Work Type</p>
                            <p className="font-semibold text-slate-800">
                                {selectedJob.workType}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Status</p>
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                {selectedJob.status}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Featured</p>
                            <p className="font-semibold text-slate-800">
                                {selectedJob.isFeatured ? "Yes" : "No"}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                        Description
                    </h3>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm leading-6 text-slate-700">
                            {selectedJob.details || "No details available"}
                        </p>
                    </div>
                </div>

                {/* Location & Budget */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                        Location & Budget
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">
                                Location
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                                {selectedJob.location?.address || "N/A"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">
                                Coordinates
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                                {selectedJob.location?.coordinates?.join(", ") || "N/A"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">
                                Minimum Budget
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-800">
                                ₹{selectedJob.budget?.min ?? 0}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">
                                Maximum Budget
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-800">
                                ₹{selectedJob.budget?.max ?? 0}
                            </p>
                        </div>

                    </div>
                </div>

                {/* User Information */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                        User Information
                    </h3>

                    <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">

                        {selectedJob.userId?.profilePhoto ? (
                            <img
                                src={selectedJob.userId.profilePhoto}
                                alt="Profile"
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                {selectedJob.userId?.fullName?.charAt(0) || "U"}
                            </div>
                        )}

                        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">

                            <div>
                                <p className="text-xs text-slate-500">
                                    Full Name
                                </p>
                                <p className="font-semibold text-slate-800">
                                    {selectedJob.userId?.fullName || "N/A"}
                                </p>
                            </div>

                           <div>
    <p className="text-xs text-slate-500">
        Mobile
    </p>
    <p className="font-semibold text-slate-800">
        {selectedJob.userId?.mobile || "N/A"}
    </p>
</div>

<div>
    <p className="text-xs text-slate-500">
        Role
    </p>
    <p className="font-semibold text-slate-800">
        {selectedJob.userId?.role || "N/A"}
    </p>
</div>

                          

                        </div>

                    </div>
                </div>

                {/* Communication */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                        Communication
                    </h3>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap gap-2">
                            {selectedJob.preferredCommunication?.map(
                                (method, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                                    >
                                        {method}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                        Job Images
                    </h3>

                    {selectedJob.images?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                            {selectedJob.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Job ${index + 1}`}
                                    className="h-32 w-full rounded-xl object-cover"
                                />
                            ))}

                        </div>
                    ) : (
                        <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                            No images available
                        </div>
                    )}
                </div>

                {/* Dates */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                        Dates
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Created At
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedJob.createdAt
                                    ? new Date(selectedJob.createdAt).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Updated At
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedJob.updatedAt
                                    ? new Date(selectedJob.updatedAt).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Expires At
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {selectedJob.expiresAt
                                    ? new Date(selectedJob.expiresAt).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>

                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t bg-white px-6 py-4 text-right">

                <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                    Close
                </button>

            </div>

        </div>
    </div>
)}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="overlay">
                    <div className="modal">
                        <div className="icon-box">
                            <Trash2 size={32} />
                        </div>
                        <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Are you sure?</h2>
                        <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: "1.5" }}>
                            Do you really want to delete this job? This process cannot be undone and the data will be lost.
                        </p>
                        <div className="modal-btns">
                            <button className="c-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="c-delete" onClick={confirmDelete}>Delete Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserFullJobs;