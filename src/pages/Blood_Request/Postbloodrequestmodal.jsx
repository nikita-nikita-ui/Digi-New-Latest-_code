import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Input,
    Select,
    Row,
    Col,
    message,
} from "antd";
import { PlusOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { createBloodRequestAPI } from "../../auth/adminLogin";
import { getLocalJobUsers } from "../../auth/adminLogin"
const { Option } = Select;
const { TextArea } = Input;

// --- initial form matching the required payload shape ---
const getInitialFormData = () => ({
    userId: "",
    patientName: "",
    bloodGroup: "",
    urgency: "Low",
    hospitalName: "",
    contactNumber: "",
    whatsappNumber: "",
    lat: "",
    lng: "",
    address: "",
    additionalInfo: "",
});

const labelStyle = {
    fontWeight: "bold",
    fontSize: "11px",
    color: "#555",
    marginBottom: "5px",
    display: "block",
    textTransform: "uppercase",
};

const inputStyle = { borderRadius: "6px", padding: "8px" };

const PostBloodRequestModal = ({ onSuccess }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData());

    // --- users list from API ---
    const [userOptions, setUserOptions] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const currentAdminId = localStorage.getItem("id");
    const currentAdminName = localStorage.getItem("name") || "Me";

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const result = await getLocalJobUsers(1, 100);
            const list = result?.data || result?.users || result || [];
            if (Array.isArray(list) && list.length > 0) {
                setUserOptions(list);
            } else if (currentAdminId) {
                setUserOptions([{ _id: currentAdminId, name: currentAdminName }]);
            }
        } catch (error) {
            message.error(error.message || "Failed to load users");
            if (currentAdminId) {
                setUserOptions([{ _id: currentAdminId, name: currentAdminName }]);
            }
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAutoFetchLocation = () => {
        if (!navigator.geolocation) {
            return message.error("Geolocation is not supported by your browser");
        }

        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setFormData((prev) => ({
                    ...prev,
                    lat: lat.toString(),
                    lng: lng.toString(),
                }));

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                    );
                    const geoData = await res.json();
                    const address = geoData.display_name || `${lat}, ${lng}`;
                    setFormData((prev) => ({ ...prev, address }));
                } catch {
                    setFormData((prev) => ({ ...prev, address: `${lat}, ${lng}` }));
                }

                setLocLoading(false);
                message.success("Location fetched successfully!");
            },
            () => {
                setLocLoading(false);
                message.error(
                    "Unable to retrieve your location. Please enter manually.",
                );
            },
        );
    };

    const handlePostRequest = async () => {
        const requiredFields = [
            "userId",
            "patientName",
            "bloodGroup",
            "hospitalName",
            "contactNumber",
            "whatsappNumber",
            "address",
            "additionalInfo",
        ];

        for (let field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === "") {
                message.error(`This field is required: ${field}`);
                return;
            }
        }

        const contact = formData.contactNumber?.toString().replace(/\D/g, "");
        const whatsapp = formData.whatsappNumber?.toString().replace(/\D/g, "");

        if (contact.length < 10) {
            message.error("Contact number must be at least 10 digits");
            return;
        }

        if (whatsapp.length < 10) {
            message.error("WhatsApp number must be at least 10 digits");
            return;
        }

        setSubmitLoading(true);
        try {
            const dataToSend = {
                userId: formData.userId,
                patientName: formData.patientName,
                bloodGroup: formData.bloodGroup,
                urgency: formData.urgency,
                hospitalName: formData.hospitalName,
                contactNumber: formData.contactNumber,
                whatsappNumber: formData.whatsappNumber,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                address: formData.address,
                additionalInfo: formData.additionalInfo,
            };

            const response = await createBloodRequestAPI(dataToSend);

            if (response && response.success) {
                message.success("Blood Request Posted Successfully!");
                setIsAddModalOpen(false);
                setFormData(getInitialFormData());
                if (onSuccess) onSuccess();
            } else {
                message.error(response?.message || "Failed to post request");
            }
        } catch (error) {
            message.error(error.message || "Something went wrong");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => {
                    setFormData(getInitialFormData());
                    setIsAddModalOpen(true);
                }}
                style={{ marginBottom: 20 }}
            >
                Add Blood Request
            </Button>

            <Modal
                title={
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>
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
                            <label style={labelStyle}>User</label>
                            <Select
                                placeholder="Select User"
                                style={{ width: "100%" }}
                                loading={usersLoading}
                                value={formData.userId || undefined}
                                onChange={(val) => handleSelectChange("userId", val)}
                            >
                                {userOptions.map((u) => (
                                    <Option key={u._id} value={u._id}>
                                        {u.fullName}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
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
                    </Row>

                    <Row gutter={16} style={{ marginBottom: "15px" }}>
                        <Col span={12}>
                            <label style={labelStyle}>Blood Group</label>
                            <Select
                                placeholder="Select Group"
                                style={{ width: "100%", borderRadius: "6px" }}
                                value={formData.bloodGroup || undefined}
                                onChange={(val) => handleSelectChange("bloodGroup", val)}
                            >
                                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                                    <Option key={bg} value={bg}>
                                        {bg}
                                    </Option>
                                ))}
                            </Select>
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
                                <Option value="Medium">Normal</Option>
                                <Option value="Critical">Critical</Option>
                            </Select>
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
                            <label style={labelStyle}>Address / Location</label>
                            <Input
                                placeholder="Enter address"
                                name="address"
                                value={formData.address}
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
                                name="lat"
                                value={formData.lat}
                                onChange={handleInputChange}
                                style={inputStyle}
                                readOnly
                            />
                        </Col>
                        <Col span={8}>
                            <label style={labelStyle}>Longitude</label>
                            <Input
                                placeholder="Long"
                                name="lng"
                                value={formData.lng}
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
                                loading={locLoading}
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
                                name="additionalInfo"
                                value={formData.additionalInfo}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, resize: "none" }}
                            />
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    );
};
export default PostBloodRequestModal;