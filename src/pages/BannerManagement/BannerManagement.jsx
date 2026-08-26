import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Trash2,
  PlusCircle,
  Loader2,
  Eye,
  Upload,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CreateBannerModal from "../BannerManagement/CreateBannerModal";
import {
  getBanners,
  updateBanner,
  deleteBanner,
  getBannerById,
  searchBanners,
} from "../../auth/banner";

const BannerViewModal = ({ isOpen, onClose, banner }) => {
  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Banner Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
            <img
              src={banner.imageUrl || "https://placehold.co/600x300"}
              alt={banner.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Position: {banner.position}
              </span>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight mt-2">
                {banner.name}
              </h1>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Description</span>
                <span className="text-slate-700 font-semibold">
                  {banner.description}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Status (isActive)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                    banner.isActive === "true" || banner.isActive === true
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {banner.isActive === "true" || banner.isActive === true
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all duration-200"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerIdToDelete, setBannerIdToDelete] = useState(null);
  const editFileInputRef = useRef(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await getBanners();
      setBanners(response.data?.banners || []);
    } catch (error) {
      toast.error(error.message || "Failed to retrieve banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        fetchBanners();
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const response = await searchBanners(query);
      setBanners(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to search banners");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (id) => {
    try {
      const response = await getBannerById(id);
      setSelectedBanner(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error(error.message || "Failed to load banner details");
    }
  };

  const handleEditClick = async (id) => {
    try {
      const response = await getBannerById(id);
      setSelectedBanner(response.data);
      setIsEditModalOpen(true);
    } catch (error) {
      toast.error(error.message || "Failed to load banner details");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedBanner((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
        newImageFile: file,
      }));
    }
  };

  const saveNewBanner = () => {
    fetchBanners();
  };

  const handleUpdateBanner = async () => {
    if (!selectedBanner.name.trim())
      return toast.error("Banner Title is required");

    setSaveLoading(true);
    try {
      await updateBanner(selectedBanner._id, {
        image: selectedBanner.newImageFile,
        name: selectedBanner.name,
        bannerType: selectedBanner.bannerType,
      });
      toast.success("Banner updated successfully");
      setIsEditModalOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.message || "Failed to update banner");
    } finally {
      setSaveLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteBanner(bannerIdToDelete);
      toast.success("Banner deleted successfully");
      setIsDeleteModalOpen(false);
      setBannerIdToDelete(null);
      fetchBanners();
    } catch (error) {
      toast.error(error.message || "Failed to delete banner");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#fafbfe] min-h-screen font-sans m-4">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Banner Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Publish and manage active banners on system modules
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex items-center gap-2"
        >
          <PlusCircle size={15} />
          Publish New Banner
        </button>
      </div>

      <div className="flex justify-start mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search banners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-14 text-center">
                  S.No
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Banner Info
                </th>

                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-16 text-center text-slate-400 text-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        className="animate-spin text-indigo-600"
                        size={20}
                      />
                      Loading banners...
                    </div>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-16 text-center text-slate-400 text-sm"
                  >
                    No active banners found
                  </td>
                </tr>
              ) : (
                banners.map((banner, idx) => (
                  <tr
                    key={banner._id}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="p-4 text-xs font-semibold text-slate-400 text-center">
                      {idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={banner.imageUrl}
                          className="w-16 h-10 rounded-lg object-cover border border-slate-100 bg-slate-50 flex-shrink-0"
                          alt="banner"
                        />
                        <div className="font-semibold text-slate-700 text-sm leading-tight">
                          {banner.name}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                          banner.isActive === "true" || banner.isActive === true
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {banner.isActive === "true" || banner.isActive === true
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleViewClick(banner._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-indigo-100 bg-indigo-50/75 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-150"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() => handleEditClick(banner._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-5 text-slate-600 hover:bg-slate-800 hover:text-white transition-all duration-150"
                        >
                          <PlusCircle size={12} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setBannerIdToDelete(banner._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-rose-100 bg-rose-50/70 text-rose-600 hover:bg-rose-500 hover:text-white transition-all duration-150"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateBannerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={saveNewBanner}
      />

      {isEditModalOpen && selectedBanner && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0  bg-gradient-to-r from-purple-500 via-purple-300 to-purple-500 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Edit Banner Settings
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ImageIcon size={14} /> Banner Image
                </label>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <img
                    src={selectedBanner.imageUrl}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current.click()}
                    className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all duration-150"
                  >
                    <Upload size={11} /> Replace Image
                  </button>
                </div>
                <input
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Name{" "}
                  </label>
                  <input
                    type="text"
                    value={selectedBanner.name}
                    onChange={(e) =>
                      setSelectedBanner({
                        ...selectedBanner,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-2 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBanner}
                  disabled={saveLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
                >
                  {saveLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BannerViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        banner={selectedBanner}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Delete Banner?
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              This will immediately remove the banner advertisement
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl font-semibold text-xs transition-colors duration-150 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
