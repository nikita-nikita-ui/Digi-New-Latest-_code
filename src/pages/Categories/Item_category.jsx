import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllItemCategories,
  searchItemCategory,
  deleteItemCategory,
  createItemCategory,
  updateItemCategory,
} from "../../auth/Item";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
const ItemCategory = () => {
  const navigate = useNavigate();
  const [viewItem, setViewItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [editCategory, setEditCategory] = useState({
    id: "",
    name: "",
    image: null,
    status: true,
  });
  const [previewEditImage, setPreviewEditImage] = useState(null);
  const fetchCategories = async () => {
    try {
      const res = await getAllItemCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // 3. SEARCH EFFECT (Keep this after state and functions are defined)
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim() === "") {
        fetchCategories();
      } else {
        try {
          const res = await searchItemCategory(searchTerm);
          setCategories(res.data || []);
        } catch (error) {
          console.error("Search failed:", error);
        }
      }
    };

    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Item Category</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage your store's items, item categories, subcategories, and
          availability status.
        </p>
        <div className="flex justify-end">
        <div className="flex justify-end relative w-full">
  <div className="relative w-full sm:w-48">
    <button
      type="button"
      onClick={() => setCategoryDropdown(!categoryDropdown)}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-left flex items-center justify-between outline-none hover:border-blue-500 transition"
    >
      <span>Category</span>

      <span
        className={`transition-transform ${
          categoryDropdown ? "rotate-180" : ""
        }`}
      >
        ▾
      </span>
    </button>

    {categoryDropdown && (
      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            navigate("/cat-item");
            setCategoryDropdown(false);
          }}
          className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
        >
          Category
        </button>

        <button
          type="button"
          onClick={() => {
            navigate("/subcat-item");
            setCategoryDropdown(false);
          }}
          className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
        >
          Subcategory
        </button>
      </div>
    )}
  </div>
</div>
        </div>
        <div className="flex justify-between items-center mb-15">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mt-10"
          >
            + Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Sub Categories</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {categories.map((item) => (
              <tr
                key={item._id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4">
                  {item.subCategory?.length > 0 ? (
                    item.subCategory.join(", ")
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No subcategories
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${item.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {item.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setViewItem(item);
                        setShowViewModal(true);
                      }}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => {
                        setEditCategory({
                          id: item._id,
                          name: item.name,
                          image: item.image,
                          status: item.status,
                        });
                        setPreviewEditImage(item.image);
                        setShowEditModal(true);
                      }}
                      className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          {" "}
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await deleteItemCategory(selectedItem._id);

                    setCategories((prev) =>
                      prev.filter((item) => item._id !== selectedItem._id),
                    );

                    setShowDeleteModal(false);
                    setSelectedItem(null);

                    toast.success("Category deleted successfully");
                  } catch (error) {
                    console.error(error);
                    toast.error(error);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Category
            </h3>

            {/* Category Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                placeholder="Enter Category Name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>

            {/* Category Image */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category Image
              </label>

              {!previewImage ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition">
                  <span className="text-blue-600 font-medium">
                    + Choose File
                  </span>
                  <span className="text-gray-400 text-xs mt-1">
                    PNG, JPG up to 5MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewCategory({ ...newCategory, image: file });
                        setPreviewImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setPreviewImage(null);
                      setNewCategory({ ...newCategory, image: null });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategory({ name: "", image: null });
                  setPreviewImage(null);
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const formData = new FormData();
                    formData.append("name", newCategory.name);
                    formData.append("image", newCategory.image);

                    await createItemCategory(formData);

                    toast.success("Category created successfully");
                    setShowAddModal(false);
                    setNewCategory({ name: "", image: null });
                    setPreviewImage(null);
                    fetchCategories(); // List refresh karne ke liye
                  } catch (error) {
                    toast.error(error);
                  }
                }}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Edit Category
            </h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Category Name
              </label>
              <input
                type="text"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={editCategory.name}
                onChange={(e) =>
                  setEditCategory({ ...editCategory, name: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                className="w-full border rounded-xl px-4 py-3"
                value={editCategory.status}
                onChange={(e) =>
                  setEditCategory({
                    ...editCategory,
                    status: e.target.value === "true",
                  })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Category Image
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setEditCategory({ ...editCategory, image: file });
                  setPreviewEditImage(URL.createObjectURL(file));
                }}
              />
              {previewEditImage && (
                <img
                  src={previewEditImage}
                  className="w-20 h-20 mt-2 rounded object-cover"
                  alt="Preview"
                />
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const formData = new FormData();

                    formData.append("name", editCategory.name);
                    formData.append("status", editCategory.status);

                    if (editCategory.image instanceof File) {
                      formData.append("image", editCategory.image);
                    }

                    await updateItemCategory(editCategory.id, formData);

                    toast.success("Category updated successfully");

                    setShowEditModal(false);
                    fetchCategories();
                  } catch (error) {
                    toast.error(error);
                  }
                }}
                className="px-6 py-2 bg-yellow-500 text-white rounded-xl"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {showViewModal && viewItem && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold mb-4">Category Details</h3>

            <div className="flex flex-col items-center">
              <img
                src={viewItem.image}
                alt={viewItem.name}
                className="w-32 h-32 rounded-lg object-cover mb-4"
              />
              <h4 className="text-lg font-semibold">{viewItem.name}</h4>
              <p className="text-gray-500 text-sm mb-4">
                Status:{" "}
                <span
                  className={
                    viewItem.status
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {viewItem.status ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-bold">Sub Categories:</p>
              <p className="text-gray-600 text-sm">
                {viewItem.subCategory?.join(", ") || "No subcategories"}
              </p>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCategory;
