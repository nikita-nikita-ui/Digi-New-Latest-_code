import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  message,
  Avatar,
  Tooltip,
  Modal,
  Select,
  Row,
  Col,
  Card,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  FolderOutlined,
  PictureOutlined,
  SolutionOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getCategoriesByType,
  createJobCategory,
  deleteJobCategory,
  updateJobCategory,
  searchJobCategories,
} from "../../auth/jobCategoryService";
import JobSubcategory from "./Job_subcategory";

const { Option } = Select;

const jobTypes = [
  {
    value: "FULL_TIME_JOB",
    label: "Full-Time Job",
    icon: <SolutionOutlined />,
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    value: "PART_TIME_JOB",
    label: "Part-Time Job",
    icon: <ClockCircleOutlined />,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    value: "LOCAL_JOB",
    label: "Local Job",
    icon: <EnvironmentOutlined />,
    color: "#10b981",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
];

const getJobTypeDetails = (type) => {
  return (
    jobTypes.find((t) => t.value === type) || {
      value: type,
      label: type,
      icon: <FolderOutlined />,
      color: "#6b7280",
      bg: "#f3f4f6",
      border: "#e5e7eb",
    }
  );
};

const getInitialFormData = () => ({
  name: "",
  type: "FULL_TIME_JOB",
  image: null,
  subCategory: "",
  status: true,
});

function Job_category() {
  const [currentView, setCurrentView] = useState("CATEGORIES");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("FULL_TIME_JOB");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [tempUrl, setTempUrl] = useState("");

  const fetchCategories = async (type, query = "") => {
    setLoading(true);
    try {
      let response;
      if (query.trim() !== "") {
        response = await searchJobCategories(query, type);
      } else {
        response = await getCategoriesByType(type);
      }
      if (response && response.success) {
        setData(response.data || []);
      } else {
        setData([]);
      }
    } catch (error) {
      message.error(error.message || "Failed to load categories");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === "CATEGORIES") {
      const delayDebounceFn = setTimeout(() => {
        fetchCategories(selectedType, searchText);
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [selectedType, searchText, currentView]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setTempUrl(URL.createObjectURL(file));
    }
  };

  const handlePostCategory = async () => {
    const requiredFields = ["name", "type", "image"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        message.error(`Please fill in the required field: ${field}`);
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const response = await createJobCategory({
        name: formData.name,
        type: formData.type,
        image: formData.image,
      });

      if (response && response.success) {
        message.success("Job Category added successfully!");
        fetchCategories(selectedType, searchText);
        setIsAddModalOpen(false);
        setFormData(getInitialFormData());
        setTempUrl("");
      } else {
        message.error(response?.message || "Failed to create category");
      }
    } catch (error) {
      message.error(error.message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
    setTempUrl(record.image);
    setFormData({
      name: record.name,
      type: record.type,
      image: record.image,
      subCategory: Array.isArray(record.subCategory)
        ? record.subCategory.join(", ")
        : "",
      status: record.status,
    });
  };

  const handleUpdateCategory = async () => {
    if (!editingRecord) return;

    const requiredFields = ["name", "type", "image"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        message.error(`Please fill in the required field: ${field}`);
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const response = await updateJobCategory(editingRecord._id, {
        name: formData.name,
        type: formData.type,
        image: formData.image,
        status: formData.status,
      });

      if (response && response.success) {
        message.success("Job Category updated successfully!");
        fetchCategories(selectedType, searchText);
        setIsEditModalOpen(false);
        setTempUrl("");
      } else {
        message.error(response?.message || "Failed to update category");
      }
    } catch (error) {
      message.error(error.message || "Something went wrong while updating");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this job category?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await deleteJobCategory(id);
          if (response && response.success) {
            message.success("Job Category deleted successfully!");
            fetchCategories(selectedType, searchText);
          } else {
            message.error(response?.message || "Failed to delete category");
          }
        } catch (error) {
          message.error(error.message || "Something went wrong while deleting");
        }
      },
    });
  };

  const handleViewClick = (record) => {
    setViewingData(record);
    setIsViewModalOpen(true);
  };

  const filteredData = data;
  const activeCount = filteredData.filter((item) => item.status).length;
  const inactiveCount = filteredData.filter((item) => !item.status).length;

  const columns = [
    {
      title: "CATEGORY DETAILS",
      key: "category",
      width: "35%",
      render: (_, record) => (
        <Space size="middle" className="transition-all duration-300">
          <Avatar
            shape="square"
            size={52}
            src={record.image}
            icon={<FolderOutlined />}
            className="shadow-sm border border-gray-100 rounded-lg flex-shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm tracking-wide">
              {record.name}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "JOB TYPE",
      dataIndex: "type",
      key: "type",
      width: "20%",
      render: (type) => {
        const details = getJobTypeDetails(type);
        return (
          <Tag
            icon={details.icon}
            style={{
              color: details.color,
              backgroundColor: details.bg,
              borderColor: details.border,
              fontWeight: "600",
              borderRadius: "6px",
              padding: "4px 10px",
            }}
          >
            {details.label}
          </Tag>
        );
      },
    },
    {
      title: "SUB-CATEGORIES",
      dataIndex: "subCategory",
      key: "subCategory",
      width: "20%",
      render: (subCategory) => {
        if (!subCategory || subCategory.length === 0) {
          return <span className="text-gray-400 text-sm italic">None</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {subCategory.map((sub, index) => (
              <Tag
                key={index}
                color="purple"
                className="m-0 text-xs rounded border-purple-100 font-medium"
              >
                {sub}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => {
        return (
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
        );
      },
    },
    {
      title: "ACTIONS",
      key: "action",
      width: "13%",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              shape="circle"
              className="hover:bg-blue-50 transition-colors"
              icon={<EyeOutlined className="text-blue-500" />}
              onClick={() => handleViewClick(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Category">
            <Button
              type="text"
              shape="circle"
              className="hover:bg-indigo-50 transition-colors"
              icon={<EditOutlined className="text-indigo-500" />}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Category">
            <Button
              type="text"
              shape="circle"
              className="hover:bg-red-50 transition-colors"
              icon={<DeleteOutlined className="text-red-500" />}
              onClick={() => handleDeleteClick(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderCleanImageSection = () => {
    const hasImage = formData.image;

    return (
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Category Image
        </label>

        {hasImage ? (
          <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden border border-slate-100 shadow-sm group bg-slate-50">
            <img
              src={
                typeof formData.image === "string" ? formData.image : tempUrl
              }
              alt="Category Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <label className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 font-semibold text-white text-xs px-4 h-9 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                <CameraOutlined />
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <Button
                type="primary"
                danger
                shape="circle"
                className="h-9 w-9 flex items-center justify-center"
                icon={<DeleteOutlined />}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: null }));
                  setTempUrl("");
                }}
              />
            </div>
          </div>
        ) : (
          <label className="w-full max-w-sm h-48 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer transition-all duration-300 group">
            <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
              <PictureOutlined className="text-2xl" />
            </div>
            <span className="text-xs font-bold text-slate-500 mt-3 group-hover:text-blue-600">
              Add Category Image
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Click to select an image file
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <AppstoreOutlined className="text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 m-0 tracking-tight">
                  Job Classifications
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Manage categories and sub-categories for listings
                </p>
              </div>
            </div>

            <div className="sm:ml-4">
              <Select
                value={currentView}
                onChange={(val) => setCurrentView(val)}
                className="w-48"
                size="large"
                dropdownStyle={{ borderRadius: "12px" }}
              >
                <Option value="CATEGORIES">Categories</Option>
                <Option value="SUB_CATEGORIES">Sub-categories</Option>
              </Select>
            </div>
          </div>

          {currentView === "CATEGORIES" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all border-none shadow-md shadow-blue-100 font-semibold text-sm px-6 h-11 rounded-xl flex items-center gap-2"
              onClick={() => {
                setEditingRecord(null);
                setFormData({
                  ...getInitialFormData(),
                  type: selectedType,
                });
                setTempUrl("");
                setIsAddModalOpen(true);
              }}
            >
              Add Job Category
            </Button>
          )}
        </div>

        {currentView === "SUB_CATEGORIES" ? (
          <JobSubcategory />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="shadow-sm border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider m-0">
                      Total Items
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1 mb-0">
                      {filteredData.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold">
                    {filteredData.length}
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
                <div className="w-full lg:max-w-md">
                  <Input
                    placeholder="Search categories..."
                    prefix={<SearchOutlined className="text-slate-400 mr-2" />}
                    size="large"
                    className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)] transition-all h-11"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center whitespace-nowrap">
                    Filter By Type:
                  </span>
                  <Select
                    value={selectedType}
                    onChange={(value) => setSelectedType(value)}
                    className="w-full sm:w-[240px]"
                    size="large"
                    dropdownStyle={{ borderRadius: "12px", padding: "4px" }}
                  >
                    {jobTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span
                            style={{ color: type.color }}
                            className="flex items-center"
                          >
                            {type.icon}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {type.label}
                          </span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-100">
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  loading={loading}
                  rowKey={(record) => record._id}
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: false,
                    className: "px-6 py-4 border-t border-slate-50",
                  }}
                  rowClassName="hover:bg-slate-50/50 transition-colors"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <PlusOutlined className="text-base" />
            </div>
            <span className="text-lg font-bold text-slate-800">
              Add New Category
            </span>
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
            onClick={handlePostCategory}
            className="bg-blue-600 hover:bg-blue-700 transition-colors h-10 px-6 rounded-lg font-semibold border-none"
          >
            Create Category
          </Button>,
        ]}
        width={650}
        centered
      >
        <div className="py-5 space-y-5">
          <Row gutter={16}>
            <Col span={12}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category Name
              </label>
              <Input
                placeholder="e.g. Medicals"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="rounded-lg h-10 border-slate-200"
              />
            </Col>
            <Col span={12}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Job Type
              </label>
              <Select
                className="w-full h-10"
                value={formData.type}
                onChange={(val) => handleSelectChange("type", val)}
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {jobTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    <Space>
                      <span
                        style={{ color: type.color }}
                        className="flex items-center"
                      >
                        {type.icon}
                      </span>
                      <span>{type.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          {renderCleanImageSection()}
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <EditOutlined className="text-base" />
            </div>
            <span className="text-lg font-bold text-slate-800">
              Edit Category
            </span>
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
            onClick={handleUpdateCategory}
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors h-10 px-6 rounded-lg font-semibold border-none"
          >
            Save Changes
          </Button>,
        ]}
        width={650}
        centered
      >
        {editingRecord && (
          <div className="py-5 space-y-5">
            <Row gutter={16}>
              <Col span={12}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Category Name
                </label>
                <Input
                  placeholder="Category Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="rounded-lg h-10 border-slate-200"
                />
              </Col>
              <Col span={12}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Job Type
                </label>
                <Select
                  className="w-full h-10"
                  value={formData.type}
                  onChange={(val) => handleSelectChange("type", val)}
                  dropdownStyle={{ borderRadius: "8px" }}
                >
                  {jobTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        <span
                          style={{ color: type.color }}
                          className="flex items-center"
                        >
                          {type.icon}
                        </span>
                        <span>{type.label}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            {renderCleanImageSection()}

            <Row gutter={16}>
              <Col span={12}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <Select
                  className="w-full h-10"
                  value={formData.status}
                  onChange={(val) => handleSelectChange("status", val)}
                  dropdownStyle={{ borderRadius: "8px" }}
                >
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </Col>
              <Col span={12}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Sub Categories
                </label>
                <Input
                  placeholder="e.g. Fans, Medical store"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="rounded-lg h-10 border-slate-200"
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={null}
        open={isViewModalOpen}
        maskStyle={{ backdropFilter: "blur(4px)" }}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingData(null);
        }}
        footer={null}
        width={460}
        centered
        bodyStyle={{ padding: 0 }}
        className="overflow-hidden rounded-2xl"
      >
        {viewingData && (
          <div className="flex flex-col">
            <div className="relative h-28 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 pt-8 flex items-end">
              <div className="absolute -bottom-10 left-6">
                <Avatar
                  shape="square"
                  size={84}
                  src={viewingData.image}
                  icon={<PictureOutlined />}
                  className="border-4 border-white shadow-md bg-white rounded-xl"
                />
              </div>
            </div>

            <div className="px-6 pt-14 pb-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 m-0">
                  {viewingData.name}
                </h3>
                <div className="mt-2">
                  {(() => {
                    const details = getJobTypeDetails(viewingData.type);
                    return (
                      <Tag
                        icon={details.icon}
                        style={{
                          color: details.color,
                          backgroundColor: details.bg,
                          borderColor: details.border,
                          fontWeight: "600",
                          borderRadius: "6px",
                          padding: "3px 8px",
                        }}
                      >
                        {details.label}
                      </Tag>
                    );
                  })()}
                </div>
              </div>

              <Divider className="my-0 border-slate-100" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg mt-0.5">
                    <CheckCircleOutlined />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status
                    </span>
                    <Tag
                      color={viewingData.status ? "green" : "red"}
                      className="rounded-full px-3 py-0.5 font-semibold text-xs border-none mt-1"
                      style={{
                        backgroundColor: viewingData.status
                          ? "#f0fdf4"
                          : "#fef2f2",
                        color: viewingData.status ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {viewingData.status ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg mt-0.5">
                    <AppstoreOutlined />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Sub Categories
                    </span>
                    {viewingData.subCategory &&
                    viewingData.subCategory.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[320px]">
                        {viewingData.subCategory.map((sub, idx) => (
                          <Tag
                            key={idx}
                            color="purple"
                            className="m-0 text-xs rounded border-purple-100 font-medium"
                          >
                            {sub}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">
                        None
                      </span>
                    )}
                  </div>
                </div>

                {viewingData.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg mt-0.5">
                      <ClockCircleOutlined />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Created On
                      </span>
                      <span className="text-sm font-medium text-slate-600 mt-1 block">
                        {dayjs(viewingData.createdAt).format(
                          "DD MMM YYYY, hh:mm A",
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="primary"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingData(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-900 transition-colors h-10 px-6 rounded-lg font-semibold border-none text-white w-full sm:w-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Job_category;
