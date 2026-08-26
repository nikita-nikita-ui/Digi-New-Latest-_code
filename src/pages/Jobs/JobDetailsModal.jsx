import React from "react";
import { X, MapPin, Building2, IndianRupee, Briefcase, GraduationCap, Users, Star, Info, PhoneCall, Calendar } from "lucide-react";

// Component name renamed to JobViewModal to match your PartTimeJobs.jsx import
const JobViewModal = ({ isOpen, onClose, job, loading }) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Full Job Details</h2>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">ID: {job?._id || "Loading..."}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold">Loading detailed information...</p>
                        </div>
                    ) : job ? (
                        <div className="space-y-6">

                            {/* Main Title Card */}
                            <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <img
                                    src={job.images?.[0] || "https://placehold.co/100"}
                                    alt="Job"
                                    className="w-20 h-20 rounded-xl object-cover bg-white shadow-md border-2 border-white"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${job.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {job.status}
                                        </span>
                                        {job.isFeatured && (
                                            <span className="bg-amber-400 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                                                <Star size={10} fill="currentColor" /> Featured
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{job.title}</h3>
                                    <p className="text-indigo-600 font-bold flex items-center gap-1">
                                        <Building2 size={14} /> {job.companyName || "No Company Name Provided"}
                                    </p>
                                </div>
                            </div>

                            {/* Detail Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailItem icon={<Briefcase size={18} />} label="Work Type / Role" value={job.workType || job.jobRole} />
                                <DetailItem icon={<IndianRupee size={18} />} label="Salary Range" value={`₹${job.salaryRange?.min} - ₹${job.salaryRange?.max}`} />
                                <DetailItem icon={<Users size={18} />} label="Vacancies" value={`${job.vacancies || 0} Openings`} />
                                <DetailItem icon={<GraduationCap size={18} />} label="Min. Qualification" value={job.qualification} />
                                <DetailItem icon={<MapPin size={18} />} label="Job Location" value={job.location} />
                                <DetailItem icon={<PhoneCall size={18} />} label="Preferred Contact" value={job.preferredCommunication?.join(", ") || "N/A"} />
                            </div>

                            {/* About the Job */}
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                    <Info size={16} className="text-blue-500" /> Job Description
                                </h4>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {job.details || "No detailed description provided by the poster."}
                                </div>
                            </div>

                            {/* Image Gallery */}
                            {job.images?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Post Gallery ({job.images.length})</h4>
                                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                        {job.images.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noreferrer" className="shrink-0">
                                                <img src={img} className="h-24 w-36 object-cover rounded-xl border-2 border-slate-100 hover:border-blue-400 transition-all shadow-sm bg-slate-100" alt="Job visual" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Footer Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                                <FooterStat label="Total Unlocks" value={job.unlockCount || 0} />
                                <FooterStat label="Posted Date" value={formatDate(job.createdAt)} />
                                <FooterStat label="Expiry Date" value={formatDate(job.expiresAt)} color="text-red-600" />
                                <FooterStat label="User Role" value={job.userId?.role || "USER"} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400 font-bold">No Data Found for this ID.</div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <p className="text-[10px] text-slate-400 font-medium">Last Updated: {formatDate(job?.updatedAt)}</p>
                    <button
                        onClick={onClose}
                        className="px-10 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        Close Preview
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
        <div className="mt-0.5 text-blue-600 bg-blue-50 p-2 rounded-lg shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-800 break-words">{value || "Not Specified"}</p>
        </div>
    </div>
);

const FooterStat = ({ label, value, color = "text-slate-800" }) => (
    <div>
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
        <p className={`text-xs font-bold ${color}`}>{value}</p>
    </div>
);


export default JobViewModal;