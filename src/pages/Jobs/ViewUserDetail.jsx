
import React from "react";
import { X } from "lucide-react";
import dummyUser from "../../assets/dummy.png";
const ViewUserDetail = ({ isOpen, onClose, users = [] }) => {
    if (!isOpen) return null;

    return (
        <>
            <style>{`
        .user-detail-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease;
        }

        .user-detail-modal {
          width: 100%;
          max-width: 520px;
          max-height: 80vh;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
          animation: modalSlideUp 0.25s ease;
        }

        .user-detail-header {
          padding: 18px 22px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user-detail-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .user-detail-count {
          margin: 4px 0 0;
          font-size: 11px;
          color: #94a3b8;
        }

        .user-detail-close {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-detail-close:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .user-detail-body {
          padding: 18px;
          max-height: 52vh;
          overflow-y: auto;
        }

        .user-detail-body::-webkit-scrollbar {
          width: 5px;
        }

        .user-detail-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .user-detail-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .user-detail-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .user-detail-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .user-detail-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          transition: all 0.2s ease;
        }

        .user-detail-card:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .user-detail-image {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .user-detail-info {
          flex: 1;
          min-width: 0;
        }

        .user-detail-name {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }

        .user-detail-mobile {
          margin: 3px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .user-detail-email {
          margin: 3px 0 0;
          font-size: 11px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-detail-role {
          display: inline-block;
          margin-top: 5px;
          padding: 3px 8px;
          background: #eef2ff;
          color: #6366f1;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .user-detail-footer {
          padding: 14px 18px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
        }

        .user-detail-footer-btn {
          border: none;
          background: #1e293b;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-detail-footer-btn:hover {
          background: #0f172a;
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 480px) {
          .user-detail-modal {
            max-width: 100%;
            border-radius: 20px;
          }

          .user-detail-header {
            padding: 16px;
          }

          .user-detail-body {
            padding: 14px;
          }

          .user-detail-footer {
            padding: 12px 14px;
          }
        }
      `}</style>

            <div className="user-detail-overlay">
                <div className="user-detail-modal">

                    {/* HEADER */}
                    <div className="user-detail-header">
                        <div>
                            <h3 className="user-detail-title">
                                Users Who Unlocked This Job
                            </h3>

                            <p className="user-detail-count">
                                {users.length} user(s)
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="user-detail-close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* USERS */}
                    <div className="user-detail-body">
                        <div className="user-detail-list">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="user-detail-card"
                                >
                                    <img
                                        src={user.profilePhoto || dummyUser}
                                        alt={user.fullName || "User"}
                                        onError={(e) => {
                                            e.currentTarget.src = dummyUser;
                                        }}
                                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                    />

                                    <div className="user-detail-info">
                                        <p className="user-detail-name">
                                            {user.fullName || "N/A"}
                                        </p>

                                        <p className="user-detail-mobile">
                                            {user.mobile || "No mobile"}
                                        </p>

                                        <p className="user-detail-email">
                                            {user.email || "No email"}
                                        </p>

                                        <span className="user-detail-role">
                                            {user.role || "USER"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="user-detail-footer">
                        <button
                            onClick={onClose}
                            className="user-detail-footer-btn"
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ViewUserDetail;

