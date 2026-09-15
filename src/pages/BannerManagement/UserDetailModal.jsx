import React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Droplets,
  CalendarDays,
  CircleUserRound,
  BadgeCheck,
} from "lucide-react";

const UserDetailModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    if (status?.toLowerCase() === "active") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }

    if (status?.toLowerCase() === "blocked") {
      return "bg-rose-50 text-rose-600 border-rose-100";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[28px] shadow-2xl border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
              User
            </span>

            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              User Details
            </h2>

            <p className="text-[10px] text-slate-400 mt-1">
              Complete information about this user
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 max-h-[72vh] overflow-y-auto">

          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-7">

            {/* Profile Image */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm shrink-0">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.fullName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={35} className="text-slate-400" />
              )}
            </div>

            {/* Name */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {user.fullName || "-"}
                </h3>

                {user.isVerified && (
                  <BadgeCheck
                    size={18}
                    className="text-indigo-500"
                  />
                )}
              </div>

              <p className="text-xs text-slate-400 mt-1">
                {user.role || "-"}
              </p>

              <span
                className={`inline-flex mt-3 px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(
                  user.status
                )}`}
              >
                {user.status || "Unknown"}
              </span>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Full Name */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <CircleUserRound
                  size={15}
                  className="text-indigo-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Full Name
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {user.fullName || "-"}
              </p>
            </div>

            {/* Mobile */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Phone
                  size={15}
                  className="text-indigo-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Mobile
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {user.mobile || "-"}
              </p>
            </div>

            {/* Email */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Mail
                  size={15}
                  className="text-indigo-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Email
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700 break-all">
                {user.email || "-"}
              </p>
            </div>

            {/* Gender */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <User
                  size={15}
                  className="text-indigo-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Gender
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700 capitalize">
                {user.gender || "-"}
              </p>
            </div>

            {/* Role */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck
                  size={15}
                  className="text-indigo-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Role
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {user.role || "-"}
              </p>
            </div>

            {/* Blood Group */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Droplets
                  size={15}
                  className="text-rose-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Blood Group
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {user.bloodGroup || "-"}
              </p>
            </div>

            {/* Credits */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard
                  size={15}
                  className="text-emerald-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Credits
                </p>
              </div>

              <p className="text-sm font-bold text-emerald-600">
                {user.credits ?? 0}
              </p>
            </div>

            {/* Verification */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck
                  size={15}
                  className={
                    user.isVerified
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Verification
                </p>
              </div>

              <p
                className={`text-sm font-semibold ${
                  user.isVerified
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {user.isVerified ? "Verified" : "Not Verified"}
              </p>
            </div>

          </div>

          {/* Location */}
          <div className="mt-4 bg-indigo-50/60 rounded-2xl p-5 border border-indigo-100">

            <div className="flex items-center gap-2 mb-3">
              <MapPin
                size={16}
                className="text-indigo-500"
              />

              <p className="text-[9px] uppercase tracking-widest font-bold text-indigo-500">
                User Location
              </p>
            </div>

            <p className="text-sm font-semibold text-slate-700">
              {user.city || "Location not available"}
            </p>

            {user.location?.coordinates?.length >= 2 && (
              <p className="text-xs text-slate-500 mt-2">
                Coordinates:{" "}
                {user.location.coordinates[0]},{" "}
                {user.location.coordinates[1]}
              </p>
            )}
          </div>

          {/* Account Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            {/* Created At */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays
                  size={15}
                  className="text-indigo-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Account Created
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Updated At */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays
                  size={15}
                  className="text-indigo-500"
                />

                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  Last Updated
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {formatDate(user.updatedAt)}
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserDetailModal;