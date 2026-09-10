import React, { useEffect, useRef, useState } from "react";
import {
  X,
  PlusCircle,
  Loader2,
  User,
  MapPin,
  Navigation,
  Image as ImageIcon, ChevronDown, Check
} from "lucide-react";
import toast from "react-hot-toast";

import {
  createNewJob,
  getLocalJobUsers,
  getJobCategoriesByType,
} from "../../auth/adminLogin";

const initialJobState = {
  userId: "",
  title: "",

  companyName: "",
  jobRole: "",
  vacancies: 5,
  minPay: "",
  maxPay: "",
  details: "",
  whatsappNumber: "",
  experience: "Fresher",
  qualification: "10th Pass",
  address: "",
  latitude: "19.0760",
  longitude: "72.8777",

  categoryId: "",
  subCategory: "",
};

const PostPartTimeJob = ({ isOpen, onClose, onSuccess }) => {
  const [newJob, setNewJob] = useState(initialJobState);

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [createImages, setCreateImages] = useState([]);

  const createFileInputRef = useRef(null);

const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  useEffect(() => {
    if (!isOpen) return;

    fetchUsers();
    fetchCategories();
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setUserLoading(true);

      const response = await getLocalJobUsers(1, 100);

      if (response?.success) {
        setUsers(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch local job users:", err);
      setUsers([]);
      toast.error("Failed to fetch users");
    } finally {
      setUserLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);

      const response =
        await getJobCategoriesByType("PART_TIME_JOB");

      if (response?.success) {
        setCategories(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error(
        "Failed to fetch part-time job categories:",
        err
      );

      setCategories([]);
      toast.error("Failed to fetch categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  // --------------------------------------------------
  // LOCATION
  // --------------------------------------------------

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } =
          position.coords;

        try {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          const osmData = await osmRes.json();

          const address =
            osmData.display_name ||
            "Location Found";

          setNewJob((prev) => ({
            ...prev,
            latitude,
            longitude,
            address,
          }));

          toast.success("Location updated!");
        } catch (error) {
          console.error(
            "Error resolving address:",
            error
          );

          toast.error("Error resolving address");
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        console.error(
          "Location permission error:",
          error
        );

        toast.error("Location permission denied");
        setLocLoading(false);
      }
    );
  };

  // --------------------------------------------------
  // IMAGE HANDLING
  // --------------------------------------------------

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    if (!selectedFiles.length) return;

    const remainingSlots =
      5 - createImages.length;

    const filesToAdd = selectedFiles.slice(
      0,
      remainingSlots
    );

    if (selectedFiles.length > remainingSlots) {
      toast.error("Maximum 5 images allowed");
    }

    setCreateImages((prev) => [
      ...prev,
      ...filesToAdd,
    ]);

    // Allow selecting the same file again
    e.target.value = "";
  };

  const removeImage = (index) => {
    setCreateImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // --------------------------------------------------
  // CATEGORY CHANGE
  // --------------------------------------------------

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;

    setNewJob((prev) => ({
      ...prev,
      categoryId,
      subCategory: "",
    }));
  };

  // --------------------------------------------------
  // CREATE JOB
  // --------------------------------------------------

  const handleCreateNewJob = async () => {
    if (!newJob.userId) {
      toast.error("Select a User first!");
      return;
    }

    if (!newJob.title?.trim()) {
      toast.error("Job Title is required!");
      return;
    }



    if (!newJob.categoryId) {
      toast.error("Please select a category!");
      return;
    }

    if (!newJob.minPay) {
      toast.error("Minimum salary is required!");
      return;
    }

    if (!newJob.maxPay) {
      toast.error("Maximum salary is required!");
      return;
    }

    if (
      Number(newJob.minPay) >
      Number(newJob.maxPay)
    ) {
      toast.error(
        "Minimum salary cannot be greater than maximum salary"
      );
      return;
    }

    try {
      setSaveLoading(true);

      const formData = new FormData();

      // --------------------------------------------------
      // BASIC DETAILS
      // --------------------------------------------------

      formData.append(
        "title",
        newJob.title.trim()
      );



      formData.append(
        "details",
        newJob.details || ""
      );

      formData.append(
        "userId",
        newJob.userId
      );



      formData.append(
        "categoryId",
        newJob.categoryId
      );

      formData.append(
        "subCategory",
        newJob.subCategory || ""
      );

      // --------------------------------------------------
      // SALARY
      // --------------------------------------------------

      formData.append(
        "salaryRange",
        JSON.stringify({
          min: Number(newJob.minPay) || 0,
          max: Number(newJob.maxPay) || 0,
        })
      );

      // --------------------------------------------------
      // LOCATION
      // --------------------------------------------------

      formData.append(
        "location[address]",
        newJob.address || ""
      );



      formData.append(
        "location[coordinates][0]",
        Number(newJob.longitude) || 0
      );

      formData.append(
        "location[coordinates][1]",
        Number(newJob.latitude) || 0
      );

      // --------------------------------------------------
      // IMAGES
      // --------------------------------------------------

      createImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });

      // --------------------------------------------------
      // API
      // --------------------------------------------------

      const response =
        await createNewJob(formData);

      const isSuccess =
        response?.success ||
        response?.data?.success;

      const message =
        response?.message ||
        response?.data?.message;

      if (isSuccess) {
        toast.success(
          message || "Job posted successfully!"
        );

        // Reset form
        setNewJob(initialJobState);
        setCreateImages([]);

        // Close popup
        onClose?.();

        // Refresh parent job list
        if (onSuccess) {
          await onSuccess();
        }
      } else {
        toast.error(
          message || "Failed to create job"
        );
      }
    } catch (err) {
      console.error(
        "Error creating job:",
        err
      );

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error creating job";

      toast.error(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const handleClose = () => {
    if (saveLoading) return;

    setNewJob(initialJobState);
    setCreateImages([]);

    onClose?.();
  };

  if (!isOpen) return null;

  // --------------------------------------------------
  // SELECTED CATEGORY
  // --------------------------------------------------

  const selectedCategory = categories.find(
    (category) =>
      (category._id || category.id) ===
      newJob.categoryId
  );

  const subCategories =
    selectedCategory?.subCategory || [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">

        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Post New Part-time Job
          </h2>

          <button
            onClick={handleClose}
            disabled={saveLoading}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* USER + TITLE + DESCRIPTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* USER */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <User
                  size={13}
                  className="text-slate-400"
                />
                Select Job Poster (User)*
              </label>

              <div className="relative">
                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  disabled={userLoading}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                >
                  <span className="truncate">
                    {userLoading
                      ? "Loading users..."
                      : newJob.userId
                        ? users.find(
                          (u) => (u._id || u.id) === newJob.userId
                        )?.fullName ||
                        users.find(
                          (u) => (u._id || u.id) === newJob.userId
                        )?.name ||
                        users.find(
                          (u) => (u._id || u.id) === newJob.userId
                        )?.mobile ||
                        users.find(
                          (u) => (u._id || u.id) === newJob.userId
                        )?.phone ||
                        "Unknown User"
                        : "Choose a user..."}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && !userLoading && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="max-h-60 overflow-y-auto py-1">
                      {users.length > 0 ? (
                        users.map((u) => {
                          const userId = u._id || u.id;

                          const userName =
                            u.fullName ||
                            u.name ||
                            u.mobile ||
                            u.phone ||
                            "Unknown User";

                          return (
                            <button
                              type="button"
                              key={userId}
                              onClick={() => {
                                setNewJob((prev) => ({
                                  ...prev,
                                  userId,
                                }));
                                setIsUserDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-xs flex items-center justify-between gap-3 hover:bg-indigo-50 transition-colors ${newJob.userId === userId
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "text-slate-600"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                  <User
                                    size={14}
                                    className="text-indigo-500"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold truncate">
                                    {userName}
                                  </p>

                                  {u.role && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {u.role}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {newJob.userId === userId && (
                                <Check
                                  size={15}
                                  className="text-indigo-500 shrink-0"
                                />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No users found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Input
              label="Job Title*"
              value={newJob.title}
              onChange={(v) =>
                setNewJob((prev) => ({
                  ...prev,
                  title: v,
                }))
              }
            />


          </div>

          {/* LOCATION */}
          <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
                <MapPin size={14} />
                Job Location
              </div>

              <button
                type="button"
                onClick={handleFetchLocation}
                disabled={locLoading || saveLoading}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-150 disabled:opacity-60"
              >
                {locLoading ? (
                  <Loader2
                    size={11}
                    className="animate-spin"
                  />
                ) : (
                  <Navigation size={11} />
                )}

                Fetch Location
              </button>
            </div>

            <Input
              label="Full Address*"
              value={newJob.address}
              onChange={(v) =>
                setNewJob((prev) => ({
                  ...prev,
                  address: v,
                }))
              }
            />

            <div className="grid grid-cols-2 gap-4">

              <Input
                label="Latitude"
                value={newJob.latitude}
                onChange={(v) =>
                  setNewJob((prev) => ({
                    ...prev,
                    latitude: v,
                  }))
                }
              />

              <Input
                label="Longitude"
                value={newJob.longitude}
                onChange={(v) =>
                  setNewJob((prev) => ({
                    ...prev,
                    longitude: v,
                  }))
                }
              />

            </div>
          </div>

          {/* COMPANY / ROLE / SALARY / VACANCIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">





            {/* SALARY */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Pay (₹)*"
                type="number"
                value={newJob.minPay}
                onChange={(v) =>
                  setNewJob((prev) => ({
                    ...prev,
                    minPay: v,
                  }))
                }
              />

              <Input
                label="Max Pay (₹)*"
                type="number"
                value={newJob.maxPay}
                onChange={(v) =>
                  setNewJob((prev) => ({
                    ...prev,
                    maxPay: v,
                  }))
                }
              />
            </div>


          </div>



          {/* CATEGORY + SUB CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CATEGORY */}
            <div className="w-full">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Category*
              </label>

              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 disabled:opacity-60"
                value={newJob.categoryId}
                onChange={handleCategoryChange}
                disabled={
                  categoryLoading ||
                  saveLoading
                }
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : "Choose a category..."}
                </option>

                {categories.map(
                  (category) => {
                    const categoryId =
                      category._id ||
                      category.id;

                    return (
                      <option
                        key={categoryId}
                        value={categoryId}
                      >
                        {category.name}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            {/* SUB CATEGORY */}
            <div className="w-full">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Sub Category
              </label>

              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 disabled:opacity-60"
                value={newJob.subCategory}
                onChange={(e) =>
                  setNewJob((prev) => ({
                    ...prev,
                    subCategory:
                      e.target.value,
                  }))
                }
                disabled={
                  !newJob.categoryId ||
                  saveLoading
                }
              >
                <option value="">
                  {newJob.categoryId
                    ? "Choose a sub category..."
                    : "Select category first..."}
                </option>

                {subCategories.map(
                  (subCategory, index) => (
                    <option
                      key={index}
                      value={subCategory}
                    >
                      {subCategory}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* FULL DETAILS */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Full Job Details/Description*
            </label>

            <textarea
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 min-h-[120px] resize-none"
              placeholder="Requirements..."
              value={newJob.details}
              onChange={(e) =>
                setNewJob((prev) => ({
                  ...prev,
                  details: e.target.value,
                }))
              }
            />
          </div>

          {/* IMAGES */}
          <div className="space-y-3">

            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon size={14} />
                Job Images (Max 5)
              </span>

              <span className="text-[9px] text-slate-300">
                {createImages.length}/5
              </span>
            </label>

            <div className="grid grid-cols-5 gap-3">

              {createImages.map(
                (file, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50"
                  >
                    <img
                      src={URL.createObjectURL(
                        file
                      )}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(idx)
                      }
                      disabled={
                        saveLoading
                      }
                      className="absolute top-1.5 right-1.5 bg-white/90 text-rose-500 rounded-full p-1 shadow-sm backdrop-blur-sm disabled:opacity-50"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )
              )}

              {createImages.length < 5 && (
                <button
                  type="button"
                  onClick={() =>
                    createFileInputRef.current?.click()
                  }
                  disabled={
                    saveLoading
                  }
                  className="aspect-square border border-dashed border-slate-200 hover:border-indigo-500 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors duration-200 bg-slate-50 disabled:opacity-50"
                >
                  <PlusCircle size={20} />
                </button>
              )}
            </div>

            <input
              type="file"
              ref={createFileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-2 flex justify-end gap-2.5 border-t border-slate-100">

            <button
              type="button"
              onClick={handleClose}
              disabled={saveLoading}
              className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreateNewJob}
              disabled={saveLoading}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 disabled:opacity-60"
            >
              {saveLoading ? (
                <>
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  Posting...
                </>
              ) : (
                "Post Job Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// INPUT COMPONENT
// --------------------------------------------------

const Input = ({
  label,
  type = "text",
  value,
  onChange,
}) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
      {label}
    </label>

    <input
      type={type}
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
    />
  </div>
);

export default PostPartTimeJob;