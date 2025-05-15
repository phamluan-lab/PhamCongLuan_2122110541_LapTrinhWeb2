import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Deal.css';

const Deal = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(0);

    // Format price function
    const formatPrice = (price) => {
        return Math.round(price).toLocaleString('vi-VN');
    };

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/api/public/product-sales');
                console.log('Sales Response:', response.data);
                setDeals(response.data);
            } catch (error) {
                console.error('Failed to fetch deals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    useEffect(() => {
        const totalSeconds = 4 * 24 * 60 * 60 + 12 * 60 * 60 + 58 * 60 + 2;
        setCountdown(totalSeconds);

        const interval = setInterval(() => {
            setCountdown(prevCountdown => {
                if (prevCountdown <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = seconds % 60;
        return { days, hours, minutes, secs };
    };

    const { days, hours, minutes, secs } = formatTime(countdown);

    if (loading) return <div>Loading...</div>;

    return (
        <section className="section-deals padding-y">
            <div className="container">
                <div className="deals-header mb-4">
                    <h3>Deals and offers</h3>
                    <p className="text-muted">Sản phẩm đang giảm giá</p>
                    
                    <div className="countdown d-flex gap-2">
                        <div className="timer-item">
                            <span className="number">{days}</span>
                            <span className="text">Days</span>
                        </div>
                        <div className="timer-item">
                            <span className="number">{hours}</span>
                            <span className="text">Hours</span>
                        </div>
                        <div className="timer-item">
                            <span className="number">{minutes}</span>
                            <span className="text">Min</span>
                        </div>
                        <div className="timer-item">
                            <span className="number">{secs}</span>
                            <span className="text">Sec</span>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {deals.length > 0 ? (
                        deals.map(deal => (
                            <div className="col-xl-3 col-lg-3 col-md-4 col-6" key={deal.id}>
                                <div className="card deal-card">
                                    <Link to={`/Detail/${deal.productId}`} className="img-wrap">
                                        <img 
                                            src={`http://localhost:8080/api/public/products/image/${deal.productImage}`}
                                            alt={deal.productName}
                                            className="product-image"
                                        />
                                        <div className="discount-badge">
                                            -{deal.discount}%
                                        </div>
                                    </Link>
                                    <div className="card-body text-center">
                                        <h6 className="card-title">{deal.productName}</h6>
                                        <div className="price-wrap">
                                            <span className="price">${formatPrice(deal.salePrice)}</span>
                                            <span className="original-price" style={{ textDecoration: 'line-through', color: '#888', marginLeft: 8 }}>${formatPrice(deal.originalPrice)}</span>
                                        </div>
                                        <div className="sale-dates">
                                            <small>Sale: {new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <p>Không có sản phẩm giảm giá.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Deal;