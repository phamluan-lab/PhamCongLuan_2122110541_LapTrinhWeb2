import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            if (!user || !token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/api/public/users/${user.email}/carts/${user.GH.cartId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    withCredentials: true,
                    maxRedirects: 0,
                    validateStatus: function (status) {
                        return status >= 200 && status < 400;
                    }
                }
            );

            console.log('Cart Response:', response.data);

            if (response.data && response.data.products) {
                // Sử dụng cartQuantity từ response
                const mergedProducts = Object.values(
                    response.data.products.reduce((acc, current) => {
                        if (!acc[current.productId]) {
                            acc[current.productId] = {
                                ...current,
                                quantity: current.cartQuantity // Sử dụng cartQuantity từ DB
                            };
                        } else {
                            // Cập nhật quantity nếu sản phẩm đã tồn tại
                            acc[current.productId].quantity = current.cartQuantity;
                        }
                        return acc;
                    }, {})
                );

                console.log('Merged Products:', mergedProducts);
                setCartItems(mergedProducts);
            } else {
                setCartItems([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Fetch cart error:', error);
            toast.error('Không thể tải giỏ hàng!');
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            if (newQuantity < 1) {
                // Nếu số lượng < 1, xóa sản phẩm
                await handleRemoveItem(productId);
                return;
            }

            const response = await axios.put(
                `http://localhost:8080/api/public/carts/${user.GH.cartId}/products/${productId}/quantity/${newQuantity}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                toast.success('Đã cập nhật số lượng!');
                fetchCartItems(); // Tải lại giỏ hàng sau khi cập nhật
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            toast.error('Không thể cập nhật số lượng!');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            const response = await axios.delete(
                `http://localhost:8080/api/public/carts/${user.GH.cartId}/product/${productId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
                fetchCartItems(); // Tải lại giỏ hàng sau khi xóa
            }
        } catch (error) {
            console.error('Remove item error:', error);
            toast.error('Không thể xóa sản phẩm!');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }
        // Lưu thông tin giỏ hàng vào localStorage để Checkout có thể sử dụng
        localStorage.setItem('checkoutItems', JSON.stringify({
            items: cartItems,
            totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        }));
        navigate('/checkout');
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="cart-container">
            <h2>Giỏ hàng của bạn</h2>
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Giỏ hàng trống</p>
                    <button onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.productId} className="cart-item">
                                <img 
                                    src={`http://localhost:8080/api/public/products/image/${item.image}`}
                                    alt={item.productName} 
                                />
                                <div className="item-details">
                                    <h3>{item.productName}</h3>
                                    <p className="price">${item.price || 0}</p>
                                    <div className="quantity-controls">
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        className="remove-button"
                                        onClick={() => handleRemoveItem(item.productId)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h3>Tổng cộng</h3>
                        <p className="total">
                            ${cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                        </p>
                        <button 
                            className="checkout-button" 
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                        >
                            Thanh toán
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart; 