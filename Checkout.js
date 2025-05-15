import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
    const [orderData, setOrderData] = useState(null);
    const [paymentId, setPaymentId] = useState(1); // Default là thanh toán tiền mặt (id: 1)
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy dữ liệu từ localStorage
        const checkoutData = localStorage.getItem('checkoutItems');
        if (!checkoutData) {
            toast.error('Không có thông tin đơn hàng!');
            navigate('/cart');
            return;
        }

        try {
            const parsedData = JSON.parse(checkoutData);
            setOrderData(parsedData);
            setLoading(false);
        } catch (error) {
            console.error('Parse checkout data error:', error);
            toast.error('Lỗi khi xử lý thông tin đơn hàng!');
            navigate('/cart');
        }
    }, [navigate]);

    const handleMomoPayment = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            if (!user || !token) {
                toast.error('Vui lòng đăng nhập để tiếp tục!');
                navigate('/login');
                return;
            }

            setLoading(true);

            // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi thanh toán thành công
            const pendingOrder = {
                userInfo: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    phone: '0984474998',
                    address: 'TPHCM'
                },
                items: orderData.items,
                totalAmount: orderData.totalAmount,
                paymentMethod: 'momo',
                note: 'MOMO'
            };
            localStorage.setItem('pending_order', JSON.stringify(pendingOrder));

            // Gọi API thanh toán MoMo
            const amount = orderData.totalAmount.toString().replace(/[.,VND\s]/g, '');
            const momoResponse = await axios.post('http://localhost:5001/payment', {
                amount: amount
            });

            if (momoResponse.data && momoResponse.data.payUrl) {
                // Chuyển hướng đến trang thanh toán MoMo
                window.location.href = momoResponse.data.payUrl;
            } else {
                throw new Error('Không nhận được URL thanh toán từ MoMo');
            }
        } catch (error) {
            console.error('Lỗi thanh toán MoMo:', error);
            toast.error('Không thể thực hiện thanh toán MoMo! Vui lòng thử lại.');
            localStorage.removeItem('pending_order');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (paymentId === 2) {
            // Thanh toán MoMo
            await handleMomoPayment();
        } else {
            // Thanh toán COD - giữ nguyên logic cũ
            if (!phone.trim()) {
                toast.error('Vui lòng nhập số điện thoại!');
                return;
            }
            if (!address.trim()) {
                toast.error('Vui lòng nhập địa chỉ giao hàng!');
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = localStorage.getItem('authToken');

                if (!user || !token) {
                    toast.error('Vui lòng đăng nhập để tiếp tục!');
                    navigate('/login');
                    return;
                }

                setLoading(true);
                const response = await axios.post(
                    `http://localhost:8080/api/public/users/${user.email}/carts/${user.GH.cartId}/payments/${paymentId}/phone/${phone}/address/${address}/order`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 201) {
                    // Gửi email xác nhận đơn hàng cho COD
                    try {
                        await axios.post('http://localhost:4500/send-email', {
                            userEmail: user.email,
                            orderDetails: orderData.items,
                            totalAmount: orderData.totalAmount,
                            orderId: response.data.orderId
                        });
                        toast.success('Đặt hàng thành công và email xác nhận đã được gửi!');
                        alert(`Đặt hàng thành công! Email xác nhận đã được gửi đến ${user.email}`);
                    } catch (emailError) {
                        console.error('Lỗi khi gửi email:', emailError);
                        toast.success('Đặt hàng thành công nhưng không thể gửi email xác nhận!');
                        alert('Đặt hàng thành công! Nhưng không thể gửi email xác nhận.');
                    }

                    localStorage.removeItem('checkoutItems');
                    navigate('/orders');
                }
            } catch (error) {
                console.error('Place order error:', error);
                toast.error(error.response?.data?.message || 'Không thể đặt hàng! Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <div className="loading">Đang xử lý...</div>;
    if (!orderData) return null;

    return (
        <div className="checkout-container">
            <div className="checkout-content">
                <div className="checkout-summary">
                    <h2>Xác nhận đơn hàng</h2>
                    <div className="order-items">
                        {orderData.items.map(item => (
                            <div key={item.productId} className="order-item">
                                <img 
                                    src={`http://localhost:8080/api/public/products/image/${item.image}`}
                                    alt={item.productName} 
                                />
                                <div className="item-info">
                                    <h3>{item.productName}</h3>
                                    <p className="quantity">Số lượng: {item.quantity}</p>
                                    <p className="price">${item.price}</p>
                                    <p className="subtotal">Thành tiền: ${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="order-total">
                        <h3>Tổng cộng</h3>
                        <p className="total-amount">${orderData.totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                {/* Chỉ hiển thị form thông tin khi chọn thanh toán COD */}
                {paymentId === 1 && (
                    <div className="shipping-info">
                        <h2>Thông tin giao hàng</h2>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại của bạn"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Địa chỉ giao hàng</label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Nhập địa chỉ giao hàng chi tiết"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="payment-section">
                    <h2>Phương thức thanh toán</h2>
                    <div className="payment-methods">
                        <label className="payment-method">
                            <input
                                type="radio"
                                value="1"
                                checked={paymentId === 1}
                                onChange={(e) => setPaymentId(Number(e.target.value))}
                            />
                            <span className="method-name">Thanh toán khi nhận hàng</span>
                        </label>
                        <label className="payment-method">
                            <input
                                type="radio"
                                value="2"
                                checked={paymentId === 2}
                                onChange={(e) => setPaymentId(Number(e.target.value))}
                            />
                            <span className="method-name">Thanh toán qua MoMo</span>
                        </label>
                    </div>

                    <button 
                        className={`place-order-button ${paymentId === 2 ? 'momo-button' : ''}`}
                        onClick={handlePlaceOrder}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : (paymentId === 2 ? 'Thanh toán qua MoMo' : 'Đặt hàng')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 