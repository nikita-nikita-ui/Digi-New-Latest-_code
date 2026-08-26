import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, Select, Radio, Button, message, Upload, Avatar, 
    InputNumber, Switch, Row, Col
} from 'antd';
import { UserOutlined, UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import defaultUserImage from "../../assets/dummy.png";
import { updateUserAPI } from '../../auth/apiAddUser'; 

const { Option } = Select;

const EditUserFormModal = ({ visible, onClose, onSuccess, user }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(defaultUserImage);
    const [profileFile, setProfileFile] = useState(null);

    useEffect(() => {
        if (visible && user) {
            let lat = '';
            let long = '';
            
            if (user.location && user.location.coordinates && user.location.coordinates.length === 2) {
                long = user.location.coordinates[0];
                lat = user.location.coordinates[1];
            }

            form.setFieldsValue({
                fullName: user.fullName,
                mobile: user.mobile,
                role: user.role,
                gender: user.gender,
                address: user.address,
                city: user.city,
                state: user.state,
                country: user.country,
                bloodGroup: user.bloodGroup,
                credits: user.credits,
                status: user.status,
                isVerified: user.isVerified,
                latitude: lat,
                longitude: long
            });

            if (user.profilePhoto) {
                setAvatarUrl(user.profilePhoto); 
            } else {
                setAvatarUrl(defaultUserImage);
            }
            
            setProfileFile(null);
        }
    }, [user, visible, form]);

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
            (err) => {
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

            formData.append('mobile', values.mobile);
            formData.append('fullName', values.fullName);
            formData.append('gender', values.gender);
            formData.append('role', values.role);
            formData.append('address', values.address);
            formData.append('city', values.city);
            formData.append('state', values.state);
            formData.append('country', values.country);
            formData.append('bloodGroup', values.bloodGroup);
            formData.append('status', values.status);
            formData.append('credits', values.credits);
            formData.append('isVerified', values.isVerified);

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

            await updateUserAPI(user._id, formData);
            
            message.success('User updated successfully!');
            onSuccess();
            handleCancel();
            
        } catch (error) {
            message.error(error.message || 'Failed to update user.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setProfileFile(null);
        onClose();
    };

    return (
        <Modal
            title={<div style={{ textAlign: 'center' }}>Edit User Details</div>}
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                    Update User
                </Button>,
            ]}
            centered
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item name="latitude" hidden><Input /></Form.Item>
                <Form.Item name="longitude" hidden><Input /></Form.Item>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                    <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} style={{ marginBottom: '10px', border: '1px solid #ddd' }} />
                    <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                            handleAvatarChange({ file });
                            return false;
                        }}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>Change Profile Photo</Button>
                    </Upload>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                            <Input placeholder="Jane Doe" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
                            <Input placeholder="9876543210" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="role" label="User Role">
                            <Select>
                                <Option value="GENERAL_USER">General User</Option>
                                <Option value="SERVICE_PROVIDER">Service Provider</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Gender">
                            <Radio.Group>
                                <Radio value="male">Male</Radio>
                                <Radio value="female">Female</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                   <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="link" icon={<EnvironmentOutlined />} onClick={handleAutoFetchLocation} loading={fetchingLocation}>
                                Auto Fetch Location
                            </Button>
                        </div>
                        <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                   </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
                    <Col span={8}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
                    <Col span={8}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="bloodGroup" label="Blood Group">
                            <Select>
                                <Option value="A+">A+</Option>
                                <Option value="B+">B+</Option>
                                <Option value="O+">O+</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="credits" label="Credits">
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="status" label="Status">
                            <Select>
                                <Option value="Active">Active</Option>
                                <Option value="Blocked">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="isVerified" label="Verified" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EditUserFormModal;