import { useEffect, useState } from "react";
import {
  CreditCard,
  History,
  PlusCircle,
  MinusCircle,
  Calendar,
  Tag,
  Eye,
  Edit3,
  Trash2,
  BarChart3,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Coins,
  DollarSign,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllPlans,
  deletePlanAPI,
  updatePlanAPI,
  createPlanAPI,
  searchPlanAPI,
} from "../../auth/credit";

const Credits = () => {
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    credits: "",
    description: "",
  });
  const [createForm, setCreateForm] = useState({
    planId: "",
    name: "",
    price: "",
    credits: "",
    category: "SUBSCRIPTION",
    dropdownOpen: false,
    description: "",
  });
  useEffect(() => {
    fetchPlans(1);
  }, []);

  const fetchPlans = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllPlans(page, limit);
      setPlans(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setCurrentPage(res?.pagination?.currentPage || page);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    try {
      setSearchTerm(value);
      if (!value.trim()) {
        fetchPlans();
        return;
      }
      const res = await searchPlanAPI(value);
      setPlans(res?.data || []);
    } catch (err) {
      console.log(err);
      setPlans([]);
    }
  };

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "",
    data: null,
  });

  const openModal = (type, data) => {
    if (type === "edit") {
      setEditForm({
        name: data?.name || "",
        price: data?.price || "",
        credits: data?.credits || "",
        description: data?.description || "",
      });
    }
    setModalConfig({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: "", data: null });
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      CREDIT: "bg-indigo-50 text-indigo-600 border-indigo-100/50",
      SUBSCRIPTION: "bg-purple-50 text-purple-600 border-purple-100/50",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
          styles[status] || "bg-slate-50 text-slate-500 border-slate-100"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafbfe] p-4 md:p-8 text-slate-800 font-sans m-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-17 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Admin Credits Dashboard
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage your listing parameters, credit plans, and pricing structures
          </p>
        </div>
      </div>

      {activeTab === "plans" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                placeholder="Search plan by identifier ID..."
              />
            </div>
            <button
              onClick={() => openModal("create")}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-3 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlusCircle size={15} />
              Create New Plan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-14 text-center">
                    S.No.
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Plan ID
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Plan Title
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Allocated Credits
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Brief Description
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-16 text-center">
                      <Loader2
                        className="animate-spin mx-auto text-indigo-600"
                        size={24}
                      />
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-16 text-center text-slate-400 text-xs"
                    >
                      No plans configured currently
                    </td>
                  </tr>
                ) : (
                  plans.map((plan, index) => (
                    <tr
                      key={plan._id}
                      className="hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="p-4 text-xs font-semibold text-slate-400 text-center">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-500 font-mono tracking-tight">
                        {plan.planId}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-700">
                        {plan.name}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={plan.category} />
                      </td>
                      <td className="p-4 text-xs font-bold text-emerald-600">
                        ₹{plan.price}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Coins size={12} className="text-amber-500" />
                          <span>{plan.credits}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-400 max-w-xs truncate">
                        {plan.description}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => openModal("view", plan)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-indigo-100 bg-indigo-50/70 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-150"
                          >
                            <Eye size={11} /> View
                          </button>
                          <button
                            onClick={() => openModal("edit", plan)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white hover:border-transparent transition-all duration-150"
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                          <button
                            onClick={() => openModal("delete", plan)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-rose-100 bg-rose-50/70 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-transparent transition-all duration-150"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchPlans(currentPage - 1)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg transition-all duration-150"
            >
              Previous
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchPlans(i + 1)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 border ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white border-transparent shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchPlans(currentPage + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-lg transition-all duration-150"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modalConfig.isOpen && modalConfig.type === "delete" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Confirm Plan Deletion
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Are you sure you want to remove plan{" "}
              <strong>{modalConfig.data?.name}</strong>?
            </p>

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl font-semibold text-xs transition-colors duration-150 bg-white"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await deletePlanAPI(modalConfig.data?.planId);
                    setPlans((prev) =>
                      prev.filter((p) => p.planId !== modalConfig.data?.planId),
                    );
                    closeModal();
                  } catch (err) {
                    console.log("Delete failed:", err);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors duration-150"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfig.isOpen && modalConfig.type === "edit" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0 bg- via-gray-600 text-white z-10 flex items-center justify-between px-6 py-4 border-b border-indigo-500 shadow-lg">
              {" "}
              <h2 className="text-lg font-bold text-slate-800">
                Edit Credit Plan
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-800 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={editForm.credits}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        credits: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-4 pb-4 px-6 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const payload = {
                      name: editForm.name,
                      price: Number(editForm.price),
                      credits: Number(editForm.credits),
                      description: editForm.description,
                    };
                    await updatePlanAPI(modalConfig.data.planId, payload);
                    closeModal();
                    fetchPlans();
                  } catch (err) {
                    console.log(err);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 shadow-sm"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfig.isOpen && modalConfig.type === "view" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0 bg-gray-200 text-black z-10 flex items-center justify-between px-6 py-4 border-b border-indigo-500 shadow-lg">
              {" "}
              <h2 className="text-lg font-bold text-black"> Plan Overview</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray text-red rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
                <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider mb-1">
                  Plan Identifier ID
                </p>
                <h3 className="text-2xl font-mono font-semibold tracking-tight">
                  {modalConfig.data?.planId}
                </h3>
                <div className="flex gap-2 mt-4">
                  <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border border-white/5">
                    {modalConfig.data?.category}
                  </span>
                  <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border border-white/5 flex items-center gap-1">
                    <Coins size={10} className="text-amber-300" />
                    {modalConfig.data?.credits} Credits
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Plan Title
                  </p>
                  <p className="font-semibold text-xs text-slate-700">
                    {modalConfig.data?.name}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Cost Structure
                  </p>
                  <p className="font-bold text-sm text-emerald-600">
                    ₹{modalConfig.data?.price}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">
                  Description details
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {modalConfig.data?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Created At
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {new Date(modalConfig.data?.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Updated At
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {new Date(modalConfig.data?.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all duration-200"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfig.isOpen && modalConfig.type === "create" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 animate-scaleUp border border-slate-100">
            <div className="sticky top-0 bg-gray-200 text-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-500 shadow-lg">
              <h2 className="text-lg font-bold text-slate-800">
                Create Premium Plan
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-full transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Unique Plan ID (e.g. STARTER_SUB)"
                value={createForm.planId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, planId: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
              />

              <input
                type="text"
                placeholder="Plan Display Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={createForm.price}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, price: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                />

                <input
                  type="number"
                  placeholder="Credits amount"
                  value={createForm.credits}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, credits: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setCreateForm({
                      ...createForm,
                      dropdownOpen: !createForm.dropdownOpen,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium flex justify-between items-center"
                >
                  {createForm.category}
                  <span>▼</span>
                </button>

                {createForm.dropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setCreateForm({
                          ...createForm,
                          category: "SUBSCRIPTION",
                          dropdownOpen: false,
                        })
                      }
                      className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-50"
                    >
                      SUBSCRIPTION
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCreateForm({
                          ...createForm,
                          category: "CREDIT",
                          dropdownOpen: false,
                        })
                      }
                      className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-50"
                    >
                      CREDIT
                    </button>
                  </div>
                )}
              </div>

              <textarea
                placeholder="Plan description details..."
                rows="4"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    description: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 resize-none"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const payload = {
                      planId: createForm.planId,
                      name: createForm.name,
                      price: Number(createForm.price),
                      credits: Number(createForm.credits),
                      category: createForm.category,
                      description: createForm.description,
                    };
                    await createPlanAPI(payload);
                    toast.success("Plan created successfully!");
                    setCreateForm({
                      planId: "",
                      name: "",
                      price: "",
                      credits: "",
                      category: "SUBSCRIPTION",
                      description: "",
                    });
                    closeModal();
                    fetchPlans();
                  } catch (err) {
                    console.log("Create Plan Error:", err);
                    toast.error("Failed to create plan!");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 shadow-sm"
              >
                Create Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits;
