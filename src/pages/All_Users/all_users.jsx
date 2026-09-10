import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, message, Avatar, Modal, Input, Descriptions, Select } from "antd";
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getAllUsersAPI,
  updateUserStatusAPI,
  searchUsersByNameAPI,
} from "../../auth/adminLogin";
import { deleteUserAPI } from "../../auth/apiAddUser";
import defaultUserImage from "../../assets/dummy.png";
import AddUserFormModal from "./AddUserFormModal";
import EditUserFormModal from "./EditUserFormModal";

const AllUsersContent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    id: null,
    action: null,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [genderFilter, setGenderFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);

  const handleSearch = async (value) => {
    setSearchText(value);

    if (value.trim() === "") {
      fetchData();
      return;
    }

    setLoading(true);
    try {
      const result = await searchUsersByNameAPI(value);
      if (result && result.status && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      message.error(error.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getAllUsersAPI(page);

      if (result && result.success && Array.isArray(result.data)) {
        setData(result.data);
      } else if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }

      setPagination((prev) => ({ ...prev, current: page }));
    } catch (error) {
      message.error(error.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, newStatus) => {
    const actionType = newStatus === "Blocked" ? "block" : "unblock";
    setActionLoading({ id: id, action: actionType });
    try {
      const response = await updateUserStatusAPI(id, newStatus);
      if (response.success) {
        message.success(
          `User ${actionType === "block" ? "Blocked" : "Unblocked"} Successfully!`
        );
        setData((prevData) =>
          prevData.map((user) =>
            user._id === id ? { ...user, status: newStatus } : user
          )
        );
      } else {
        message.error(response.message || `Failed to ${actionType}`);
      }
    } catch (error) {
      message.error(error.message || "Operation Failed");
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUserAPI(userId);
      if (response && response.success) {
        message.success("User deleted successfully!");
        fetchData();
      } else {
        message.error(response.message || "Failed to delete user.");
      }
    } catch (error) {
      message.error(
        error.message || "An error occurred while deleting the user."
      );
    }
  };

  const handleEdit = (record) => {
    setSelectedUser(record);
    setIsEditModalVisible(true);
  };

  const handleView = (record) => {
    setViewingUser(record);
    setIsViewModalVisible(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsAddModalVisible(true);
  };

  const renderLocation = (user) => {
    if (!user) return "N/A";
    if (typeof user.location === "string") return user.location;
    if (user.address) return user.address;
    if (user.location && user.location.coordinates) {
      return `Coordinates: ${user.location.coordinates.join(", ")}`;
    }
    return "N/A";
  };

  const getUserCity = (user) => {
    if (!user) return null;
    if (user.city) return user.city;
    if (typeof user.location === "string") return user.location;
    return null;
  };

  // Unique dropdown options derived from current data
  const categoryOptions = Array.from(
    new Set(data.map((u) => u.category).filter(Boolean))
  );
  const genderOptions = Array.from(
    new Set(data.map((u) => u.gender).filter(Boolean))
  );
  const locationOptions = Array.from(
    new Set(data.map((u) => getUserCity(u)).filter(Boolean))
  );

  const getFilteredData = () => {
    let filtered = data;

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter((user) => user.category === categoryFilter);
    }
    if (genderFilter) {
      filtered = filtered.filter((user) => user.gender === genderFilter);
    }
    if (locationFilter) {
      filtered = filtered.filter((user) => getUserCity(user) === locationFilter);
    }

    return filtered;
  };

  const columns = [
    {
      title: "S.NO",
      key: "serial",
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "USER NAME",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar
            size="large"
            src={record.profilePhoto || record.profilePic || defaultUserImage}
            icon={<UserOutlined />}
          />
          <div className="flex flex-col">
            <span className="font-semibold">{record.fullName || "N/A"}</span>
            <span className="text-xs text-gray-500">
              {record.email || record.mobile || "N/A"}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "EMAIL/MOBILE",
      key: "contact",
      render: (_, record) => record.email || record.mobile || "N/A",
    },
    {
      title: "CATEGORY",
      key: "category",
      render: (_, record) => record.category || "N/A",
    },
    {
      title: "LOCATION",
      key: "locationColumn",
      render: (_, record) => renderLocation(record),
    },
    {
      title: "USER TYPE",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Blocked" ? "red" : "green"}>
          {(status || "UNKNOWN").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "ACTIONS",
      key: "action",
      width: 180,
      render: (_, record) => {
        const isBlocked = record.status === "Blocked";
        const isLoading = actionLoading.id === record._id;
        const nextStatus = isBlocked ? "Active" : "Blocked";
        const IconComponent = isBlocked ? UnlockOutlined : LockOutlined;
        const actionTypeText = isBlocked ? "Unblock" : "Block";

        return (
          <Space size="middle">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Button
              type="text"
              size="small"
              icon={<IconComponent />}
              style={isBlocked ? { color: "#28a745" } : { color: "#ffc107" }}
              loading={
                isLoading &&
                actionLoading.action === actionTypeText.toLowerCase()
              }
              disabled={isLoading}
              onClick={() => {
                Modal.confirm({
                  title: `${actionTypeText} User`,
                  content: `Are you sure you want to ${actionTypeText} ${record.fullName}?`,
                  okText: actionTypeText,
                  cancelText: "Cancel",
                  centered: true,
                  onOk: () => handleStatusToggle(record._id, nextStatus),
                });
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => {
                Modal.confirm({
                  title: "Delete User",
                  content: `Are you sure you want to delete ${record.fullName}? This action cannot be undone.`,
                  okText: "Delete",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk: () => handleDeleteUser(record._id),
                });
              }}
            />
          </Space>
        );
      },
    },
  ];

  return (
     <>
      <style>
        {`
        .ant-table-thead > tr > th {
        background: #e5e7eb !important;
        }
      `}
      </style>
<div className="p-6 bg-white rounded-lg shadow-md w-full min-h-screen">        <h1 className="text-2xl font-bold mb-2">All Users</h1>
        <p className="text-gray-500 mb-8">
          Manage all registered users on the platform.
        </p>

        <Space wrap style={{ marginBottom: 30, marginTop: 10 }}>
          <Button
            type={roleFilter === null ? "primary" : "default"}
            onClick={() => setRoleFilter(null)}
            style={{
              borderRadius: 20,
              background: roleFilter === null ? "#4a69bd" : "",
            }}
          >
            All Users
          </Button>
          <Button
            type={roleFilter === "SERVICE_PROVIDER" ? "primary" : "default"}
            onClick={() => setRoleFilter("SERVICE_PROVIDER")}
            style={{
              borderRadius: 20,
              background: roleFilter === "SERVICE_PROVIDER" ? "#4a69bd" : "",
            }}
          >
            Service Provider
          </Button>
          <Button
            type={roleFilter === "GENERAL_USER" ? "primary" : "default"}
            onClick={() => setRoleFilter("GENERAL_USER")}
            style={{
              borderRadius: 20,
              background: roleFilter === "GENERAL_USER" ? "#4a69bd" : "",
            }}
          >
            General User
          </Button>
          <Button
            type={roleFilter === "BUSINESS_SHOPS" ? "primary" : "default"}
            onClick={() => setRoleFilter("BUSINESS_SHOPS")}
            style={{
              borderRadius: 20,
              background: roleFilter === "BUSINESS_SHOPS" ? "#4a69bd" : "",
            }}
          >
            Business/Shop
          </Button>

        

          <Select
            placeholder="Gender"
            allowClear
            style={{ width: 140 }}
            value={genderFilter}
            onChange={(value) => setGenderFilter(value || null)}
            options={genderOptions.map((g) => ({
              label: g.charAt(0).toUpperCase() + g.slice(1),
              value: g,
            }))}
          />

          <Select
            placeholder="Location"
            allowClear
            style={{ width: 160 }}
            value={locationFilter}
            onChange={(value) => setLocationFilter(value || null)}
            options={locationOptions.map((l) => ({ label: l, value: l }))}
          />
        </Space>

        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <Space>
            <Input
              placeholder="Search Users by name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250, borderRadius: 6 }}
              allowClear
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} >
            Add User
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={getFilteredData()}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1400 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            onChange: (page) => {
              fetchData(page);
            },
          }}
        />

        <AddUserFormModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onSuccess={fetchData}
        />

        <EditUserFormModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedUser(null);
          }}
          onSuccess={fetchData}
          user={selectedUser}
        />

      <Modal
  title="User Details"
  open={isViewModalVisible}
  styles={{ content: { borderRadius: 50 } }}
  onCancel={() => {
            setIsViewModalVisible(false);
            setViewingUser(null);
          }}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => {
                setIsViewModalVisible(false);
                setViewingUser(null);
              }}
            >
              Close
            </Button>,
          ]}
          width={700}
          centered
        >
          {viewingUser && (
            <div className="flex flex-col items-center gap-6 mt-4">
              <Avatar
                size={100}
                src={viewingUser.profilePhoto || viewingUser.profilePic || defaultUserImage}
                icon={<UserOutlined />}
              />
              <Descriptions bordered column={2} className="w-full" size="small">
                <Descriptions.Item label="Full Name" span={2}>
                  {viewingUser.fullName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {viewingUser.email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Mobile">
                  {viewingUser.mobile || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  {viewingUser.role || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {viewingUser.gender || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Blood Group">
                  {viewingUser.bloodGroup || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Credits">
                  {viewingUser.credits !== undefined ? viewingUser.credits : "0"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={viewingUser.status === "Blocked" ? "red" : "green"}>
                    {(viewingUser.status || "UNKNOWN").toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Verified">
                  <Tag color={viewingUser.isVerified ? "blue" : "orange"}>
                    {viewingUser.isVerified ? "YES" : "NO"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="City">
                  {viewingUser.city || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {viewingUser.state || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Country">
                  {viewingUser.country || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Registered On">
                  {viewingUser.createdAt
                    ? new Date(viewingUser.createdAt).toLocaleDateString()
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Location / Address" span={2}>
                  {renderLocation(viewingUser)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div></>
      );
    
};

      export default AllUsersContent;