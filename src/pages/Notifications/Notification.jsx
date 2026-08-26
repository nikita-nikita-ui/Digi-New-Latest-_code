import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Bell, MapPin, Users, Globe } from "lucide-react";

import {
  GsendNotificationAPI,
  getAllUserCitiesAPI,
  getUsersForNotificationAPI,
} from "../../auth/adminLogin";

const Notify = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const tabs = [
    {
      id: "notifications",
      label: "Push Notifications",
      icon: <Bell size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 m-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Notifications & CMS
          </h1>

          <p className="text-slate-500 mt-1">Manage Push Notifications</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
          {activeTab === "notifications" && <PushNotificationsView />}
        </div>
      </div>
    </div>
  );
};

const PushNotificationsView = () => {
  const [audience, setAudience] = useState("Global");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [isCityListOpen, setIsCityListOpen] = useState(false);
  useEffect(() => {
    fetchCities();
    fetchUsers();
  }, []);

  // ================= FETCH CITIES =================

  const fetchCities = async () => {
    try {
      const response = await getAllUserCitiesAPI();

      console.log("CITIES RESPONSE =", response);

      setCities(response?.data || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch cities");
    }
  };

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    try {
      console.log("fetchUsers called");

      const response = await getUsersForNotificationAPI();

      console.log("USERS RESPONSE =", response);

      // IMPORTANT
      console.log("USERS ARRAY =", response?.data);

      setUsers(response?.data || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch users");
    }
  };

  // ================= SEND NOTIFICATION =================

  const sendNotification = async () => {
    try {
      // Validation

      if (!title.trim()) {
        toast.error("Please enter title");
        return;
      }

      if (!body.trim()) {
        toast.error("Please enter message");
        return;
      }

      if (audience === "City-based" && !selectedCity) {
        toast.error("Please select city");
        return;
      }

      if (audience === "Specific User" && !selectedUser) {
        toast.error("Please select user");
        return;
      }

      const payload = {
        title,
        body,

        targetType:
          audience === "Global"
            ? "GLOBAL"
            : audience === "City-based"
              ? "CITY"
              : "USER",

        targetValue:
          audience === "City-based"
            ? selectedCity
            : audience === "Specific User"
              ? selectedUser
              : undefined,
      };

      console.log("SELECTED USER =", selectedUser);

      console.log("FINAL PAYLOAD =", payload);

      const response = await GsendNotificationAPI(payload);

      console.log("SEND RESPONSE =", response);

      toast.success("Notification Sent Successfully");

      // RESET FORM

      setTitle("");
      setBody("");
      setSelectedCity("");
      setSelectedUser("");
    } catch (error) {
      console.log("SEND ERROR =", error);

      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Failed to send notification",
      );
    }
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SECTION */}

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-blue-600" />
            Compose Notification
          </h2>

          <div className="space-y-4">
            {/* AUDIENCE */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Audience
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SelectionCard
                  icon={<Globe size={18} />}
                  label="Global"
                  active={audience === "Global"}
                  onClick={() => setAudience("Global")}
                />

                <SelectionCard
                  icon={<MapPin size={18} />}
                  label="City-based"
                  active={audience === "City-based"}
                  onClick={() => setAudience("City-based")}
                />

                <SelectionCard
                  icon={<Users size={18} />}
                  label="Specific User"
                  active={audience === "Specific User"}
                  onClick={() => setAudience("Specific User")}
                />
              </div>
            </div>

            {audience === "City-based" && (
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select City
                </label>

                {/* TRIGGER BOX */}
                <div
                  onClick={() => setIsCityListOpen(!isCityListOpen)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm cursor-pointer flex justify-between items-center"
                >
                  {selectedCity || "Select City"}
                  <span>{isCityListOpen ? "▲" : "▼"}</span>
                </div>

                {/* DROPDOWN LIST */}
                {isCityListOpen && (
                  <div className="absolute z-10 w-full max-h-40 mt-1 overflow-y-auto border border-slate-200 rounded-lg bg-white p-1 shadow-lg">
                    {cities.length > 0 ? (
                      cities.map((city, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedCity(city);
                            setIsCityListOpen(false); // Closes dropdown
                          }}
                          className={`p-2 text-sm cursor-pointer rounded-md ${
                            selectedCity === city
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          {city}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-slate-400">
                        No cities found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* USER SELECT */}

            {audience === "Specific User" && (
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select User
                </label>

                {/* This acts like a dropdown trigger */}
                <div
                  onClick={() => setIsUserListOpen(!isUserListOpen)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm cursor-pointer flex justify-between items-center"
                >
                  {selectedUser
                    ? users.find(
                        (u) => (u._id || u.id || u.userId) === selectedUser,
                      )?.fullName || "User Selected"
                    : "Select a user..."}
                  <span>{isUserListOpen ? "▲" : "▼"}</span>
                </div>

                {/* This is the list that closes automatically */}
                {isUserListOpen && (
                  <div className="absolute z-10 w-full h-32 mt-1 overflow-y-auto border border-slate-200 rounded-lg bg-white p-1 shadow-lg">
                    {users.length > 0 ? (
                      users.map((user, index) => {
                        const userId = user._id || user.id || user.userId;
                        const userName =
                          user.fullName ||
                          user.name ||
                          user.email ||
                          "Unnamed User";

                        return (
                          <div
                            key={userId || index}
                            onClick={() => {
                              setSelectedUser(userId);
                              setIsUserListOpen(false); // <--- THIS CLOSES THE LIST
                            }}
                            className={`p-2 text-sm cursor-pointer rounded-md ${
                              selectedUser === userId
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-slate-100"
                            }`}
                          >
                            {userName}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-2 text-sm text-slate-400">
                        No users found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TITLE */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notification Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg"
                placeholder="Enter notification title"
              />
            </div>

            {/* BODY */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message Body
              </label>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg h-24 resize-none"
                placeholder="Enter notification message"
              />
            </div>

            {/* BUTTON */}

            <button
              onClick={sendNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium w-full flex justify-center items-center gap-2 transition-colors"
            >
              <Bell size={18} />
              Send Notification
            </button>
          </div>
        </div>

        {/* RIGHT SECTION */}

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4">Live Preview</h3>

          <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm max-w-[300px] mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Bell size={20} />
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-900">
                  {title || "Notification Title"}
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  {body || "Notification message preview"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= SELECTION CARD =================

const SelectionCard = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
    ${
      active
        ? "border-blue-600 bg-blue-50 text-blue-700"
        : "border-slate-200 hover:border-blue-300 text-slate-600"
    }`}
  >
    {icon}

    <span className="text-xs font-medium mt-2">{label}</span>
  </div>
);

export default Notify;
