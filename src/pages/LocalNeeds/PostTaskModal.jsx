import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X, Phone, MessageSquare, DollarSign, Sparkles,
  Image, Navigation, User, Tag, ChevronDown, Check,
} from "lucide-react";
import { getJobCategoriesByType, getLocalJobUsers } from "../../auth/adminLogin";
const PostTaskModal = ({ onSave, onClose, initialData }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    workType: "",
    whatsappNumber: "",
    userId: "",
    categoryId: "",
    subCategory: "",
    budget: { min: "", max: "" },
    preferredCommunication: [],
    location: { type: "Point", coordinates: ["", ""], address: "" },
    images: null,
    isFeatured: false,
  });

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      title: initialData.title || "",
      details: initialData.details || "",
      workType: initialData.workType || "",
      whatsappNumber: initialData.whatsappNumber || "",
      userId: initialData.userId?._id || "",
      categoryId: initialData.category || "",
      subCategory: initialData.subCategory || "",
      budget: {
        min: initialData.budget?.min || "",
        max: initialData.budget?.max || "",
      },
      preferredCommunication: initialData.preferredCommunication || [],
      location: {
        type: "Point",
        coordinates: initialData.location?.coordinates || ["", ""],
        address: initialData.location?.address || "",
      },
      images: null,
      isFeatured: initialData.isFeatured || false,
    });

    if (initialData.images?.length) {
      setPreviewImage(initialData.images[0]);
    }
  }, [initialData]);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await getLocalJobUsers(1, 100);

      console.log("Users Response:", response);

      if (response?.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error("Users API Error:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await getJobCategoriesByType("LOCAL_JOB");

      console.log("Categories Response:", response);

      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Categories API Error:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // Category select hone par subcategories automatically fetch
    if (name === "categoryId") {
      const selectedCategory = categories.find(
        (category) => category._id === value
      );

      setFormData((prev) => ({
        ...prev,
        categoryId: value,
        subCategory: "",
      }));

      setSubCategories(selectedCategory?.subCategory || []);

      return;
    }

    if (name === "images") {
      const file = files[0];
      setFormData({ ...formData, images: file });
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else if (name === "location.address") {
      setFormData({
        ...formData,
        location: { ...formData.location, address: value },
      });
    } else if (name === "location.coordinates[0]") {
      const updated = [...formData.location.coordinates];
      updated[0] = value;
      setFormData({
        ...formData,
        location: { ...formData.location, coordinates: updated },
      });
    } else if (name === "location.coordinates[1]") {
      const updated = [...formData.location.coordinates];
      updated[1] = value;
      setFormData({
        ...formData,
        location: { ...formData.location, coordinates: updated },
      });
    } else if (name === "budget.min") {
      setFormData({ ...formData, budget: { ...formData.budget, min: value } });
    } else if (name === "budget.max") {
      setFormData({ ...formData, budget: { ...formData.budget, max: value } });
    } else if (name === "preferredCommunication") {
      const updated = formData.preferredCommunication.includes(value)
        ? formData.preferredCommunication.filter((v) => v !== value)
        : [...formData.preferredCommunication, value];
      setFormData({ ...formData, preferredCommunication: updated });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [longitude, latitude],
          },
        }));
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location coordinates");
      },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.details ||
      !formData.workType ||
      !formData.whatsappNumber ||
      !formData.userId ||
      !formData.categoryId ||
      !formData.subCategory ||
      !formData.budget.min ||
      !formData.budget.max ||
      !formData.location.address ||
      !formData.location.coordinates[0] ||
      !formData.location.coordinates[1] ||
      formData.preferredCommunication.length === 0
    ) {
      toast.error("Please fill all required fields", { autoClose: 3000 });
      return;
    }

    const whatsapp = formData.whatsappNumber?.toString().replace(/\D/g, "");
    if (whatsapp.length < 10) {
      toast.error("WhatsApp number must be at least 10 digits", {
        autoClose: 3000,
      });
      return;
    }

    // Build FormData payload matching the API's expected shape
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("details", formData.details);
    payload.append("workType", formData.workType);
    payload.append("whatsappNumber", formData.whatsappNumber);
    payload.append("isFeatured", formData.isFeatured);
    payload.append("budget", JSON.stringify(formData.budget));

    formData.preferredCommunication.forEach((item) => {
      payload.append("preferredCommunication[]", item);
    });

    payload.append("location[coordinates][0]", formData.location.coordinates[0]);
    payload.append("location[coordinates][1]", formData.location.coordinates[1]);
    payload.append("location[address]", formData.location.address);

    if (formData.images) {
      payload.append("images", formData.images);
    }

    payload.append("userId", formData.userId);
    payload.append("categoryId", formData.categoryId);
    payload.append("subCategory", formData.subCategory);

    onSave(payload, initialData?._id || null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform scale-100 transition-all">

        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={20} />
            <h2 className="font-extrabold text-base tracking-wide uppercase">
              {initialData ? "Adjust Task Fields" : "Post A New Task"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white text-slate-700">

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Brief Heading</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Graphic Designer for Local Agency"
              className="w-full border border-slate-200 bg-slate-50 p-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-800 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comprehensive Details</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={4}
              placeholder="State clear guidelines, project terms, specific skill demands, and timeline expectations..."
              className="w-full border border-slate-200 bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-800 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Arrangement Category</label>
              <input
                name="workType"
                value={formData.workType}
                onChange={handleChange}
                placeholder="e.g. Remote, On-Site, Hybrid"
                className="w-full border border-slate-200 bg-slate-50 p-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-semibold text-slate-800 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Contact Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Phone size={16} />
                </span>
                <input
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-slate-50 p-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-semibold text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                User ID
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none z-10">
                  <User size={16} />
                </span>

             <button
  type="button"
  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
  disabled={loadingUsers}
  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-800 transition-all text-sm flex items-center justify-between"
>
  <span className="truncate">
    {loadingUsers
      ? "Loading users..."
      : formData.userId
      ? users.find((user) => user._id === formData.userId)?.fullName ||
        "Select User"
      : "Select User"}
  </span>

  <ChevronDown
    size={18}
    className={`text-slate-400 transition-transform ${
      isUserDropdownOpen ? "rotate-180" : ""
    }`}
  />
</button>

{isUserDropdownOpen && !loadingUsers && (
  <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
    <div className="max-h-60 overflow-y-auto py-1">
      {users.length > 0 ? (
        users.map((user) => (
          <button
            type="button"
            key={user._id}
            onClick={() => {
              handleChange({
                target: {
                  name: "userId",
                  value: user._id,
                },
              });

              setIsUserDropdownOpen(false);
            }}
            className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between hover:bg-indigo-50 transition-colors ${
              formData.userId === user._id
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-700"
            }`}
          >
            <span className="truncate">
              {user.fullName}
            </span>

            {formData.userId === user._id && (
              <Check size={16} className="text-indigo-500 shrink-0" />
            )}
          </button>
        ))
      ) : (
        <div className="px-4 py-4 text-center text-sm text-slate-400">
          No users found
        </div>
      )}
    </div>
  </div>
)}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Category
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none z-10">
                  <Tag size={16} />
                </span>

                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-800 transition-all text-sm appearance-none"
                >
                  <option value="">
                    {loadingCategories ? "Loading categories..." : "Select Category"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sub Category
              </label>

              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                disabled={!formData.categoryId}
                className="w-full border border-slate-200 bg-slate-50 p-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-800 transition-all text-sm disabled:opacity-50"
              >
                <option value="">
                  {!formData.categoryId
                    ? "Select Category First"
                    : subCategories.length === 0
                      ? "No Sub Category Available"
                      : "Select Sub Category"}
                </option>

                {subCategories.map((subCategory, index) => (
                  <option key={index} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 bg-slate-50 p-5 rounded-3xl border border-slate-150">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Geographical Address</label>
              <button
                type="button"
                onClick={fetchLocation}
                className="flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 px-3 py-1.5 text-xs font-bold rounded-xl transition duration-150 cursor-pointer border border-indigo-150"
              >
                <Navigation size={12} strokeWidth={2.5} />
                Fetch Coordinates
              </button>
            </div>
            <input
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              placeholder="Full location street address, city name"
              className="w-full border border-slate-200 bg-white p-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-800 transition-all"
            />

            <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Longitude: {formData.location.coordinates[0] || "None"}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Latitude: {formData.location.coordinates[1] || "None"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Minimum Budget ($)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <DollarSign size={16} />
                </span>
                <input
                  name="budget.min"
                  value={formData.budget.min}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-semibold text-slate-800 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maximum Budget ($)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <DollarSign size={16} />
                </span>
                <input
                  name="budget.max"
                  value={formData.budget.max}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-semibold text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Communication preferences</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer select-none text-sm font-semibold hover:bg-slate-100 transition-all">
                <input
                  type="checkbox"
                  value="Chat"
                  checked={formData.preferredCommunication.includes("Chat")}
                  onChange={handleChange}
                  name="preferredCommunication"
                  className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={15} className="text-emerald-500" />
                  Chat
                </span>
              </label>

              <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer select-none text-sm font-semibold hover:bg-slate-100 transition-all">
                <input
                  type="checkbox"
                  value="Call"
                  checked={formData.preferredCommunication.includes("Call")}
                  onChange={handleChange}
                  name="preferredCommunication"
                  className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="flex items-center gap-1.5">
                  <Phone size={15} className="text-indigo-500" />
                  Direct Call
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Attached Visual Resource</label>
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100/50 p-6 rounded-2xl text-center cursor-pointer transition-all duration-200">
              <input
                type="file"
                name="images"
                onChange={handleChange}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer text-indigo-600 font-bold text-sm flex flex-col items-center gap-1"
              >
                <Image size={24} className="text-indigo-500 mb-1" />
                Click to drop or select visual files
              </label>
            </div>
            {previewImage && (
              <div className="relative inline-block mt-2">
                <img
                  src={previewImage}
                  alt="preview"
                  className="w-36 h-36 object-cover rounded-2xl border-2 border-slate-200 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <label className="flex gap-2.5 items-center select-none cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" />
                Highlight as Featured Task
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-sm rounded-2xl transition duration-150 cursor-pointer"
            >
              Close Window
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition duration-150 cursor-pointer"
            >
              {initialData ? "Save Alterations" : "Broadcast Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostTaskModal;