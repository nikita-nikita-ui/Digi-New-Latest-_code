import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, message, Avatar, Modal } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getAllBusiness, updateBusinessStatusAPI } from "../../auth/adminLogin";

const PendingBusinessTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    id: null,
    action: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllBusiness(1);
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, actionType) => {
    setActionLoading({ id: id, action: actionType });
    try {
      const statusMap = {
        approve: "Approved",
        reject: "Rejected",
      };
      const response = await updateBusinessStatusAPI(id, statusMap[actionType]);
      if (response.success) {
        message.success(
          `Business ${actionType === "approve" ? "Approved" : "Rejected"} Successfully!`,
        );
        setData((prevData) => prevData.filter((item) => item._id !== id));
      } else {
        message.error(response.message || `Failed to ${actionType}`);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Operation Failed");
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const columns = [
    {
      title: "Owner Details",
      key: "owner",
      className: "text-xs font-semibold text-slate-700",
      render: (_, record) => (
        <Space size="middle" className="align-middle py-1">
          <Avatar
            src={record.ownerImage}
            icon={<UserOutlined />}
            size={40}
            className="border border-slate-100 shadow-sm"
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-700 text-sm leading-tight">
              {record.ownerName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              {record.mobileNumber}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
      className: "text-xs font-semibold text-slate-700",
      render: (text) => (
        <span className="font-bold text-slate-800 text-xs tracking-tight">
          {text}
        </span>
      ),
    },
   
    {
      title: "Location",
      key: "location",
      className: "text-xs font-semibold text-slate-500 max-w-xs",
      render: (_, record) => (
        <span className="text-slate-500 font-medium text-xs truncate block max-w-[200px]">
          {record?.location?.address || "N/A"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (status) => (
        <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase inline-block">
          {typeof status === "string" ? status.toUpperCase() : "PENDING"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      className: "text-center",
      render: (_, record) => (
        <Space size="small" className="justify-center">
          <Button
            type="primary"
            size="middle"
            icon={<CheckCircleOutlined />}
            loading={
              actionLoading.id === record._id &&
              actionLoading.action === "approve"
            }
            disabled={actionLoading.id === record._id}
            onClick={() => handleDecision(record._id, "approve")}
            className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-150 h-9 flex items-center justify-center px-4"
          >
            Approve
          </Button>
          <Button
            danger
            size="middle"
            icon={<CloseCircleOutlined />}
            loading={
              actionLoading.id === record._id &&
              actionLoading.action === "reject"
            }
            disabled={actionLoading.id === record._id}
            onClick={() => {
              Modal.confirm({
                title: "Reject Business Verification",
                content:
                  "Are you sure you want to reject this business listing?",
                okText: "Reject",
                okType: "danger",
                cancelText: "Cancel",
                className: "rounded-2xl",
                onOk: () => handleDecision(record._id, "reject"),
              });
            }}
            className="bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 hover:border-transparent text-rose-600 font-semibold text-xs rounded-xl shadow-sm transition-all duration-150 h-9 flex items-center justify-center px-4"
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 m-5 bg-white rounded-2xl shadow-sm border border-slate-100 font-sans">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Pending Verifications
        </h2>
        <p className="text-slate-700 text-xs mt-1 mb-15">
          Review, approve, or reject pending business registration applications
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 5,
            className: "px-6 py-4 bg-slate-50/50 border-t border-slate-100 m-0",
          }}
          className="ant-table-custom"
        />
      </div>

      <style>{`
               .ant-table-custom .ant-table-thead > tr > th {
    background-color: #f8fafc !important;
                    color: #334155 !important;
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    padding: 16px !important;
                }
                .ant-table-custom .ant-table-tbody > tr > td {
                    padding: 14px 16px !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                .ant-table-custom .ant-table-tbody > tr:hover > td {
                    background-color: #f8fafc/50 !important;
                }
                .ant-pagination-item-active {
                    border-color: #4f46e5 !important;
                }
                .ant-pagination-item-active a {
                    color: #4f46e5 !important;
                }
            `}</style>
    </div>
  );
};

export default PendingBusinessTable;
