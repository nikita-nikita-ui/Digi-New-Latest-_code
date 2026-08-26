import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UserPlus,
  Activity,
  Download,
  ShoppingBag,
  Briefcase,
  Store,
  AlertCircle,
  Droplets,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Loader2, // Loading icon ke liye
} from "lucide-react";
import { getDashboardStats, getUserGraphStats, } from "../../auth/adminLogin";

const OTHER_STATIC_STATS = {
  shops: "184",
  partTimeJobs: "56",
  fullTimeJobs: "32",
  marketplaceListings: "412",
  sosAlertsToday: "03",
  bloodRequestsToday: "08",
  creditsSold: "1,250",
  revenue: "84,500",
  newRegistrations: "24",
};

const STATIC_CHART_DATA = [
  { date: "Oct 01", users: 4000 },
  { date: "Oct 05", users: 5500 },
  { date: "Oct 10", users: 4800 },
  { date: "Oct 15", users: 7000 },
  { date: "Oct 20", users: 8500 },
  { date: "Oct 25", users: 7800 },
  { date: "Oct 30", users: 9200 },
];

const StatCard = ({ title, value, icon: Icon, color, isLoading, popupData }) => {
  const isComingSoon = value === "Coming soon";




  return (
<div className="group relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-orange-600`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        {isComingSoon ? (
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
            Soon
          </span>
        ) : (
          <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">
            +Live
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1"></div>
        ) : isComingSoon ? (
          <p className="text-lg font-medium text-gray-400  mt-1 blur-[0.9px] select-none">
            {value}
          </p>
        ) : (
          <p className="text-2xl font-bold">
            {typeof value === "string" ? value : value.toLocaleString()}
          </p>
        )}
      </div>
    {popupData && (
<div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">  <p className="text-sm font-bold text-gray-700 mb-3">Shop Details</p>

    <div className="flex justify-between text-sm mb-2">
      <span className="text-gray-500">Lite</span>
      <span className="font-bold">{popupData.Lite}</span>
    </div>

    <div className="flex justify-between text-sm mb-2">
      <span className="text-gray-500">Pro Plus</span>
      <span className="font-bold">{popupData["Pro Plus"]}</span>
    </div>

    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Free</span>
      <span className="font-bold">{popupData.Trial}</span>
    </div>
  </div>
)}
    </div>
  );
};
const SectionTitle = ({ title }) => (
  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 mt-8">
    {title}
  </h2>
);



function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [filter, setFilter] = useState("yearly");
const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Failed to load statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
useEffect(() => {
  const fetchGraphStats = async () => {
    try {
   const response = await getUserGraphStats(filter);

const formattedData = response.labels.map((label, index) => ({
  date: label,
  users: response.data[index],
}));

setChartData(formattedData);
    } catch (error) {
      console.error(error);
    }
  };

  fetchGraphStats();
}, [filter]);
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <AlertCircle className="mr-2" /> {error}
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans m-5">
      {/* -------------------- HEADER -------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between m-5 gap-4 ">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin <span className="text-[#FE702E]">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of platform performance and statistics.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium">
            {loading ? "Syncing..." : "Live Data Mode"}
          </div>
          <div className="px-4 py-2 bg-[#FE702E] text-white rounded-lg text-sm font-medium shadow-lg shadow-orange-200">
            {new Date().toDateString()}
          </div>
        </div>
      </div>

      {/* -------------------- USER ANALYTICS (API DATA) -------------------- */}
      <SectionTitle title="User Analytics" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
          isLoading={loading}
        />
        <StatCard
          title="New Today"
          value={stats?.newToday || 0}
          icon={UserPlus}
          color="bg-green-500"
          isLoading={loading}
        />
        <StatCard
          title="Active Now"
          value={stats?.activeNow || 0}
          icon={Activity}
          color="bg-orange-500"
          isLoading={loading}
        />
        <StatCard
          title="Monthly Active"
          value={stats?.monthlyActive || 0}
          icon={TrendingUp}
          color="bg-purple-500"
          isLoading={loading}
        />
        <StatCard
          title="Total Downloads"
          value={stats?.totalDownloads || 0}
          icon={Download}
          color="bg-indigo-500"
          isLoading={loading}
        />
      </div>

      {/* -------------------- BUSINESS & JOBS (API DATA) -------------------- */}
      <SectionTitle title="Business & Marketplace" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Shops "
          value={stats?.totalBusinesses || 0}
          icon={Store}
          color="bg-pink-500"
          isLoading={loading}
          popupData={{
            Lite: stats?.liteBusinesses || 0,
            "Pro Plus": stats?.proPlusBusinesses || 0,
            Trial: stats?.trialBusinesses || 0,
          }}
        />

        <StatCard
          title="Active Local Jobs"
          value={stats?.activeLocalJobs || 0}
          icon={Briefcase}
          color="bg-green-500"
          isLoading={loading}
        />
        <StatCard
          title="Marketplace"
          value={stats?.totalItems || 0} // Map from API
          icon={ShoppingBag}
          color="bg-yellow-500"
          isLoading={loading}
        />
        <StatCard
          title="Part-time Jobs"
          value={stats?.partTimeJobs || 0} // Map from API
          icon={Briefcase}
          color="bg-cyan-500"
          isLoading={loading}
        />
        <StatCard
          title="Full-time Jobs"
          value={stats?.fullTimeJobs || 0} // Map from API
          icon={Briefcase}
          color="bg-blue-600"
          isLoading={loading}
        />
      </div>

      {/* -------------------- FINANCE & COMMUNITY (MIXED) -------------------- */}
      <SectionTitle title="Finance & Community" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={`₹${OTHER_STATIC_STATS.revenue}`}
          icon={IndianRupee}
          color="bg-emerald-500"
        />
        <StatCard
          title="Credits Sold"
          value={OTHER_STATIC_STATS.creditsSold}
          icon={CreditCard}
          color="bg-orange-600"
        />
        <StatCard
          title="SOS Alerts"
          value="Coming soon"
          icon={AlertCircle}
          color="bg-red-500"
        />
        <StatCard
          title="Blood Requests"
          value={stats?.totalBloodRequests || 0} // Map from API
          icon={Droplets}
          color="bg-red-600"
          isLoading={loading}
        />
      </div>

      {/* -------------------- GRAPH & SUMMARY SECTION -------------------- */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              User Growth Trends
            </h2>
        <select
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  className="appearance-none cursor-pointer text-sm font-semibold text-gray-700 
             bg-white border border-orange-200 rounded-xl 
             px-4 py-2.5 pr-9 shadow-sm
             hover:border-[#FE702E] hover:shadow-md
             focus:outline-none focus:ring-2 focus:ring-orange-200 
             focus:border-[#FE702E] transition-all duration-200"
>
  <option value="weekly">Weekly</option>
  <option value="monthly">Monthly</option>
  <option value="yearly">Yearly</option>
</select>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FE702E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FE702E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#FE702E"
                  strokeWidth={3}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Info Panel */}
        <div className="bg-[#1E293B] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Platform Summary</h2>
            <p className="text-slate-400 text-sm mb-6">Real-time indicators.</p>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-slate-300">New Registrations</span>
                </div>
                <span className="font-bold text-lg">
                  {stats?.newToday || 0}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-300">Active (Monthly)</span>
                </div>
                <span className="font-bold text-lg">
                  {stats?.monthlyActive || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-slate-700/50 rounded-xl border border-slate-600 text-sm">
            <p className="text-slate-400 uppercase font-bold text-[10px] mb-1">
              Status
            </p>
            System is running smoothly. Total of {stats?.totalUsers || 0} users
            onboarded.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
