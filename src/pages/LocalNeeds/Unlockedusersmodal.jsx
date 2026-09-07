import React from "react";
import { X, User, Phone, Mail, Shield } from "lucide-react";

const UnlockedUsersModal = ({ users = [], onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col transform scale-100 transition-all">

        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <User className="text-indigo-400" size={20} />
            <h2 className="font-extrabold text-base tracking-wide uppercase">
              Users Who Unlocked This Task
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-white">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 border border-slate-200 bg-slate-50 p-4 rounded-2xl hover:bg-slate-100/60 transition-all duration-150"
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <User size={20} className="text-indigo-600" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {user.fullName || "N/A"}
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <Phone size={12} className="text-emerald-500 shrink-0" />
                    {user.mobile || "N/A"}
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <Mail size={12} className="text-indigo-500 shrink-0" />
                    {user.email || "N/A"}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 self-start px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border bg-blue-50 text-blue-700 border-blue-100 shrink-0">
                  <Shield size={10} />
                  {user.role || "USER"}
                </span>
              </div>
            ))
          ) : (
            <div className="border border-slate-200 bg-slate-50 p-6 rounded-2xl text-center text-sm text-slate-400">
              No users have unlocked this task yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition duration-150 cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockedUsersModal;