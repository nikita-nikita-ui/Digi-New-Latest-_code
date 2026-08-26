import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  getAllBloodRequestsAPI,
  updateBloodRequestAPI,
  deleteBloodRequestAPI,
  getBloodRequestByIdAPI,
  createBloodRequestAPI,
  getBloodRequestsByUrgencyAPI,
} from "../../auth/adminLogin";

const { Option } = Select;
const { TextArea } = Input;

// --- Helper function to reset form data ---
const getInitialFormData = () => ({
  patientName: "",
  age: "",
  gender: "Male",
  bloodGroup: "",
  units: 1,
  hospitalName: "",
  location: "",
  contactNumber: "",
  urgency: "Low",
  description: "",
  whatsappNumber: "",
  latitude: "",
  longitude: "",
});

const BloodRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal and Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  const currentAdminId = localStorage.getItem("id");

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllBloodRequestsAPI();
      if (result && result.data) {
        setData(result.data);
      } else if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
    } catch (error) {
      message.error(error.message || "Failed to load blood requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- POST (Add) Handler ---
  const handlePostRequest = async () => {
    const whatsapp = formData.whatsappNumber?.toString().replace(/\D/g, "");
    const requiredFields = [
      "patientName",
      "bloodGroup",
      "contactNumber",
      "hospitalName",
      "location",
      "whatsappNumber",
      "description",
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        message.error(`This field is required: ${field}`);
        return;
      }
    }
    const contact = formData.contactNumber?.toString().replace(/\D/g, "");

    if (contact.length < 10) {
      message.error("Contact number must be at least 10 digits");
      return;
    }

    if (whatsapp.length < 10) {
      message.error("WhatsApp number must be at least 10 digits");
      return;
    }
    if (
      !formData.patientName ||
      !formData.bloodGroup ||
      !formData.contactNumber ||
      !formData.hospitalName
    ) {
      message.error(
        "Please fill in all required fields: Name, Blood Group, Contact, and Hospital.",
      );
      return;
    }

    setSubmitLoading(true);
    try {
      const dataToSend = {
        userId: currentAdminId,
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        urgency: formData.urgency,
        hospitalName: formData.hospitalName,
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
        address: formData.location,
        contactNumber: formData.contactNumber,
        whatsappNumber: formData.whatsappNumber,
        additionalInfo: formData.description,
      };
      const response = await createBloodRequestAPI(dataToSend);

      if (response && response.success) {
        message.success("Blood Request Posted Successfully!");
        setIsAddModalOpen(false);
        setFormData(getInitialFormData());
        fetchData();
      } else {
        message.error(response.message || "Failed to post request");
      }
    } catch (error) {
      message.error(error.message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };
  // --- POST (Add) Handler ---

  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      return message.error("Geolocation is not supported by your browser");
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));

        // Reverse Geocoding — lat/lng se address fetch karo
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          );
          const geoData = await res.json();
          const address = geoData.display_name || `${lat}, ${lng}`;
          setFormData((prev) => ({ ...prev, location: address }));
        } catch {
          setFormData((prev) => ({ ...prev, location: `${lat}, ${lng}` }));
        }

        setLoading(false);
        message.success("Location fetched successfully!");
      },
      () => {
        setLoading(false);
        message.error(
          "Unable to retrieve your location. Please enter manually.",
        );
      },
    );
  };
  // --- PUT (Edit) Handlers ---
  const handleEditClick = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
    setFormData({
      patientName: record.patientName || "",
      age: record.age || "",
      gender: record.gender || "Male",
      bloodGroup: record.bloodGroup || "",
      units: record.units || 1,
      hospitalName: record.hospitalName || "",
      location:
        record.location?.address || record.location || record.city || "",

      contactNumber: record.contactNumber || record.mobile || "",
      urgency: record.urgency || "Low",
      description: record.description || "",
      whatsappNumber: record.whatsappNumber || record.contactNumber || "",
      userId: record.userId || "",
    });
  };

  const handleUpdateRequest = async () => {
    const whatsapp = formData.whatsappNumber?.toString().replace(/\D/g, "");
    const requiredFields = [
      "patientName",
      "bloodGroup",
      "contactNumber",
      "hospitalName",
      "location",
      "whatsappNumber",
      "description",
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        message.error(`This field is required: ${field}`);
        return;
      }
    }
    const contact = formData.contactNumber?.toString().replace(/\D/g, "");

    if (contact.length < 10) {
      message.error("Contact number must be at least 10 digits");
      return;
    }

    if (whatsapp.length < 10) {
      message.error("WhatsApp number must be at least 10 digits");
      return;
    }
    if (!editingRecord || !editingRecord._id) return;

    setSubmitLoading(true);
    try {
      const dataToSend = {
        userId: currentAdminId,
        adminId: currentAdminId, // ✅ add this
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        urgency: formData.urgency,
        hospitalName: formData.hospitalName,
        contactNumber: formData.contactNumber,
        whatsappNumber: formData.whatsappNumber,
        additionalInfo: formData.description,
        lat: parseFloat(formData.latitude), // ✅ was: latitude
        lng: parseFloat(formData.longitude), // ✅ was: longitude
        address: formData.location, // ✅ was: location object
      };

      const response = await updateBloodRequestAPI(
        editingRecord._id,
        dataToSend,
      );

      if (response.success) {
        message.success("Blood Request Updated Successfully!");
        setIsEditModalOpen(false);
        fetchData();
      } else {
        message.error(response.message || "Failed to update request");
      }
    } catch (error) {
      message.error(error.message || "Error during update");
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- DELETE Handler ---
  const handleDeleteClick = (id) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this blood request?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await deleteBloodRequestAPI(id);
          if (response.success) {
            message.success("Blood Request Deleted Successfully!");
            fetchData();
          } else {
            message.error(response.message || "Failed to delete request");
          }
        } catch (error) {
          message.error(error.message || "Error during deletion");
        }
      },
    });
  };

  // --- VIEW Handler ---
  const handleViewClick = async (record) => {
    setViewLoading(true);
    setIsViewModalOpen(true);
    try {
      const fetchedData = await getBloodRequestByIdAPI(record._id);

      setViewingData({
        ...fetchedData,
        description:
          fetchedData.additionalInfo || fetchedData.description || "N/A",
        requester: record.requesterName || "Admin/System",
        datePosted: record.createdAt,
      });
    } catch (error) {
      message.error(error.message || "Failed to load request details.");
      setViewingData(null);
    } finally {
      setViewLoading(false);
    }
  };

  // --- Filtering ---
  const filteredData = data.filter(
    (item) =>
      (item.patientName &&
        item.patientName.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.hospitalName &&
        item.hospitalName.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.bloodGroup &&
        item.bloodGroup.toLowerCase().includes(searchText.toLowerCase())),
  );

  const columns = [
    {
      title: "REQUESTER INFO",
      key: "requester",
      render: (_, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: "#ff4d4f" }}
            icon={<UserOutlined />}
          />
          <div className="flex flex-col">
            <span className="font-semibold">
              {record.requesterName || "Admin/User"}
            </span>
            <span className="text-xs text-gray-500">
              {record.contactNumber}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "PATIENT DETAILS",
      key: "patient",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {record.patientName}
          </span>
          <span className="text-xs text-gray-500">
            Age: {record.age || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "BLOOD GROUP",
      dataIndex: "bloodGroup",
      key: "bloodGroup",
      render: (bloodGroup) => (
        <Tag color="#cd201f" style={{ fontWeight: "bold", fontSize: "13px" }}>
          {bloodGroup}
        </Tag>
      ),
    },
    {
      title: "LOCATION / HOSPITAL",
      key: "location",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.hospitalName}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <EnvironmentOutlined />{" "}
            {record.location?.address ||
              record.location ||
              record.city ||
              "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "gold";
        const s = status ? status.toLowerCase() : "pending";

        if (s === "fulfilled" || s === "resolved") color = "green";
        if (s === "expired") color = "gray";
        if (s === "urgent") color = "red";

        return (
          <Tag
            color={color}
            style={{ borderRadius: "10px", padding: "0 10px" }}
          >
            {status ? status.toUpperCase() : "PENDING"}
          </Tag>
        );
      },
    },
    {
      title: "DATE",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => (
        <div className="flex flex-col text-xs text-gray-500">
          <span>{dayjs(date).format("DD MMM YYYY")}</span>
          <span>{dayjs(date).format("hh:mm A")}</span>
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              shape="circle"
              icon={<EyeOutlined style={{ color: "#1890ff" }} />}
              onClick={() => handleViewClick(record)}
            />
          </Tooltip>

          <Tooltip title="Edit Request">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined style={{ color: "#108ee9" }} />}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>

          <Tooltip title="Delete Request">
            <Button
              type="text"
              shape="circle"
              icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
              onClick={() => handleDeleteClick(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Styles
  const tabButtonStyle = {
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    padding: "0 15px",
    fontSize: "13px",
  };

  const labelStyle = {
    fontWeight: "bold",
    fontSize: "11px",
    color: "#555",
    marginBottom: "5px",
    display: "block",
    textTransform: "uppercase",
  };
  const inputStyle = { borderRadius: "6px", padding: "8px" };

  const handleFilterByUrgency = async (urgency) => {
    setLoading(true);
    try {
      if (urgency === "All") {
        await fetchData();
      } else {
        const result = await getBloodRequestsByUrgencyAPI(urgency);
        setData(result.data || []);
      }
    } catch (error) {
      message.error("Failed to filter data");
    } finally {
      setLoading(false);
    }
  };
  const boxStyle = {
    background: "#fff",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
    padding: "6px 10px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    fontSize: "12px",
  };
  return (
      <>
    <style>
      {`
        .ant-table-thead > tr > th {
         background: #f3f4f6 !important;
          color: #111827 !important;
        }
      `}
    </style>
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-8xl  m-4 overflow-x-hidden">
      {" "}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Blood Requests</h1>
          <Space wrap size="small">
            {["All", "Low", "Medium", "Critical"].map((level) => (
              <Button
                key={level}
                onClick={() => handleFilterByUrgency(level)}
                style={tabButtonStyle}
              >
                {level === "Low"
                  ? "NORMAL"
                  : level === "Medium"
                    ? "URGENT"
                    : level.toUpperCase()}
              </Button>
            ))}
          </Space>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ backgroundColor: "#1890ff", borderRadius: "6px" }}
          onClick={() => {
            setEditingRecord(null);
            setFormData(getInitialFormData());
            setIsAddModalOpen(true);
          }}
        >
          Add Blood Request
        </Button>
      </div>
      <div className="mb-6">
        <Input
          placeholder="Search by Patient Name, Hospital or Blood Group..."
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          size="large"
          style={{ borderRadius: "8px", maxWidth: "500px" }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey={(record) => record._id || Math.random()}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1400 }}
        className="ant-table-striped"
      />
      {/* ADD MODAL (POST) */}
      <Modal
        title={
          <span
            style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}
          >
            Post New Blood Request
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            type="text"
            onClick={() => setIsAddModalOpen(false)}
            style={{ color: "#999", fontWeight: "bold" }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={handlePostRequest}
            style={{
              backgroundColor: "#1890ff",
              borderRadius: "6px",
              padding: "0 25px",
              height: "38px",
              fontWeight: "bold",
            }}
          >
            Post Request Now
          </Button>,
        ]}
        width={700}
        centered
      >
        <div style={{ marginTop: "20px" }}>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={12}>
              <label style={labelStyle}>Patient Name</label>
              <Input
                placeholder="Enter patient name"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </Col>
            <Col span={12}>
              <label style={labelStyle}>Age</label>
              <Input
                placeholder="Enter age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={12}>
              <label style={labelStyle}>Blood Group</label>
              <Select
                placeholder="Select Group"
                style={{ width: "100%", borderRadius: "6px" }}
                value={formData.bloodGroup}
                onChange={(val) => handleSelectChange("bloodGroup", val)}
              >
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                  (bg) => (
                    <Option key={bg} value={bg}>
                      {bg}
                    </Option>
                  ),
                )}
              </Select>
            </Col>
            <Col span={12}>
              <label style={labelStyle}>Units Required</label>
              <Input
                placeholder="e.g. 1"
                type="number"
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={12}>
              <label style={labelStyle}>Hospital Name</label>
              <Input
                placeholder="Enter hospital name"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </Col>
            <Col span={12}>
              <label style={labelStyle}>Location (City)</label>
              <Input
                placeholder="Enter city"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={8}>
              <label style={labelStyle}>Latitude</label>
              <Input
                placeholder="Lat"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                style={inputStyle}
                readOnly
              />
            </Col>
            <Col span={8}>
              <label style={labelStyle}>Longitude</label>
              <Input
                placeholder="Long"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                style={inputStyle}
                readOnly
              />
            </Col>
            <Col span={8}>
              <label style={labelStyle}>&nbsp;</label>
              <Button
                block
                icon={<EnvironmentOutlined />}
                onClick={handleAutoFetchLocation}
                style={{ borderRadius: "6px", height: "38px" }}
              >
                Fetch Location
              </Button>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "15px" }}>
            <Col span={12}>
              <label style={labelStyle}>Contact Number</label>
              <Input
                placeholder="+91 9876543210"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </Col>
            <Col span={12}>
              <label style={labelStyle}>Urgency</label>
              <Select
                placeholder="Select Urgency"
                style={{ width: "100%" }}
                value={formData.urgency}
                onChange={(val) => handleSelectChange("urgency", val)}
              >
                <Option value="Low">Low</Option>
                <Option value="Medium">Normal</Option>{" "}
                <Option value="Critical">Critical</Option>
              </Select>
            </Col>
          </Row>
          <Row style={{ marginBottom: "15px" }}>
            <Col span={24}>
              <label style={labelStyle}>Whatsapp Number</label>
              <Input
                placeholder="Enter whatsapp number"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </Col>
          </Row>
          <Row style={{ marginBottom: "10px" }}>
            <Col span={24}>
              <label style={labelStyle}>Additional Message / Description</label>
              <TextArea
                rows={3}
                placeholder="Any specific details..."
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={{ ...inputStyle, resize: "none" }}
              />
            </Col>
          </Row>
        </div>
      </Modal>
      {/* EDIT MODAL (PUT) */}
      <Modal
        title={
          <span
            style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}
          >
            Edit Blood Request ({editingRecord?.patientName})
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            type="text"
            onClick={() => setIsEditModalOpen(false)}
            style={{ color: "#999", fontWeight: "bold" }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={handleUpdateRequest}
            style={{
              backgroundColor: "#007bff",
              borderRadius: "6px",
              padding: "0 25px",
              height: "38px",
              fontWeight: "bold",
            }}
          >
            Save Changes
          </Button>,
        ]}
        width={700}
        centered
      >
        {editingRecord && (
          <div style={{ marginTop: "20px" }}>
            <Row gutter={16} style={{ marginBottom: "15px" }}>
              <Col span={12}>
                <label style={labelStyle}>Patient Name</label>
                <Input
                  placeholder="Enter patient name"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </Col>
              <Col span={12}>
                <label style={labelStyle}>Age</label>
                <Input
                  placeholder="Enter age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "15px" }}>
              <Col span={12}>
                <label style={labelStyle}>Blood Group</label>
                <Select
                  placeholder="Select Group"
                  style={{ width: "100%", borderRadius: "6px" }}
                  value={formData.bloodGroup}
                  onChange={(val) => handleSelectChange("bloodGroup", val)}
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (bg) => (
                      <Option key={bg} value={bg}>
                        {bg}
                      </Option>
                    ),
                  )}
                </Select>
              </Col>
              <Col span={12}>
                <label style={labelStyle}>Units Required</label>
                <Input
                  placeholder="e.g. 1"
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "15px" }}>
              <Col span={12}>
                <label style={labelStyle}>Hospital Name</label>
                <Input
                  placeholder="Enter hospital name"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </Col>
              <Col span={12}>
                <label style={labelStyle}>Location (City)</label>
                <Input
                  placeholder="Enter city"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "15px" }}>
              <Col span={12}>
                <label style={labelStyle}>Contact Number</label>
                <Input
                  placeholder="+91 9876543210"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </Col>
              <Col span={12}>
                <label style={labelStyle}>Urgency</label>
                <Select
                  placeholder="Select Urgency"
                  style={{ width: "100%" }}
                  value={formData.urgency}
                  onChange={(val) => handleSelectChange("urgency", val)}
                >
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Normal</Option>{" "}
                  <Option value="Critical">Critical</Option>
                </Select>
              </Col>
            </Row>
            <Row style={{ marginBottom: "10px" }}>
              <Col span={24}>
                <label style={labelStyle}>
                  Additional Message / Description
                </label>
                <TextArea
                  rows={3}
                  placeholder="Any specific details..."
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
      {/* VIEW MODAL */}
      <Modal
        title={
          <span
            style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}
          >
            Blood Request Details
          </span>
        }
        open={isViewModalOpen}
        maskStyle={{ backdropFilter: "blur(6px)" }}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingData(null);
        }}
        footer={
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setIsViewModalOpen(false);
              setViewingData(null);
            }}
            style={{
              backgroundColor: "#1890ff",
              borderRadius: "6px",
              padding: "0 25px",
              height: "38px",
              fontWeight: "bold",
            }}
          >
            Close
          </Button>
        }
        width={450}
        centered
        confirmLoading={viewLoading}
      >
        {viewLoading && (
          <div className="text-center py-8">
            <p>Loading Details...</p>
          </div>
        )}
        {!viewLoading && viewingData && (
          <div style={{ padding: "10px" }}>
            <div
              style={{
                background: "#f8fafc",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "15px",
                border: "1px solid #eee",
              }}
            >
              <h3
                style={{
                  marginBottom: "5px",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {viewingData.patientName}
              </h3>

              <Tag color="#cd201f">{viewingData.bloodGroup}</Tag>
            </div>

            <Row gutter={[12, 8]}>
              <Col span={12}>
                <div style={boxStyle}>
                  <b>Age</b>
                  <div>{viewingData.age || "N/A"}</div>
                </div>
              </Col>

              <Col span={12}>
                <div style={boxStyle}>
                  <b>Units</b>
                  <div>{viewingData.units || "N/A"}</div>
                </div>
              </Col>

              <Col span={24}>
                <div style={boxStyle}>
                  <b>Hospital</b>
                  <div>{viewingData.hospitalName || "N/A"}</div>
                </div>
              </Col>

              <Col span={24}>
                <div style={boxStyle}>
                  <b>Location</b>
                  <div>
                    {typeof viewingData.location === "object"
                      ? viewingData.location?.address
                      : viewingData.location || "N/A"}
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div style={boxStyle}>
                  <b>Contact</b>
                  <div>{viewingData.contactNumber || "N/A"}</div>
                </div>
              </Col>

              <Col span={12}>
                <div style={boxStyle}>
                  <b>Urgency</b>
                  <div>
                    <Tag color="red">{viewingData.urgency || "Normal"}</Tag>
                  </div>
                </div>
              </Col>

              <Col span={24}>
                <div style={boxStyle}>
                  <b>Description</b>
                  <div style={{ marginTop: "5px", color: "#555" }}>
                    {viewingData.description || "No description"}
                  </div>
                </div>
              </Col>

              <Col span={24}>
                <div style={boxStyle}>
                  <b>Status</b>
                  <div>
                    <Tag
                      color={
                        viewingData.status === "Fulfilled" ? "green" : "gold"
                      }
                    >
                      {viewingData.status || "Pending"}
                    </Tag>
                  </div>
                </div>
              </Col>

              <Col span={24}>
                <div style={boxStyle}>
                  <b>Posted On</b>
                  <div>
                    {viewingData.datePosted
                      ? dayjs(viewingData.datePosted).format(
                          "DD MMM YYYY, hh:mm A",
                        )
                      : "N/A"}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {!viewLoading && !viewingData && (
          <p className="text-center py-8 text-red-500">
            Could not load data for this request.
          </p>
        )}
      </Modal>
    </div>
    </>
  );
};

export default BloodRequests;
