import React, { useState } from "react";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ItemSubCategory() {
  const [type, setType] = useState("subcategory");
  const navigate = useNavigate();

  const dummyData = [
    {
      id: 1,
      category: "Electronics",
      subcategory: "Mobile Phones",
      status: "Active",
    },
    {
      id: 2,
      category: "Electronics",
      subcategory: "Laptops",
      status: "Active",
    },
    {
      id: 3,
      category: "Fashion",
      subcategory: "Men's Clothing",
      status: "Active",
    },
    {
      id: 4,
      category: "Fashion",
      subcategory: "Women's Clothing",
      status: "Inactive",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Item Sub Categories
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={type}
            onChange={(e) => {
              const value = e.target.value;
              setType(value);
              if (value === "category") navigate("/cat-item");
              if (value === "subcategory") navigate("/subcat-item");
            }}
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="category">Category</option>
            <option value="subcategory">Subcategory</option>
          </select>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition">
            <PlusCircle size={18} />
            Add Subcategory
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">
          Selected Dropdown Value
        </h3>
        <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          {type === "category" ? "Category" : "Subcategory"}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-gray-600 font-semibold text-sm border-b border-gray-100">
                Category
              </th>
              <th className="text-left p-4 text-gray-600 font-semibold text-sm border-b border-gray-100">
                Subcategory
              </th>
              <th className="text-left p-4 text-gray-600 font-semibold text-sm border-b border-gray-100">
                Status
              </th>
              <th className="text-right p-4 text-gray-600 font-semibold text-sm border-b border-gray-100">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {dummyData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium text-gray-800">
                  {item.category}
                </td>
                <td className="p-4 text-gray-600">{item.subcategory}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
