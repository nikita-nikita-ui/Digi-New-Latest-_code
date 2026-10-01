import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Bell, MapPin, Users, Globe } from "lucide-react";

import {
  GsendNotificationAPI,
  getAllUserCitiesAPI,
  getLocalJobUsers,
} from "../../auth/adminLogin";

const Notify = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [audience, setAudience] = useState("Global");
  const [scheduledAt, setScheduledAt] = useState("");
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
              ${activeTab === tab.id
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
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [targetValue, setTargetValue] = useState("");
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

      const response = await getLocalJobUsers();

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
      if (isScheduled && !scheduledAt) {
        toast.error("Please select scheduled date and time");
        return;
      }

      if (
        isScheduled &&
        new Date(scheduledAt) <= new Date()
      ) {
        toast.error("Please select a future date and time");
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
        targetType:
          audience === "Blood Group"
            ? "BLOOD_GROUP"
            : audience === "Gender"
              ? "GENDER"
              : audience === "General User"
                ? "USER_TYPE"
                : audience === "Service Provider"
                  ? "USER_TYPE"
                  : audience === "Business Shops"
                    ? "BUSINESS_SHOPS"
                    : audience === "Specific User"
                      ? "USER"
                      : audience === "City-based"
                        ? "CITY"
                        : "GLOBAL",

        ...(audience !== "Global" && {
          targetValue:
            audience === "Blood Group"
              ? targetValue
              : audience === "Gender"
                ? targetValue
                : audience === "General User"
                  ? "GENERAL_USER"
                  : audience === "Service Provider"
                    ? "SERVICE_PROVIDER"
                    : audience === "Specific User"
                      ? selectedUser
                      : audience === "City-based"
                        ? selectedCity
                        : "",
        }),

        title,
        body,
        ...(isScheduled && {
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
        imageUrl,
      };
      console.log("SELECTED USER =", selectedUser);

      console.log("FINAL PAYLOAD =", payload);

      const response = await GsendNotificationAPI(payload);

      console.log("SEND RESPONSE =", response);

      toast.success("Notification Sent Successfully");

      // RESET FORM

      setTitle("");
      setBody("");
      setImageUrl("");
      setTargetValue("");
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
    <div className="grid grid-cols-1 gap-8 w-full">
        {/* LEFT SECTION */}

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-blue-600" />
            Compose Notification
          </h2>

          <div className="space-y-4">
            {/* AUDIENCE */}

            <div>
              <label className="block text-lg font-bold text-slate-900 mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SelectionCard
                  icon={<Bell size={18} />}
                  label="Scheduled"
                  active={isScheduled}
                  onClick={() => setIsScheduled(!isScheduled)}
                />
                <SelectionCard
                  icon={<Globe size={18} />}
                  label="Global"
                  active={audience === "Global"}
                  onClick={() => setAudience("Global")}
                />



                <SelectionCard
                  icon={<MapPin size={18} />}
                  label="City"
                  active={audience === "City-based"}
                  onClick={() => setAudience("City-based")}
                />

                <SelectionCard
                  icon={<Users size={18} />}
                  label="Specific User"
                  active={audience === "Specific User"}
                  onClick={() => setAudience("Specific User")}
                />

                <SelectionCard
                  icon={<Users size={18} />}
                  label="Blood Group"
                  active={audience === "Blood Group"}
                  onClick={() => setAudience("Blood Group")}
                />

                <SelectionCard
                  icon={<Users size={18} />}
                  label="Gender"
                  active={audience === "Gender"}
                  onClick={() => setAudience("Gender")}
                />

                <SelectionCard
                  icon={<Users size={18} />}
                  label="General User"
                  active={audience === "General User"}
                  onClick={() => setAudience("General User")}
                />

                <SelectionCard
                  icon={<Users size={18} />}
                  label="Service Provider"
                  active={audience === "Service Provider"}
                  onClick={() => setAudience("Service Provider")}
                />

                <SelectionCard
                  icon={<Users size={18} />}
                  label="Business Shops"
                  active={audience === "Business Shops"}
                  onClick={() => setAudience("Business Shops")}
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
                          className={`p-2 text-sm cursor-pointer rounded-md ${selectedCity === city
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
                            className={`p-2 text-sm cursor-pointer rounded-md ${selectedUser === userId
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
              <label className="block text-base font-bold text-slate-900 mb-2">
                Target Type
              </label>
              <select
                value={
                  audience === "Global"
                    ? "GLOBAL"
                    : audience === "City-based"
                      ? "CITY"
                      : audience === "Specific User"
                        ? "USER"
                        : audience === "Blood Group"
                          ? "BLOOD_GROUP"
                          : audience === "Gender"
                            ? "GENDER"
                            : audience === "General User"
                              ? "USER_TYPE_GENERAL"
                              : audience === "Service Provider"
                                ? "USER_TYPE_SERVICE"
                                : audience === "Business Shops"
                                  ? "BUSINESS_SHOPS"
                                  : ""
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "GLOBAL") setAudience("Global");
                  else if (value === "CITY") setAudience("City-based");
                  else if (value === "USER") setAudience("Specific User");
                  else if (value === "BLOOD_GROUP") setAudience("Blood Group");
                  else if (value === "GENDER") setAudience("Gender");
                  else if (value === "USER_TYPE_GENERAL") setAudience("General User");
                  else if (value === "USER_TYPE_SERVICE") setAudience("Service Provider");
                  else if (value === "BUSINESS_SHOPS") setAudience("Business Shops");
                }}
                className="w-full p-2.5 border border-slate-200 rounded-lg"
              >
                <option value="BLOOD_GROUP">Blood Group</option>
                <option value="GENDER">Gender</option>
                <option value="USER_TYPE_GENERAL">General User</option>
                <option value="USER_TYPE_SERVICE">Service Provider</option>
                <option value="BUSINESS_SHOPS">Business Shops</option>
                <option value="USER">Single User</option>
                <option value="CITY">City</option>
                <option value="GLOBAL">Global</option>
              </select>
            </div>

            {/* TARGET VALUE */}
            {isScheduled && (
              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Scheduled At
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    e.target.blur(); // calendar/time picker close
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                />
              </div>
            )}
            {audience !== "Global" && audience !== "Business Shops" && (
              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Target Value
                </label>

                {audience === "Blood Group" ? (
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : audience === "Gender" ? (
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : audience === "General User" ? (
                  <input
                    type="text"
                    value="GENERAL_USER"
                    readOnly
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                ) : audience === "Service Provider" ? (
                  <input
                    type="text"
                    value="SERVICE_PROVIDER"
                    readOnly
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                ) : audience === "City-based" ? (
                  <input
                    type="text"
                    value={selectedCity}
                    readOnly
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                    placeholder="Select city"
                  />
                ) : audience === "Specific User" ? (
                  <input
                    type="text"
                    value={
                      users.find(
                        (u) => (u._id || u.id || u.userId) === selectedUser
                      )?.fullName || ""
                    }
                    readOnly
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                    placeholder="Select user"
                  />
                ) : null}
              </div>
            )}

            {/* TITLE */}

            <div>
              <label className="block text-base font-bold text-slate-900 mb-2">
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



            {/* IMAGE URL */}

            <div>
              <label className="block text-base font-bold text-slate-900 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg"
                placeholder="Enter image URL"
              />
            </div>



            {/* BODY */}

            <div>
              <label className="block text-base font-bold text-slate-900 mb-2">
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

      
      </div>
    </div>
  );
};

// ================= SELECTION CARD =================

const SelectionCard = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
    ${active
        ? "border-blue-600 bg-blue-50 text-blue-700"
        : "border-slate-200 hover:border-blue-300 text-slate-600"
      }`}
  >
    {icon}

    <span className="text-xs font-medium mt-2">{label}</span>
  </div>
);

export default Notify;
