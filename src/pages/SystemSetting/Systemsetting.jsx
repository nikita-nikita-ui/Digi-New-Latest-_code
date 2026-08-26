import React from 'react';

const SystemSettings = () => {
  return (
    <div className="w-full bg-[#F8F9FC] p-4 md:p-8 font-sans text-gray-800 m-4">
      
      {/* 14 SYSTEM SETTINGS SECTION */}
      <div className="mb-2">
        <h3 className="uppercase text-xs font-bold text-gray-400 tracking-wider mb-6">
           SYSTEM SETTINGS
        </h3>

        {/* Sub-label for Limits */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 bg-[#FF6B00] rounded-full"></span>
          <h4 className="text-gray-700 text-sm font-bold uppercase tracking-wide">
            Platform Limits & Configurations
          </h4>
        </div>

        {/* Grid Layout for Settings Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Item 1: Image Upload Count */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] transition-transform duration-300 border-b-4 border-blue-500">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                {/* Image Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full">
                MEDIA LIMIT
              </span>
            </div>
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
              CONFIGURATION
            </h4>
            <p className="text-xl font-bold text-gray-800">
              Image Upload Count
            </p>
          </div>

          {/* Item 2: Listing Expiry Days */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] transition-transform duration-300 border-b-4 border-green-500">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                {/* Calendar/Time Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">
                DURATION
              </span>
            </div>
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
              CONFIGURATION
            </h4>
            <p className="text-xl font-bold text-gray-800">
              Listing Expiry Days
            </p>
          </div>

          {/* Item 3: Credit Costs per Action */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] transition-transform duration-300 border-b-4 border-yellow-500">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                {/* Coin/Credit Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="bg-yellow-50 text-yellow-600 text-[10px] font-bold px-2 py-1 rounded-full">
                ECONOMY
              </span>
            </div>
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
              CONFIGURATION
            </h4>
            <p className="text-xl font-bold text-gray-800">
              Credit Costs per Action
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SystemSettings;