import React, { useState, useRef } from "react";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createBanner } from "../../auth/banner";

const CreateBannerModal = ({ isOpen, onClose, onSave }) => {
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bannerType: "",
  });
  if (!isOpen) return null;
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.bannerType) {
      toast.error("Banner Type is required");
      return;
    }

    try {
      setLoading(true);
      const bannerData = new FormData();

      bannerData.append("name", formData.name);
      bannerData.append("bannerType", formData.bannerType);
      bannerData.append("image", imageFile);

      const data = await createBanner(bannerData);
      toast.success("Banner created successfully");
      setFormData({
        name: "",
        bannerType: "",
      });
      setImageFile(null);
      if (onSave) onSave(data);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
        <div className="sticky top-0 bg-purple/95 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PlusCircleIcon size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Publish New Banner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ImageIcon size={14} /> Banner Image*
            </label>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 flex flex-col items-center justify-center transition-all duration-200">
              {imageFile ? (
                <>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="absolute top-3 right-3 bg-white/90 text-rose-500 rounded-full p-1.5 shadow-sm backdrop-blur-sm"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors duration-200"
                >
                  <Upload size={24} />
                  <span className="text-xs font-semibold">
                    Upload Banner File
                  </span>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label>Name*</label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
              />
            </div>

            <div className="w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="w-full">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Banner Type*
                </label>

                <select
                  value={formData.bannerType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bannerType: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs"
                >
                  <option value="">Select Banner Type</option>
                  <option value="FIRST">FIRST</option>
                  <option value="SECOND">SECOND</option>
                  <option value="THIRD">THIRD</option>
                  <option value="FOURTH">FOURTH</option>
                  <option value="FIFTH">FIFTH</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-2 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Publish Banner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlusCircleIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export default CreateBannerModal;
