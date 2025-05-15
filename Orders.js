import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            if (!user || !token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/api/public/users/${user.email}/orders`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                console.log('Orders response:', response.data);
                setOrders(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Không thể tải danh sách đơn hàng!');
            setLoading(false);
        }
    };

    const viewOrderDetails = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const getPaymentMethodText = (order) => {
        if (!order.payment) return 'Chưa có thông tin';
        return order.payment.paymentMethod || 'Chưa có thông tin';
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="orders-container">
            <h2>Đơn hàng của bạn</h2>
            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>Bạn chưa có đơn hàng nào</p>
                    <button onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => {
                        // Tính tổng tiền dựa trên price và discount
                        const totalPrice = order.orderItems.reduce((total, item) => {
                            const itemPrice = item.price * (1 - (item.discount || 0) / 100);
                            return total + (itemPrice * item.quantity);
                        }, 0);

                        return (
                            <div key={order.orderId} className="order-card">
                                <div className="order-header">
                                    <h3>Đơn hàng #{order.orderId}</h3>
                                    <span className="order-date">
                                        {new Date(order.orderDate).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="order-info">
                                    <p className="order-status">Trạng thái: {order.orderStatus}</p>
                                    <p className="order-total">
                                        Tổng tiền: {totalPrice.toLocaleString('vi-VN')}đ
                                    </p>
                                    <p className="payment-method">
                                        Phương thức thanh toán: {getPaymentMethodText(order)}
                                    </p>
                                </div>
                                <button 
                                    className="view-details-button"
                                    onClick={() => viewOrderDetails(order.orderId)}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;