import React, { useState, useEffect } from "react";
import {
  Trash2,
  Eye,
  MapPin,
  Clock,
  Star,
  Search,
  Zap,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// Import your controller
import { getAllRegularJobs, deleteJob } from "../../auth/adminLogin";
import DeleteConfirmModal from "../../components/common/DeleteConfirm";
const UserPartTimeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState("USER");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchJobs = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await getAllRegularJobs(page, search);
      if (response && response.data) {
        setJobs(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (searchTerm !== "") {
      setCurrentPage(1);
    }
    fetchJobs(currentPage);
  }, [currentPage, searchTerm]);
  const confirmDelete = async () => {
    try {
      await deleteJob(jobIdToDelete);

      setJobs((prev) => prev.filter((job) => job._id !== jobIdToDelete));

      setIsDeleteModalOpen(false);
      setJobIdToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete job");
    }
  };

  return (
    <div className="pt-admin-wrapper">
      <style>{`
                .pt-admin-wrapper { padding: 2rem; background-color: #ffffff; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
                .pt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; }
                .pt-title h1 { font-size: 1.5rem; font-weight: 800; color: #0c4a6e; margin: 0; }
                .pt-title p { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
                .pt-dropdown {
    padding: 0.65rem 1rem;
    border-radius: 0.8rem;
    border: 2px solid #38bdf8; /* This is the border color you want */
    outline: none;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    color: #0c4a6e;
    font-weight: 600;
}
                .pt-search-input { position: relative; width: 320px; }
                .pt-search-input input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.6rem; border-radius: 0.8rem; border: 1px solid #bae6fd; outline: none; font-size: 0.875rem; background: white; }
                .search-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #38bdf8; }
                .pt-table-card { background: white; border-radius: 1.25rem; border: 1px solid #e0f2fe; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04); overflow: hidden; }
                table { width: 100%; border-collapse: collapse; text-align: left; }
                th { padding: 1.2rem 1.5rem; background-color: #f8fafc; font-size: 0.7rem; font-weight: 700; color: #0369a1; text-transform: uppercase; border-bottom: 1px solid #e0f2fe; }
                td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
                .gig-cell { display: flex; align-items: center; gap: 0.85rem; }
                .gig-icon { width: 42px; height: 42px; border-radius: 10px; background: #e0f2fe; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .gig-icon img { width: 100%; height: 100%; object-fit: cover; }
                .gig-name { font-weight: 700; color: #0f172a; }
                .gig-cat { font-size: 0.65rem; font-weight: 800; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #64748b; text-transform: uppercase; margin-top: 4px; display: inline-block; }
                .pay-text { font-weight: 800; color: #059669; }
                .pt-btn { padding: 6px 12px; font-size: 10px; font-weight: 700; border-radius: 6px; border: 1px solid; cursor: pointer; display: flex; align-items: center; gap: 4px; }
                .pt-delete { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
                .modal-bg { position: fixed; inset: 0; background: rgba(8, 47, 73, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
                .modal-box { background: white; width: 90%; max-width: 360px; padding: 2rem; border-radius: 1.5rem; text-align: center; }
                .modal-foot { display: flex; gap: 10px; margin-top: 1.8rem; }
                .modal-foot button { flex: 1; padding: 10px; border-radius: 0.75rem; font-weight: 700; cursor: pointer; border: none; }
                .btn-yes { background: #e11d48; color: white; }
            `}</style>

      <div className="pt-header">
        <div className="pt-title">
          <h1>Part-time Gigs Management</h1>
          <p>Managing {jobs.length} user-created flexible opportunities</p>
        </div>

        <select
          value={jobType}
          onChange={(e) =>
            e.target.value === "ADMIN" ? navigate("/PartTimeJobs") : null
          }
          className="pt-dropdown"
        >
          <option value="USER">User Jobs</option>
          <option value="ADMIN">Admin Jobs</option>
        </select>

        <div className="pt-search-input">
          <Search size={16} className="search-ico" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-table-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Gig Details</th>
                <th>User Info</th>
                <th>Salary Range</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={job._id}>
                  <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                  <td>
                    <div className="gig-cell">
                      <div className="gig-icon">
                        <img src={job.images[0]} alt="gig" />
                      </div>
                      <div>
                        <div className="gig-name">{job.title}</div>
                        <span className="gig-cat">{job.companyName}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>
                      {job.userId?.fullName || "N/A"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      {job.userId?.role || "USER"}
                    </div>
                  </td>
                  <td>
                    <span className="pay-text">
                      ₹{job.salaryRange?.min ?? "N/A"} - ₹
                      {job.salaryRange?.max ?? "N/A"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pt-btn pt-delete"
                      onClick={() => {
                        setJobIdToDelete(job._id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div
        className="pagination"
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          justifyContent: "center",
        }}
      >
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      {isDeleteModalOpen && (
        <div className="modal-bg">
          <div className="modal-box">
            <h2 style={{ fontSize: "1.2rem" }}>Delete this gig?</h2>
            <div className="modal-foot">
              <button onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-yes" onClick={confirmDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPartTimeJobs;
