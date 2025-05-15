import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './OrderDetail.css';
import { FaStar } from 'react-icons/fa';

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(null);
    const [productReviews, setProductReviews] = useState({});

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (order) {
            const reviewStatus = {};
            order.orderItems.forEach(item => {
                reviewStatus[item.productId] = checkIfReviewed(item.productId);
            });
            setProductReviews(reviewStatus);
        }
    }, [order]);

    const fetchOrderDetails = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            if (!user || !token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/api/public/users/${user.email}/orders/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    maxRedirects: 5, // Cho phép tối đa 5 lần chuyển hướng
                    validateStatus: function (status) {
                        return status >= 200 && status < 400; // Chấp nhận status code từ 200-399
                    }
                }
            );

            if (response.data) {
                console.log('Order details response:', response.data);
                setOrder(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Fetch order details error:', error);
            toast.error('Không thể tải chi tiết đơn hàng!');
            setLoading(false);
        }
    };

    const checkIfReviewed = (productId) => {
        const reviewedProducts = JSON.parse(localStorage.getItem('reviewedProducts')) || {};
        return reviewedProducts[`${orderId}-${productId}`];
    };

    const saveReviewStatus = (productId) => {
        const reviewedProducts = JSON.parse(localStorage.getItem('reviewedProducts')) || {};
        reviewedProducts[`${orderId}-${productId}`] = true;
        localStorage.setItem('reviewedProducts', JSON.stringify(reviewedProducts));
        
        setProductReviews(prev => ({
            ...prev,
            [productId]: true
        }));
    };

    const handleReviewSubmit = async (productId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('authToken');

            const response = await axios.post(
                `http://localhost:8080/api/orders/${orderId}/products/${productId}/review?userId=${user.userId}`,
                {
                    rating,
                    comment
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 201) {
                saveReviewStatus(productId);
                alert("Đánh giá sản phẩm thành công!")
                
                toast.success('Đánh giá sản phẩm thành công!', {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#4CAF50',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '8px'
                    }
                });
                
                setSelectedProduct(null);
                setRating(5);
                setComment('');
            }
        } catch (error) {
            console.error('Review error:', error);
            toast.error('Không thể đăng đánh giá!');
        }
    };

    const ReviewForm = ({ product }) => (
        <div className="review-form-overlay">
            <div className="review-form">
                <h3>Đánh giá sản phẩm: {product.productName}</h3>
                <div className="star-rating">
                    {[...Array(5)].map((star, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                />
                                <FaStar
                                    className="star"
                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                    size={30}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(null)}
                                />
                            </label>
                        );
                    })}
                </div>
                <textarea
                    className="review-textarea"
                    placeholder="Nhập đánh giá của bạn..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        outline: 'none'
                    }}
                />
                <div className="review-buttons">
                    <button onClick={() => handleReviewSubmit(product.productId)}>
                        Gửi đánh giá
                    </button>
                    <button onClick={() => setSelectedProduct(null)}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="loading">Đang tải...</div>;
    if (!order) return <div className="error">Không tìm thấy đơn hàng</div>;

    // Tính tổng tiền
    const totalPrice = order.orderItems.reduce((total, item) => {
        const itemPrice = item.price * (1 - (item.discount || 0) / 100);
        return total + (itemPrice * item.quantity);
    }, 0);

    return (
        <div className="order-detail-container">
            <div className="order-detail-header">
                <h2>Chi tiết đơn hàng #{order.orderId}</h2>
                <button className="back-button" onClick={() => navigate('/orders')}>
                    Quay lại
                </button>
            </div>

            <div className="order-info-section">
                <div className="order-status-info">
                    <p>Trạng thái: <span className="status">{order.orderStatus}</span></p>
                    <p>Ngày đặt:  {new Date().toLocaleString('vi-VN')}</p>
                    <p>Phương thức thanh toán: {order.payment.paymentMethod}</p>
                </div>

                <div className="order-items-list">
                    <h3>Sản phẩm</h3>
                    {order.orderItems.map(item => {
                        const itemPrice = item.price * (1 - (item.discount || 0) / 100);
                        
                        return (
                            <div key={item.orderItemId} className="order-item">
                                <img 
                                    src={`http://localhost:8080/api/public/products/image/${item.image}`}
                                    alt={item.productName}
                                    onError={(e) => {
                                        e.target.src = '/default-product-image.png';
                                    }}
                                />
                                <div className="item-details">
                                    <h4>{item.productName}</h4>
                                    <p>Số lượng: {item.quantity}</p>
                                    <p>Giá: ${item.price.toFixed(2)}</p>
                                    <p>Tổng: ${(itemPrice * item.quantity).toFixed(2)}</p>
                                </div>
                                {productReviews[item.productId] ? (
                                    <button 
                                        className="review-button reviewed"
                                        disabled
                                    >
                                        Đã đánh giá
                                    </button>
                                ) : (
                                    <button 
                                        className="review-button"
                                        onClick={() => setSelectedProduct(item)}
                                    >
                                        Đánh giá sản phẩm
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="order-summary">
                    <h3>Tổng đơn hàng</h3>
                    <p className="total-amount">${totalPrice.toFixed(2)}</p>
                </div>
            </div>
            {selectedProduct && !productReviews[selectedProduct.productId] && (
                <ReviewForm product={selectedProduct} />
            )}
        </div>
    );
};

const styles = `
.review-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.review-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
}

.star-rating {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.star-rating input[type="radio"] {
    display: none;
}

.star {
    cursor: pointer;
    transition: color 200ms;
}

.review-textarea {
    width: 100% !important;
    min-height: 100px !important;
    padding: 12px !important;
    margin-bottom: 15px !important;
    border: 1px solid #ddd !important;
    border-radius: 4px !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    resize: vertical !important;
    font-family: inherit !important;
    box-sizing: border-box !important;
    outline: none !important;
    transition: border-color 0.2s ease !important;
}

.review-textarea:focus {
    border-color: #007bff !important;
}

.review-buttons {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.review-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.review-buttons button:first-child {
    background: #007bff;
    color: white;
}

.review-buttons button:last-child {
    background: #6c757d;
    color: white;
}

.review-button {
    margin-top: 10px;
    padding: 8px 16px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.review-button.reviewed {
    background: #6c757d !important;
    cursor: not-allowed !important;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default OrderDetail; 