import React, { useState, useEffect } from "react";
// Trash2 icon add kiya hai yahan
import { CheckCircle, AlertCircle, Upload, Pencil, ImageIcon, Loader2, Type, FileText, Trash2 } from 'lucide-react';
// deleteBusinessServiceAPI import karein
import { updateBusinessServiceAPI, deleteBusinessServiceAPI } from "../../auth/adminLogin"; 

const ServiceEditForm = ({ serviceData, shopId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    serviceTitle: serviceData?.serviceTitle || "",
    serviceDetails: serviceData?.serviceDetails || ""
  });
  
  const [serviceImage, setServiceImage] = useState(null);
  const [preview, setPreview] = useState(serviceData?.serviceImages?.[0] || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Delete ke liye alag loading state
  const [feedback, setFeedback] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    return () => {
      if (preview && preview !== serviceData?.serviceImages?.[0]) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, serviceData]);

  const showPopupMessage = (message, type = "success") => {
    setFeedback({ show: true, message, type });
    if (type === 'success') {
        setTimeout(() => {
            setFeedback({ show: false, message: "", type: "success" });
            if (onSuccess) onSuccess();
        }, 1500);
    } else {
        setTimeout(() => setFeedback({ show: false, message: "", type: "success" }), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      const data = new FormData();
      data.append('serviceTitle', formData.serviceTitle);
      data.append('serviceDetails', formData.serviceDetails);
      if (serviceImage) {
          data.append('serviceImage', serviceImage);
      }
      try {
          const response = await updateBusinessServiceAPI(shopId, serviceData._id, data);
          if (response) {
              showPopupMessage("Service Updated Successfully!", "success");
          }
      } catch (error) {
          const errorMsg = error.message || "Failed to update service";
          showPopupMessage(errorMsg, "error");
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- DELETE FUNCTION START ---
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this service?")) {
        setIsDeleting(true);
        try {
            const response = await deleteBusinessServiceAPI(shopId, serviceData._id);
            if (response) {
                showPopupMessage("Service Deleted Successfully!", "success");
            }
        } catch (error) {
            const errorMsg = error.message || "Failed to delete service";
            showPopupMessage(errorMsg, "error");
        } finally {
            setIsDeleting(false);
        }
    }
  };
  // --- DELETE FUNCTION END ---

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative min-h-[300px]">
        {/* Feedback Overlays */}
        {feedback.show && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-white/30 rounded-3xl">
                <div className={`flex flex-col items-center gap-3 px-8 py-6 rounded-2xl shadow-2xl transform scale-110 border ${feedback.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
                    <div className="text-center">
                        <h4 className="text-xl font-black uppercase tracking-wide">{feedback.type === 'success' ? 'Success' : 'Error'}</h4>
                        <p className="text-sm font-bold opacity-90 mt-1">{feedback.message}</p>
                    </div>
                </div>
            </div>
        )}

        {(isSubmitting || isDeleting) && !feedback.show && (
            <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <Type size={12} /> Service Title
                    </label>
                    <input 
                        type="text" 
                        name="serviceTitle" 
                        value={formData.serviceTitle} 
                        onChange={handleInputChange} 
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all" 
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <FileText size={12} /> Service Details
                    </label>
                    <textarea 
                        name="serviceDetails" 
                        value={formData.serviceDetails} 
                        onChange={handleInputChange} 
                        required
                        rows="5"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all resize-none" 
                    ></textarea>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <ImageIcon size={12} /> Service Image
                </label>
                <div className="w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative overflow-hidden group">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={40} />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-indigo-50">
                            <Upload size={14} /> Change Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            {/* Delete Button */}
            <button 
                type="button" 
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase"
            >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Service
            </button>

            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase">Cancel</button>
                <button type="submit" disabled={isSubmitting || isDeleting} className="px-8 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all uppercase flex items-center gap-2">
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />} Update Service
                </button>
            </div>
        </div>
    </form>
  );
};

export default ServiceEditForm;