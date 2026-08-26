import React, { useState } from 'react';
import {
    Modal, Form, Input, Select, Radio, Button, message, Upload, Avatar, 
    InputNumber, Switch, Row, Col
} from 'antd';
import { UserOutlined, UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import defaultUserImage from "../../assets/dummy.png";
import { createAdminUser } from '../../auth/apiAddUser'; 

const { Option } = Select;

const AddUserFormModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(defaultUserImage);
    const [profileFile, setProfileFile] = useState(null);

    const handleAvatarChange = ({ file }) => {
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onload = e => {
                setAvatarUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAutoFetchLocation = () => {
        setFetchingLocation(true);
        if (!navigator.geolocation) {
            message.error("Geolocation is not supported.");
            setFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data && data.address) {
                        form.setFieldsValue({
                            address: data.display_name,
                            city: data.address.city || data.address.town || "",
                            state: data.address.state || "",
                            country: data.address.country || "",
                            latitude: latitude.toString(),
                            longitude: longitude.toString(),
                        });
                        message.success("Location fetched!");
                    }
                } catch (error) {
                    message.error("Failed to fetch address.");
                } finally {
                    setFetchingLocation(false);
                }
            },
            () => {
                message.error("Location access denied.");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();

            formData.append('mobile', values.mobile || '');
            formData.append('fullName', values.fullName || '');
            formData.append('email', values.email || '');
            formData.append('password', values.password || '');
            formData.append('gender', values.gender || '');
            formData.append('role', values.role || '');
            formData.append('address', values.address || '');
            formData.append('city', values.city || '');
            formData.append('state', values.state || '');
            formData.append('country', values.country || '');
            formData.append('bloodGroup', values.bloodGroup || '');
            formData.append('status', values.status || 'Active');
            formData.append('credits', values.credits !== undefined ? values.credits : 100);
            formData.append('isVerified', values.isVerified !== undefined ? values.isVerified : true);

            if (values.longitude && values.latitude) {
                const locationObj = {
                    type: "Point",
                    coordinates: [parseFloat(values.longitude), parseFloat(values.latitude)]
                };
                formData.append('location', JSON.stringify(locationObj));
            }

            if (profileFile) {
                formData.append('profilePhoto', profileFile);
            }

            const response = await createAdminUser(formData);
            
            if (response && (response.success || response.user)) {
                message.success('User created successfully!');
                onSuccess();
                handleCancel();
            } else {
                message.error(response.message || 'Failed to add user.');
            }
        } catch (error) {
            message.error(error.message || 'Failed to add user.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setAvatarUrl(defaultUserImage);
        setProfileFile(null);
        onClose();
    };

    return (
        <Modal
            title={<div className="text-xl font-bold text-slate-800 text-center">Add New User</div>}
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel} className="rounded-lg h-10 px-6">Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()} className="bg-blue-600 hover:bg-blue-700 rounded-lg h-10 px-6">
                    Add User
                </Button>,
            ]}
            centered
            width={800}
            transitionName="ant-zoom"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    role: 'GENERAL_USER',
                    status: 'Active',
                    gender: 'male',
                    bloodGroup: 'A+',
                    credits: 100,
                    isVerified: true,
                }}
                className="pt-4"
            >
                <Form.Item name="latitude" hidden><Input /></Form.Item>
                <Form.Item name="longitude" hidden><Input /></Form.Item>

                <div className="flex flex-col items-center mb-6">
                    <Avatar 
                        size={100} 
                        src={avatarUrl} 
                        icon={<UserOutlined />} 
                        className="mb-3 border-2 border-slate-200 shadow-md transition-transform hover:scale-105" 
                    />
                    <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                            handleAvatarChange({ file });
                            return false;
                        }}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />} className="rounded-lg border-slate-300">Select Profile Photo</Button>
                    </Upload>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Please input full name' }]}>
                            <Input placeholder="Jane Doe" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="mobile" label="Mobile" rules={[{ required: true, message: 'Please input mobile number' }]}>
                            <Input placeholder="9876543210" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                            <Input placeholder="jane@example.com" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
                            <Input.Password placeholder="••••••••" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="role" label="User Role">
                            <Select className="h-10 rounded-lg">
                                <Option value="GENERAL_USER">General User</Option>
                                <Option value="SERVICE_PROVIDER">Service Provider</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Gender">
                            <Radio.Group className="h-10 flex items-center">
                                <Radio value="male">Male</Radio>
                                <Radio value="female">Female</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                   <Col span={24}>
                        <div className="flex justify-end mb-1">
                            <Button type="link" icon={<EnvironmentOutlined />} onClick={handleAutoFetchLocation} loading={fetchingLocation} className="text-blue-600 flex items-center gap-1 p-0 h-auto">
                                Auto Fetch Location
                            </Button>
                        </div>
                        <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input address' }]}>
                            <Input className="h-10 rounded-lg" />
                        </Form.Item>
                   </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="city" label="City">
                            <Input className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="state" label="State">
                            <Input className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="country" label="Country">
                            <Input className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="bloodGroup" label="Blood Group">
                            <Select className="h-10 rounded-lg">
                                <Option value="A+">A+</Option>
                                <Option value="B+">B+</Option>
                                <Option value="O+">O+</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="credits" label="Credits">
                            <InputNumber className="w-full h-10 rounded-lg flex items-center" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="status" label="Status">
                            <Input disabled className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="isVerified" label="Verified" valuePropName="checked" className="flex flex-col items-start">
                            <Switch className="mt-2" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddUserFormModal;