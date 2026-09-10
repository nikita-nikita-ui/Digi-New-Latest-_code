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
import PostBloodRequestModal from "./Postbloodrequestmodal";

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

const boxStyle = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "13px 14px",
  minHeight: "68px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.025)",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const valueStyle = {
  marginTop: "7px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#374151",
  wordBreak: "break-word",
};
const BloodRequests = () => {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    activeRequests: 0,
    deactiveRequests: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [bloodGroupSearchText, setBloodGroupSearchText] = useState("");
  // Modal and Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [showBloodGroupSearch, setShowBloodGroupSearch] = useState(false);

  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationSearchText, setLocationSearchText] = useState("");
  const currentAdminId = localStorage.getItem("id");

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllBloodRequestsAPI();
      if (result && result.data) {
        setData(result.data);
        setAnalytics({
          totalRequests: result.analytics?.totalRequests || 0,
          activeRequests: result.analytics?.activeRequests || 0,
          deactiveRequests: result.analytics?.deactiveRequests || 0,
        });
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

  const handlePostRequest = async (formData) => {
    try {
      setSubmitLoading(true);

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

      if (response.success) {
        message.success("Blood Request Posted Successfully!");
        setIsAddModalOpen(false);
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
  const filteredData = data.filter((item) => {
    const normalSearch = searchText.toLowerCase().trim();
    const locationSearch = locationSearchText.toLowerCase().trim();
    const bloodGroupSearch = bloodGroupSearchText.toLowerCase().trim();

    const matchesNormalSearch =
      !normalSearch ||
      item.patientName?.toLowerCase().includes(normalSearch) ||
      item.hospitalName?.toLowerCase().includes(normalSearch) ||
      item.bloodGroup?.toLowerCase().includes(normalSearch);

    const location =
      item.location?.address ||
      item.location ||
      item.city ||
      "";

    const matchesLocationSearch =
      !locationSearch ||
      location.toLowerCase().includes(locationSearch);

    const matchesBloodGroup =
      !bloodGroupSearch ||
      item.bloodGroup?.toLowerCase() === bloodGroupSearch;

    return (
      matchesNormalSearch &&
      matchesLocationSearch &&
      matchesBloodGroup
    );
  });
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
  const handleFilterByLocation = () => {
    setShowLocationSearch((prev) => !prev);
    setShowBloodGroupSearch(false);


    if (showLocationSearch) {
      setLocationSearchText("");
    }
  };

  const handleFilterByBloodGroup = () => {
    setShowBloodGroupSearch((prev) => !prev);
    setShowLocationSearch(false);
    setLocationSearchText("");
  };
  const boxStyle = {
    background: "#fff",
    border: "1px solid #A0522D",
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
              <Button
                style={tabButtonStyle}
                onClick={() => handleFilterByLocation()}
              >
                LOCATION
              </Button>

              <div style={{ position: "relative" }}>
                <Button
                  style={tabButtonStyle}
                  onClick={handleFilterByBloodGroup}
                >
                  BLOOD GROUP
                </Button>

                {showBloodGroupSearch && (
                  <div
                    style={{
                      position: "absolute",
                      top: "42px",
                      left: 0,
                      width: "140px",
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                      zIndex: 1000,
                      overflow: "hidden",
                    }}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                      <div
                        key={group}
                        onClick={() => {
                          setBloodGroupSearchText(group);
                          setShowBloodGroupSearch(false);
                        }}
                        style={{
                          padding: "9px 12px",
                          fontSize: "13px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f3f4f6",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f0f7ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                        }}
                      >
                        {group}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Space>
          </div>


          <PostBloodRequestModal onSuccess={fetchData} />
        </div>

        <Row gutter={16} style={{ marginBottom: "20px" }}>
          <Col xs={24} sm={8}>
            <div style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "16px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>
                TOTAL REQUESTS
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>
                {analytics.totalRequests}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "16px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>
                ACTIVE
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#16a34a" }}>
                {analytics.activeRequests}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "16px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>
                EXPIRED
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#cd201f" }}>
                {analytics.deactiveRequests}
              </div>
            </div>
          </Col>
        </Row>
        <div className="mb-6">
          <Input
            placeholder="Search by Patient Name, Hospital or Blood Group..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            size="large"
            style={{
              width: "320px",
              borderRadius: "10px",
              background: "#fffaf5",
              border: "1px solid #A0522D",
              boxShadow: "0 4px 14px rgba(255, 165, 0, 0.12)",
              transition: "all 0.3s ease",
              marginRight: "10px",
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {showLocationSearch && (
            <Input
              placeholder="Search by Location / City..."
              prefix={
                <EnvironmentOutlined
                  style={{ color: "#1677ff", fontSize: "17px" }}
                />
              }
              allowClear
              size="large"
              autoFocus
              value={locationSearchText}
              onChange={(e) => setLocationSearchText(e.target.value)}
              style={{
                width: "320px",
                borderRadius: "10px",
                background: "#fffaf5",
                border: "1px solid #A0522D",
                boxShadow: "0 4px 14px rgba(255, 165, 0, 0.12)",
                transition: "all 0.3s ease",
                marginRight: "10px",
              }}
            />
          )}


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
  open={isViewModalOpen}
  onCancel={() => {
    setIsViewModalOpen(false);
    setViewingData(null);
  }}
  footer={null}
  width={520}
  centered
  confirmLoading={viewLoading}
  styles={{
    content: {
      padding: 0,
      borderRadius: "18px",
      overflow: "hidden",
      background: "#ffffff",
      boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
    },
    body: {
      padding: 0,
    },
  }}
>
  {/* LOADING */}
  {viewLoading && (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        background: "linear-gradient(145deg, #fffaf5, #ffffff)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        Loading Details...
      </p>
    </div>
  )}

  {/* DATA */}
  {!viewLoading && viewingData && (
    <div
      style={{
        background:
          "linear-gradient(145deg, #fffaf5 0%, #ffffff 45%, #fafafa 100%)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "22px 24px",
          background: "linear-gradient(135deg, #fff4e6, #ffffff)",
          borderBottom: "1px solid #e5e7eb",
          position: "relative",
        }}
      >
      

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fed7aa, #fff7ed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            🩸
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              Blood Request Details
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "#9ca3af",
              }}
            >
              Complete request information
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "22px 24px" }}>
        {/* PATIENT */}
        <div
          style={{
            padding: "18px",
            marginBottom: "18px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #fff7ed, #ffffff)",
            border: "1px solid #d1d5db",
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 5px",
                  fontSize: "11px",
                  color: "#9ca3af",
                  fontWeight: 600,
                }}
              >
                PATIENT NAME
              </p>

              <h3
                style={{
                  margin: 0,
                  fontSize: "21px",
                  fontWeight: 700,
                  color: "#1f2937",
                  textTransform: "capitalize",
                }}
              >
                {viewingData.patientName || "N/A"}
              </h3>
            </div>

            {/* BLOOD GROUP */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "14px",
                background: "#ffffff",
                border: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#ea580c",
                }}
              >
                {viewingData.bloodGroup || "N/A"}
              </span>

              <span
                style={{
                  fontSize: "9px",
                  color: "#9ca3af",
                  fontWeight: 600,
                }}
              >
                BLOOD
              </span>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {/* URGENCY */}
          <div style={boxStyle}>
            <span style={labelStyle}>Urgency</span>

            <div style={{ marginTop: "7px" }}>
              <Tag
                style={{
                  margin: 0,
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 11px",
                  fontWeight: 600,
                  background:
                    viewingData.urgency?.toLowerCase() === "high"
                      ? "#fee2e2"
                      : viewingData.urgency?.toLowerCase() === "medium"
                      ? "#fef3c7"
                      : "#dcfce7",
                  color:
                    viewingData.urgency?.toLowerCase() === "high"
                      ? "#dc2626"
                      : viewingData.urgency?.toLowerCase() === "medium"
                      ? "#d97706"
                      : "#16a34a",
                }}
              >
                {viewingData.urgency || "N/A"}
              </Tag>
            </div>
          </div>

          {/* STATUS */}
          <div style={boxStyle}>
            <span style={labelStyle}>Status</span>

            <div style={{ marginTop: "7px" }}>
              <Tag
                style={{
                  margin: 0,
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 11px",
                  fontWeight: 600,
                  background:
                    viewingData.status?.toLowerCase() === "active"
                      ? "#dcfce7"
                      : "#f3f4f6",
                  color:
                    viewingData.status?.toLowerCase() === "active"
                      ? "#16a34a"
                      : "#6b7280",
                }}
              >
                {viewingData.status || "N/A"}
              </Tag>
            </div>
          </div>

          {/* HOSPITAL */}
          <div
            style={{
              ...boxStyle,
              gridColumn: "1 / -1",
            }}
          >
            <span style={labelStyle}>Hospital</span>

            <div style={valueStyle}>
              {viewingData.hospitalName || "N/A"}
            </div>
          </div>

          {/* CONTACT */}
          <div style={boxStyle}>
            <span style={labelStyle}>Contact Number</span>

            <div style={valueStyle}>
              {viewingData.contactNumber || "N/A"}
            </div>
          </div>

          {/* WHATSAPP */}
          <div style={boxStyle}>
            <span style={labelStyle}>WhatsApp Number</span>

            <div style={valueStyle}>
              {viewingData.whatsappNumber || "N/A"}
            </div>
          </div>

          {/* LOCATION */}
          <div
            style={{
              ...boxStyle,
              gridColumn: "1 / -1",
            }}
          >
            <span style={labelStyle}>Location</span>

            <div
              style={{
                ...valueStyle,
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <span>📍</span>

              {typeof viewingData.location === "object"
                ? viewingData.location?.address || "N/A"
                : viewingData.location || "N/A"}
            </div>
          </div>

          {/* ADDITIONAL INFORMATION */}
          <div
            style={{
              ...boxStyle,
              gridColumn: "1 / -1",
            }}
          >
            <span style={labelStyle}>Additional Information</span>

            <div
              style={{
                marginTop: "8px",
                color: "#4b5563",
                fontSize: "14px",
                lineHeight: "1.6",
                background: "#ffffff",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              {viewingData.additionalInfo || "No additional information"}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: "15px 24px 20px",
          borderTop: "1px solid #e5e7eb",
          background: "#ffffff",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={() => {
            setIsViewModalOpen(false);
            setViewingData(null);
          }}
          style={{
            height: "38px",
            padding: "0 24px",
            borderRadius: "8px",
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            color: "#4b5563",
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </div>
    </div>
  )}

  {/* NO DATA */}
  {!viewLoading && !viewingData && (
    <div
      style={{
        padding: "50px 20px",
        textAlign: "center",
        color: "#ef4444",
      }}
    >
      Could not load data for this request.
    </div>
  )}
</Modal>
      </div>
    </>
  );
};

export default BloodRequests;
