import React from "react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .modal-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .modal-box {
            width: 90%;
            max-width: 420px;
            background: #fff;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            animation: popup 0.25s ease;
          }

          .modal-box h2 {
            margin: 0 0 12px;
            color: #1e293b;
            font-size: 1.2rem;
            font-weight: 700;
          }

          .modal-box p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }

          .modal-foot {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-top: 24px;
          }

          .modal-foot button {
            border: none;
            cursor: pointer;
            padding: 10px 18px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .cancel-btn {
            background: #e2e8f0;
            color: #334155;
          }

          .cancel-btn:hover {
            background: #cbd5e1;
          }

          .btn-yes {
            background: #ef4444;
            color: #fff;
          }

          .btn-yes:hover {
            background: #dc2626;
          }

          @keyframes popup {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      <div className="modal-bg">
        <div className="modal-box">
          <h2>Delete this</h2>
          <p>Are you sure you want to delete this job?</p>

          <div className="modal-foot">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button className="btn-yes" onClick={onConfirm}>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;
