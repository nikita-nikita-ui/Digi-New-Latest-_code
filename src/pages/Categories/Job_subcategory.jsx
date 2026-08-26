import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  message,
  Tooltip,
  Modal,
  Select,
  Card,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  getCategoriesByType,
  updateJobCategory,
  createSubCategory,
  deleteSubCategory,
} from "../../auth/jobCategoryGetApi";

const { Option } = Select;

const getInitialFormData = () => ({
  name: "",
  parentCategoryId: "",
  status: true,
});

function JobSubcategory() {
  const [parentCategories, setParentCategories] = useState([]);
  const [subCategoriesData, setSubCategoriesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedParentFilter, setSelectedParentFilter] = useState("ALL");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  const fetchParentCategories = async () => {
    setLoading(true);
    try {
      let combined = [];
      if (jobTypeFilter === "ALL") {
        const [fullTimeRes, partTimeRes, localRes] = await Promise.all([
          getCategoriesByType("FULL_TIME_JOB"),
          getCategoriesByType("PART_TIME_JOB"),
          getCategoriesByType("LOCAL_JOB"),
        ]);

        const fullTimeData = fullTimeRes?.success ? fullTimeRes.data : [];
        const partTimeData = partTimeRes?.success ? partTimeRes.data : [];
        const localData = localRes?.success ? localRes.data : [];

        combined = [...fullTimeData, ...partTimeData, ...localData];
      } else {
        const response = await getCategoriesByType(jobTypeFilter);
        combined = response?.success ? response.data : [];
      }

      setParentCategories(combined);
      extractSubCategories(combined);
    } catch {
      message.error("Failed to load category data");
    } finally {
      setLoading(false);
    }
  };

  const extractSubCategories = (categories) => {
    const list = [];
    categories.forEach((cat) => {
      if (Array.isArray(cat.subCategory)) {
        cat.subCategory.forEach((sub, idx) => {
          list.push({
            id: `${cat._id}_${idx}_${sub}`,
            name: sub,
            parentCategoryId: cat._id,
            parentCategoryName: cat.name,
            parentCategoryType: cat.type,
            status: cat.status,
            createdAt: cat.createdAt,
          });
        });
      }
    });
    setSubCategoriesData(list);
  };

  useEffect(() => {
    fetchParentCategories();
  }, [jobTypeFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubCategory = async () => {
    if (!formData.name.trim() || !formData.parentCategoryId) {
      message.error("Please fill in all fields");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await createSubCategory({
        categoryId: formData.parentCategoryId,
        subCategoryName: formData.name.trim(),
      });

      if (response && response.success) {
        message.success("Sub-category added successfully!");
        await fetchParentCategories();
        setIsAddModalOpen(false);
        setFormData(getInitialFormData());
      } else {
        message.error("Failed to add sub-category");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      parentCategoryId: record.parentCategoryId,
      status: record.status,
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubCategoryInline = (record) => {
    setFormData({
      name: "",
      parentCategoryId: record.parentCategoryId,
      status: true,
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateSubCategory = async () => {
    if (!editingRecord) return;
    if (!formData.name.trim() || !formData.parentCategoryId) {
      message.error("Please fill in all fields");
      return;
    }

    setSubmitLoading(true);
    try {
      const oldParent = parentCategories.find(
        (c) => c._id === editingRecord.parentCategoryId,
      );

      if (oldParent) {
        const filteredSubs = Array.isArray(oldParent.subCategory)
          ? oldParent.subCategory.filter((sub) => sub !== editingRecord.name)
          : [];

        await updateJobCategory(oldParent._id, {
          name: oldParent.name,
          type: oldParent.type,
          image: oldParent.image,
          status: oldParent.status,
          subCategory: filteredSubs,
        });
      }

      const newParent = parentCategories.find(
        (c) => c._id === formData.parentCategoryId,
      );
      if (newParent) {
        const updatedSubs = Array.isArray(newParent.subCategory)
          ? [...newParent.subCategory, formData.name.trim()]
          : [formData.name.trim()];

        const response = await updateJobCategory(newParent._id, {
          name: newParent.name,
          type: newParent.type,
          image: newParent.image,
          status: newParent.status,
          subCategory: updatedSubs,
        });

        if (response && response.success) {
          message.success("Sub-category updated successfully!");
          await fetchParentCategories();
          setIsEditModalOpen(false);
          setEditingRecord(null);
          setFormData(getInitialFormData());
        } else {
          message.error("Failed to update sub-category");
        }
      }
    } catch {
      message.error("Something went wrong while updating");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClick = (record) => {
    Modal.confirm({
      centered: true,
      maskStyle: {
        backdropFilter: "blur(8px)",
      },
      title: "Confirm Deletion",
      content: `Are you sure you want to delete the sub-category "${record.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await deleteSubCategory({
            categoryId: record.parentCategoryId,
            subCategoryName: record.name,
            type: record.parentCategoryType,
          });

          if (response && response.success) {
            message.success("Sub-category deleted successfully!");
            await fetchParentCategories();
          } else {
            message.error("Failed to delete sub-category");
          }
        } catch {
          message.error("Something went wrong while deleting");
        }
      },
    });
  };

  const filteredSubs = subCategoriesData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesParent =
      selectedParentFilter === "ALL" ||
      item.parentCategoryId === selectedParentFilter;
    return matchesSearch && matchesParent;
  });

  const activeCount = filteredSubs.filter((item) => item.status).length;
  const inactiveCount = filteredSubs.filter((item) => !item.status).length;

  const columns = [
    {
      title: "SUB-CATEGORY NAME",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text) => (
        <span className="font-semibold text-gray-800 text-sm tracking-wide">
          {text}
        </span>
      ),
    },
    {
      title: "PARENT CATEGORY",
      dataIndex: "parentCategoryName",
      key: "parentCategoryName",
      width: "25%",
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700 text-sm">{text}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            {record.parentCategoryType?.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status) => (
        <Tag
          color={status ? "green" : "red"}
          className="rounded-full px-3 py-0.5 font-semibold text-xs uppercase border-none"
          style={{
            backgroundColor: status ? "#f0fdf4" : "#fef2f2",
            color: status ? "#15803d" : "#b91c1c",
          }}
        >
          {status ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "ACTIONS",
      key: "action",
      width: "25%",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Add Sub-category to this Parent">
            <Button
              type="text"
              shape="circle"
              className="hover:bg-emerald-50 transition-colors"
              icon={<PlusOutlined style={{ color: "#1d0331" }} />}
              onClick={() => handleAddSubCategoryInline(record)}
            />
          </Tooltip>

          <Tooltip title="Edit Sub-category">
            <Button
              type="text"
              shape="circle"
              className="hover:bg-indigo-50 transition-colors"
              icon={<EditOutlined style={{ color: "#2563eb" }} />}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>

          <Tooltip title="Delete Sub-category">
            <Button
              type="text"
              shape="circle"
              className="hover:bg-red-50 transition-colors"
              icon={<DeleteOutlined style={{ color: "#dc2626" }} />}
              onClick={() => handleDeleteClick(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end"></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider m-0">
                Total Sub-categories
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 mb-0">
                {filteredSubs.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold">
              {filteredSubs.length}
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider m-0">
                Active Items
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1 mb-0">
                {activeCount}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircleOutlined className="text-lg" />
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider m-0">
                Inactive Items
              </p>
              <h3 className="text-2xl font-black text-red-500 mt-1 mb-0">
                {inactiveCount}
              </h3>
            </div>
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <CloseCircleOutlined className="text-lg" />
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="w-full lg:max-w-xs">
            <Input
              placeholder="Search sub-categories..."
              prefix={<SearchOutlined className="text-slate-400 mr-2" />}
              size="large"
              className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)] transition-all h-11"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Job Type:
              </span>
              <Select
                value={jobTypeFilter}
                onChange={(value) => {
                  setJobTypeFilter(value);
                  setSelectedParentFilter("ALL");
                }}
                className="w-full sm:w-[180px]"
                size="large"
                dropdownStyle={{ borderRadius: "12px", padding: "4px" }}
              >
                <Option value="ALL">All Types</Option>
                <Option value="LOCAL_JOB">Local Job</Option>
                <Option value="PART_TIME_JOB">Part Time Job</Option>
                <Option value="FULL_TIME_JOB">Full Time Job</Option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Parent Category:
              </span>
              <Select
                value={selectedParentFilter}
                onChange={(value) => setSelectedParentFilter(value)}
                className="w-full sm:w-[180px]"
                size="large"
                dropdownStyle={{ borderRadius: "12px", padding: "4px" }}
              >
                <Option value="ALL">All Categories</Option>
                {parentCategories.map((cat) => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          <Table
            columns={columns}
            dataSource={filteredSubs}
            loading={loading}
            rowKey={(record) => record.id}
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
              className: "px-6 py-4 border-t border-slate-50",
            }}
            rowClassName="hover:bg-slate-50/50 transition-colors"
          />
        </div>
      </div>

      <Modal
        maskStyle={{
          backdropFilter: "blur(12px)",
          background: "rgba(0,0,0,0.5)",
        }}
        styles={{
          content: {
            borderRadius: "24px",
            padding: "0",
            overflow: "visible",
          },
          body: {
            padding: "24px",
          },
        }}
        title={
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-6 py-5 -mx-6 -mt-5 mb-2 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <PlusOutlined className="text-white text-xl" />
              </div>

              <div>
                <h2 className="text-white text-xl font-bold m-0">
                  Add New Sub-category
                </h2>
                <p className="text-purple-100 text-xs m-0">
                  Create and manage your sub-categories
                </p>
              </div>
            </div>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            type="text"
            className="font-semibold text-slate-500 hover:text-slate-700 h-10 px-5 rounded-lg"
            onClick={() => setIsAddModalOpen(false)}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={handleAddSubCategory}
            className="bg-blue-600 hover:bg-blue-700 transition-colors h-10 px-6 rounded-lg font-semibold border-none"
          >
            Create Sub-category
          </Button>,
        ]}
        width={550}
        centered
      >
        <div className="py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Sub-category Name
            </label>
            <Input
              placeholder="e.g. Cardiologist"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="rounded-lg h-10 border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Parent Category
            </label>
            <Select
              className="w-full"
              size="large"
              placeholder="✨ Select Parent Category"
              value={formData.parentCategoryId || undefined}
              onChange={(val) => handleSelectChange("parentCategoryId", val)}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              getPopupContainer={() => document.body}
              listHeight={250}
              showSearch
              optionFilterProp="children"
              dropdownStyle={{
                borderRadius: "16px",
                padding: "8px",
                background: "#ffffff",
                boxShadow: "0 12px 35px rgba(99,102,241,0.18)",
                border: "1px solid #e2e8f0",
              }}
              style={{
                height: "46px",
              }}
            >
              {parentCategories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name} ({cat.type?.replace("_", " ")})
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      <Modal
        centered
        width={600}
        destroyOnClose
        maskStyle={{
          backdropFilter: "blur(12px)",
          background: "rgba(0,0,0,0.9)",
        }}
        styles={{
          content: {
            borderRadius: "24px",
            padding: "0",
            overflow: "visible",
          },
          body: {
            padding: "24px",
          },
        }}
        title={
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 -mx-6 -mt-5 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <PlusOutlined className="text-white text-xl" />
              </div>

              <div>
                <h2 className="text-white text-xl font-bold m-0">
                  Edit Sub-category
                </h2>
                <p className="text-blue-100 text-xs m-0">
                  Create and manage your sub-categories
                </p>
              </div>
            </div>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            type="text"
            className="font-semibold text-slate-500 hover:text-slate-700 h-10 px-5 rounded-lg"
            onClick={() => setIsEditModalOpen(false)}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={handleUpdateSubCategory}
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors h-10 px-6 rounded-lg font-semibold border-none"
          >
            Save Changes
          </Button>,
        ]}
      >
        <div className="py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Sub-category Name
            </label>
            <Input
              placeholder="Sub-category Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="rounded-lg h-10 border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Parent Category
            </label>
            <Select
              className="w-full"
              size="large"
              placeholder="✨ Select Parent Category"
              value={formData.parentCategoryId || undefined}
              onChange={(val) => handleSelectChange("parentCategoryId", val)}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              listHeight={250}
              showSearch
              getPopupContainer={() => document.body}
              optionFilterProp="children"
              dropdownStyle={{
                borderRadius: "16px",
                padding: "8px",
                background: "#ffffff",
                boxShadow: "0 12px 35px rgba(59,130,246,0.18)",
                border: "1px solid #e2e8f0",
                maxHeight: "250px",
                overflowY: "auto",
              }}
              style={{
                height: "46px",
              }}
            >
              {parentCategories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name} ({cat.type?.replace("_", " ")})
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default JobSubcategory;
