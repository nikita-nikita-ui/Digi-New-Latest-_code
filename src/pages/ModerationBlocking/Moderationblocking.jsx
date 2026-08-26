import React from 'react';

const ModerationDashboard = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 md:p-8 font-sans text-gray-800">
      {/* Header (Recreated to match the theme context) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin <span className="text-[#FF6B00]">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-1">Overview of platform performance and statistics.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-gray-600 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium">
            Live Data Mode
          </button>
          <button className="bg-[#FF6B00] text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium">
            Thu Jan 22 2026
          </button>
        </div>
      </div>

      {/* 13 MODERATION & BLOCKING SECTION */}
      <div className="mb-2">
        <h3 className="uppercase text-xs font-bold text-gray-400 tracking-wider mb-6">
          1️⃣3️⃣ MODERATION & BLOCKING
        </h3>

        {/* Grid Layout for "Admin Can" Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Item 1: Block Users */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                {/* User Block Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9l-6 6M12 9l6 6" />
                </svg>
              </div>
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">
                ADMIN ACTION
              </span>
            </div>
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
              ACTION TYPE
            </h4>
            <p className="text-2xl font-bold text-gray-800">
              Block Users
            </p>
          </div>

          {/* Item 2: Block Shops */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                {/* Shop Block Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 6M9 15l6 6" />
                </svg>
              </div>
              <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                ADMIN ACTION
              </span>
            </div>
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
              ACTION TYPE
            </h4>
            <p className="text-2xl font-bold text-gray-800">
              Block Shops
            </p>
          </div>

          {/* Item 3: Block Listings */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                {/* Listing Block Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11l-6 6M9 11l6 6" />
                </svg>
              </div>
              <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-1 rounded-full">
                ADMIN ACTION
              </span>
            </div>
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
              ACTION TYPE
            </h4>
            <p className="text-2xl font-bold text-gray-800">
              Block Listings
            </p>
          </div>

           {/* Rules Card (Spanning 1 column but styled distinctively) */}
           <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-l-4 border-gray-800 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="text-gray-800 text-sm font-bold uppercase tracking-wide">
                  SYSTEM RULES
                </h4>
             </div>
             
             <ul className="space-y-3">
               <li className="flex items-start gap-3">
                 <span className="w-1.5 h-1.5 mt-2 bg-red-500 rounded-full flex-shrink-0"></span>
                 <p className="text-sm text-gray-600 leading-tight">
                   Blocked users cannot log in again
                 </p>
               </li>
               <li className="flex items-start gap-3">
                 <span className="w-1.5 h-1.5 mt-2 bg-red-500 rounded-full flex-shrink-0"></span>
                 <p className="text-sm text-gray-600 leading-tight">
                   Blocked shops disappear instantly from app
                 </p>
               </li>
             </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModerationDashboard;