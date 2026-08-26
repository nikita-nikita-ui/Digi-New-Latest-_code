import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  PlusCircle,
  Eye,
  Layers,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  getAllCategoriesAPI,
  createCategoryAPI,
  deleteCategoryAPI,
  updateCategoryAPI,
} from "../../auth/category";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../components/common/DeleteConfirm";

const CategoryShop = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    _id: "",
    name: "",
    status: true,
  });

  const [editImage, setEditImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    subCategory: "",
    status: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleView = (item) => {
    setSelectedCategory(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedCategoryId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategoryAPI(selectedCategoryId);
      setCategories((prev) =>
        prev.filter((item) => item._id !== selectedCategoryId)
      );
      setIsDeleteModalOpen(false);
      setSelectedCategoryId(null);
      toast.success("Category Deleted Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Delete Category");
    }
  };

  const handleEdit = (item) => {
    setEditData({
      _id: item._id,
      name: item.name,
      status: item.status,
    });
    setEditImage(null);
    setIsEditModalOpen(true);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategoriesAPI();
      setCategories(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateCategory = async () => {
    try {
      const data = new FormData();
      data.append("name", editData.name);
      data.append("status", editData.status);

      if (editImage) {
        data.append("image", editImage);
      }

      const response = await updateCategoryAPI(editData._id, data);
      setCategories((prev) =>
        prev.map((item) => (item._id === editData._id ? response.data : item))
      );
      setIsEditModalOpen(false);
      setEditImage(null);
      toast.success("Category Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Update Category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("type", "Business");
      data.append("image", selectedImage);
      data.append("status", formData.status);

      const response = await createCategoryAPI(data);
      setCategories((prev) => [response.data, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: "",
        image: "",
        subCategory: "",
        status: true,
      });
      setSelectedImage(null);
      toast.success("Category Added Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Add Category");
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
            Loading Categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen w-full font-sans">
      <div className="w-full mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Shop Categories
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store's business categories, status configurations, and subcategories.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <select
            className="bg-white border border-slate-200 text-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm cursor-pointer"
            onChange={(e) => {
              if (e.target.value === "SUBCATEGORY") {
                navigate("/subcategoryshop");
              }
            }}
          >
            <option value="CATEGORY">Category Manager</option>
            <option value="SUBCATEGORY">Sub-Category Manager</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} />
            Add Category
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {categories.map((item) => (
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
                    Sub-Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {item.subCategory && item.subCategory.length > 0 ? (
                      item.subCategory.map((sub, index) => (
                        <span
                          key={index}
                          className="bg-indigo-50/60 text-indigo-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-100/30"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">
                        No sub-categories assigned
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
                  onClick={() => handleEdit(item)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 border border-indigo-100/60"
                >
                  <Edit2 size={13} className="text-indigo-500" />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 border border-rose-100/60"
                >
                  <Trash2 size={13} className="text-rose-500" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white relative">
              <button
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
                    Add New Category
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Create a new category for your shop services
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Barber Shop"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Upload Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  required
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-bold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    border border-slate-200 rounded-xl p-1.5 cursor-pointer bg-white transition-all focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Category Status
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Toggle visibility of this category
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white relative">
              <button
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
                    Edit Category
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Update category details and status
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-bold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    border border-slate-200 rounded-xl p-1.5 cursor-pointer bg-white transition-all focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 font-semibold pl-1">
                  Leave blank to keep the current image
                </p>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Category Status
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Toggle visibility of this category
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={editData.status}
                    onChange={handleEditChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
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
                  onClick={handleUpdateCategory}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative aspect-[16/9] bg-slate-100">
              <img
                src={selectedCategory.image}
                alt={selectedCategory.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 text-slate-800 hover:text-black transition-colors bg-white/95 backdrop-blur-md p-2 rounded-full shadow-md hover:scale-105"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Layers size={12} className="text-indigo-600" />
                  {selectedCategory.type}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <span className="text-[10px] uppercase text-indigo-600 font-extrabold tracking-widest">
                  Category Name
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {selectedCategory.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    Status
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedCategory.status ? (
                      <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Active
                      </span>
                    ) : (
                      <span className="text-rose-600 text-sm font-bold flex items-center gap-1">
                        <XCircle size={16} className="text-rose-500" /> Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    Assigned Sub-Categories
                  </span>
                  <div className="mt-1 text-slate-800 text-sm font-bold">
                    {selectedCategory.subCategory?.length || 0} Items
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">
                  Sub-Categories Checklist
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.subCategory?.length > 0 ? (
                    selectedCategory.subCategory.map((sub, index) => (
                      <span
                        key={index}
                        className="bg-indigo-50/50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-100/50"
                      >
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm italic">
                      No Sub-categories Configured
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white py-3 rounded-2xl text-xs font-bold transition-all"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CategoryShop;