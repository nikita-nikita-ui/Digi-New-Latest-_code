import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  PlusCircle,
  Eye,
  Layers,
  X,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getAllCategoriesAPI,
  getAllSubCategoriesAPI,
  createSubCategory,
  updateSubCategoryAPI,
  deleteSubCategory,
} from "../../auth/category";

const InlineDeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedItem,
  subCategoryList,
}) => {
  const [targetSub, setTargetSub] = useState("");

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Confirm Delete
        </h3>

        <p className="text-xs text-slate-500 mb-3">
          Category:{" "}
          <span className="font-semibold text-slate-800">
            {selectedItem?.name}
          </span>
        </p>

        <div className="mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select Sub-Category to Delete
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all duration-300"
            value={targetSub}
            onChange={(e) => setTargetSub(e.target.value)}
          >
            <option value="">Select Sub-category</option>
            {subCategoryList.map((sub, idx) => (
              <option key={idx} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(targetSub)}
            disabled={!targetSub}
            className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white py-3 rounded-2xl text-xs font-bold transition-all disabled:text-slate-400 disabled:opacity-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const SubCategoryShop = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubCategoryItem, setSelectedSubCategoryItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const navDropdownRef = useRef(null);
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    categoryId: "",
    subCategory: "",
  });

  const [editData, setEditData] = useState({
    categoryId: "",
    oldSubCategory: "",
    newSubCategory: "",
  });
  const [editSubCategoryTags, setEditSubCategoryTags] = useState([]);

  useEffect(() => {
    fetchCategories();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      fetchSubCategories();
    }
  }, [formData.categoryId]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllSubCategoriesAPI(formData.categoryId);
      setSubCategories([
        {
          _id: formData.categoryId,
          name: response.categoryName,
          type: "Business",
          image: "https://via.placeholder.com/600x400",
          subCategory: response.subCategories || [],
          status: true,
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sub-categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategoriesAPI();
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleView = (item) => {
    setSelectedSubCategory(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedSubCategoryItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (subCategoryName) => {
    try {
      await deleteSubCategory(selectedSubCategoryItem._id, subCategoryName);
      await fetchSubCategories();
      setIsDeleteModalOpen(false);
      setSelectedSubCategoryItem(null);
      toast.success("Sub-Category Deleted Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Delete Sub-Category");
    }
  };

  const handleEdit = (item) => {
    console.log("item.subCategory →", item.subCategory); // check this in browser console
    const subs = item.subCategory || [];
    setEditSubCategoryTags(subs);
    setEditData({
      categoryId: item._id,
      oldSubCategory: subs[0] || "",
      newSubCategory: subs[0] || "",
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "oldSubCategory" ? { newSubCategory: value } : {}),
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createSubCategory(
        formData.categoryId,
        formData.subCategory,
      );
      setSubCategories((prev) => [response.data, ...prev]);
      setIsModalOpen(false);
      setFormData({
        categoryId: "",
        subCategory: "",
      });
      toast.success("Sub-Category Added Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Add Sub-Category");
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        categoryId: editData.categoryId,
        oldSubCategory: editData.oldSubCategory,
        newSubCategory: editData.newSubCategory,
      };
      const response = await updateSubCategoryAPI(payload);
      fetchSubCategories();
      setIsEditModalOpen(false);
      toast.success(response.message || "Sub-Category Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Update Sub-Category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50 w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-slate-500 animate-pulse">
            Loading Sub-Categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen w-full font-sans overflow-x-hidden">
      <div className="w-full mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Sub-Categories Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Browse and construct subcategories mapped with specialized
              services.
            </p>
          </div>

          <div className="w-full sm:w-64 max-w-full relative" ref={dropdownRef}>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Choose Category Name
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-between gap-2"
            >
              <span className="truncate">
                {categories.find((c) => c._id === selectedCategory)?.name ||
                  "Select Category"}
              </span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                <div
                  onClick={() => {
                    setSelectedCategory("");
                    setFormData((prev) => ({ ...prev, categoryId: "" }));
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Select Category
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    onClick={() => {
                      setSelectedCategory(cat._id);
                      setFormData((prev) => ({ ...prev, categoryId: cat._id }));
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                      selectedCategory === cat._id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-40" ref={navDropdownRef}>
            <button
              type="button"
              onClick={() => setIsNavDropdownOpen((prev) => !prev)}
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-between gap-2"
            >
              <span>Sub-Category</span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isNavDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isNavDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div
                  onClick={() => {
                    navigate("/cat-shop");
                    setIsNavDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
                >
                  Category
                </div>
                <div className="px-4 py-3 text-sm font-semibold bg-indigo-50 text-indigo-700 cursor-pointer">
                  Sub-Category
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PlusCircle size={18} />
            Add Sub-Category
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {subCategories.map((item) => (
          <div
            key={item._id}
            className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-slate-100">
                  <Layers size={11} className="text-indigo-600" />
                  {item.type}
                </span>
              </div>

              <div className="absolute top-4 right-4">
                {item.status ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 backdrop-blur-md text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVE
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-700 border border-rose-200/50 backdrop-blur-md text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    INACTIVE
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors duration-200">
                  {item.name}
                </h2>

                <div className="mt-3">
                  <span className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider block mb-2">
                    Subcategories
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {item.subCategory && item.subCategory.length > 0 ? (
                      item.subCategory.map((sub, index) => (
                        <span
                          key={index}
                          className="bg-indigo-50/60 text-indigo-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-100/30"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">
                        No sub-items active
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleView(item)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 border border-slate-200/60"
                >
                  <Eye size={13} className="text-slate-500" />
                  View
                </button>

                <button
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 border border-indigo-100/60"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 size={13} className="text-indigo-500" /> Edit
                </button>

                <button
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 border border-rose-100/60"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 size={13} className="text-rose-500" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <PlusCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-wide">
                    New Sub-Category
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Map customized sub-categories
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 overflow-y-auto max-h-[70vh]"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsModalDropdownOpen((prev) => !prev)}
                      className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">
                        {categories.find((c) => c._id === formData.categoryId)
                          ?.name || "Select Category"}
                      </span>
                      <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isModalDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isModalDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              categoryId: "",
                            }));
                            setIsModalDropdownOpen(false);
                          }}
                          className="px-4 py-3 text-sm text-slate-400 hover:bg-slate-50 cursor-pointer"
                        >
                          Select Category
                        </div>
                        {categories.map((cat) => (
                          <div
                            key={cat._id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                categoryId: cat._id,
                              }));
                              setIsModalDropdownOpen(false);
                            }}
                            className={`px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                              formData.categoryId === cat._id
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-700"
                            }`}
                          >
                            {cat.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sub-Category Name
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder-slate-400"
                    placeholder="Enter sub-category name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Edit2 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-wide">
                    Edit Sub-Category
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Alter mappings, types, or visual tags
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Old Sub-Category
                  </label>
                  // WITH THIS:
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEditDropdownOpen((prev) => !prev)}
                      className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">
                        {editData.oldSubCategory || "Select Sub-Category"}
                      </span>
                      <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isEditDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isEditDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                        {editSubCategoryTags.map((sub, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setEditData((prev) => ({
                                ...prev,
                                oldSubCategory: sub,
                                newSubCategory: sub,
                              }));
                              setIsEditDropdownOpen(false);
                            }}
                            className={`px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                              editData.oldSubCategory === sub
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700"
                            }`}
                          >
                            {sub}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    New Sub-Category
                  </label>
                  <input
                    type="text"
                    name="newSubCategory"
                    value={editData.newSubCategory}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium placeholder-slate-400"
                    placeholder="Enter new sub-category name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedSubCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-800 hover:text-black transition-colors bg-white/95 backdrop-blur-md p-2 rounded-full shadow-md z-10"
            >
              <X size={16} />
            </button>

            <div className="relative aspect-[16/10] bg-slate-100">
              <img
                src={selectedSubCategory.image}
                alt={selectedSubCategory.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent flex items-end p-6">
                <div>
                  <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider mb-2 inline-block shadow-sm">
                    {selectedSubCategory.type}
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {selectedSubCategory.name}
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Status
                </span>
                {selectedSubCategory.status ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />{" "}
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <XCircle size={14} className="text-rose-500" /> Inactive
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                  Mapped Tags & Subcategories
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubCategory.subCategory?.length > 0 ? (
                    selectedSubCategory.subCategory.map((sub, index) => (
                      <span
                        key={index}
                        className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100"
                      >
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-slate-400">
                      No subcategories listed
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition-all duration-200"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <InlineDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        selectedItem={selectedSubCategoryItem}
        subCategoryList={selectedSubCategoryItem?.subCategory || []}
      />
    </div>
  );
};

export default SubCategoryShop;
