import React, { useState } from "react";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaulting from "../assets/logo(1).png";
import toast, { Toaster } from "react-hot-toast"; // <--- 1. Toaster bhi import karein

const Header = ({ toggleSidebar }) => {
  const [notificationCount] = useState(3);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const name = localStorage.getItem("email") || "Admin";

  const handleLogout = () => {
    toast.success("Logged out successfully!");

    localStorage.clear();

    setTimeout(() => {
      navigate("/login");
      window.location.reload();
    }, 800);
  };

  return (
    <header className="w-full z-50 bg-gradient-to-r from-orange-50 via-white to-orange-50 backdrop-blur-sm border-b border-orange-100 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between">
      {/* 2. Ye line zaroor add karein taaki toast screen par dikh sake */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* ... Baki saara code bilkul sahi hai ... */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-orange-100"
        >
          <Menu size={20} className="text-[#FE702E]" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FE702E] to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <img src={defaulting} alt="logo" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#FE702E] to-orange-700 bg-clip-text text-transparent">
            Time2Cash Admin Panel
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative p-2 rounded-xl hover:bg-orange-100">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#FE702E] h-4 w-4 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="p-2 rounded-xl hover:bg-orange-100"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#FE702E] to-orange-600 rounded-xl flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
              <div className="p-4 border-b bg-orange-50/50">
                <p className="text-sm font-semibold text-gray-800">
                  Welcome back!
                </p>
                <p className="text-xs text-gray-500 truncate">{name}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
