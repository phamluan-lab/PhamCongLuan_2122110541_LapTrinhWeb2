import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        country: '',
        state: '',
        city: '',
        pincode: '',
        street: '',
        buildingName: ''
    });
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            // Lấy thông tin user
            const userResponse = await axios.get(
                `http://localhost:8080/api/public/users/email/${userData.email}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setUser(userResponse.data);

            // Lấy danh sách địa chỉ của user cụ thể
            const addressResponse = await axios.get(
                `http://localhost:8080/api/public/users/${userData.email}/addresses`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            console.log('Addresses:', addressResponse.data);
            setAddresses(addressResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Không thể tải thông tin');
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('authToken');
            const userData = JSON.parse(localStorage.getItem('user'));

            // Tạo địa chỉ mới
            const response = await axios.post(
                'http://localhost:8080/api/admin/address',
                {
                    street: newAddress.street,
                    buildingName: newAddress.buildingName,
                    city: newAddress.city,
                    state: newAddress.state,
                    country: newAddress.country,
                    pincode: newAddress.pincode
                },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                toast.success('Thêm địa chỉ thành công');
                setShowAddAddress(false);
                setNewAddress({
                    country: '',
                    state: '',
                    city: '',
                    pincode: '',
                    street: '',
                    buildingName: ''
                });
                
                // Fetch lại dữ liệu sau khi thêm
                fetchUserData();
            }
        } catch (error) {
            console.error('Error adding address:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Không thể thêm địa chỉ');
            } else {
                toast.error('Không thể thêm địa chỉ');
            }
        }
    };

    const handleUpdateAddress = async (addressId) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(
                `http://localhost:8080/api/admin/addresses/${addressId}`,
                editingAddress,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            toast.success('Cập nhật địa chỉ thành công');
            setEditingAddress(null);
            fetchUserData();
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Không thể cập nhật địa chỉ');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(
                `http://localhost:8080/api/admin/addresses/${addressId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            toast.success('Xóa địa chỉ thành công');
            fetchUserData();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Không thể xóa địa chỉ');
        }
    };

    // Hiển thị thông tin vai trò đúng cách
    const renderRoles = (user) => {
        if (!user || !user.roles) return 'Chưa có vai trò';
        return user.roles.map(role => role.roleName).join(', ');
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="profile-container">
            <h2>Thông tin tài khoản</h2>
            
            <div className="profile-info">
                <div className="info-group">
                    <h3>Thông tin cá nhân</h3>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Vai trò:</strong> {renderRoles(user)}</p>
                    <p><strong>Số đơn hàng:</strong> {user?.orders?.length || 0}</p>
                </div>

                <div className="addresses-section">
                    <div className="section-header">
                        <h3>Địa chỉ</h3>
                        <button 
                            className="add-address-btn"
                            onClick={() => setShowAddAddress(true)}
                        >
                            Thêm địa chỉ mới
                        </button>
                    </div>

                    {showAddAddress && (
                        <form onSubmit={handleAddAddress} className="address-form">
                            <input
                                type="text"
                                placeholder="Tên tòa nhà (ít nhất 5 ký tự)"
                                value={newAddress.buildingName}
                                onChange={(e) => setNewAddress({...newAddress, buildingName: e.target.value})}
                                required
                                minLength={5}
                            />
                            <input
                                type="text"
                                placeholder="Đường (ít nhất 5 ký tự)"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                required
                                minLength={5}
                            />
                            <input
                                type="text"
                                placeholder="Thành phố (ít nhất 4 ký tự)"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                required
                                minLength={4}
                            />
                            <input
                                type="text"
                                placeholder="Tỉnh/Thành (ít nhất 2 ký tự)"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                required
                                minLength={2}
                            />
                            <input
                                type="text"
                                placeholder="Mã bưu chính (ít nhất 6 ký tự)"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                                required
                                minLength={6}
                            />
                            <input
                                type="text"
                                placeholder="Quốc gia (ít nhất 2 ký tự)"
                                value={newAddress.country}
                                onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                                required
                                minLength={2}
                            />
                            <div className="form-buttons">
                                <button type="submit">Lưu</button>
                                <button type="button" onClick={() => setShowAddAddress(false)}>Hủy</button>
                            </div>
                        </form>
                    )}

                    <div className="addresses-list">
                        {addresses && addresses.length > 0 ? (
                            addresses.map(address => (
                                <div key={address.addressId} className="address-card">
                                    <p><strong>Tòa nhà:</strong> {address.buildingName}</p>
                                    <p><strong>Đường:</strong> {address.street}</p>
                                    <p><strong>Thành phố:</strong> {address.city}</p>
                                    <p><strong>Tỉnh/Thành:</strong> {address.state}</p>
                                    <p><strong>Quốc gia:</strong> {address.country}</p>
                                    <p><strong>Mã bưu chính:</strong> {address.pincode}</p>
                                    <div className="address-actions">
                                        <button onClick={() => setEditingAddress(address)}>
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDeleteAddress(address.addressId)}>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-addresses">Chưa có địa chỉ nào</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 