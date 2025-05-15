import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('keyword');

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(`http://localhost:8080/api/public/products/keyword/${searchQuery}`, {
                    params: {
                        pageNumber: 1,
                        pageSize: 10,
                        sortBy: 'price',
                        sortOrder: 'desc'
                    }
                });
                
                if (response.data && response.data.content) {
                    setProducts(response.data.content);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
                setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery) {
            fetchSearchResults();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [searchQuery]);

    const formatPrice = (price) => {
        return Math.round(price).toLocaleString('vi-VN');
    };

    if (loading) {
        return <div className="loading">Đang tìm kiếm...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="search-results-container">
            <div className="search-header">
                <h2>Kết quả tìm kiếm cho: "{searchQuery}"</h2>
                <p>Tìm thấy {products.length} sản phẩm</p>
            </div>

            <div className="products-grid">
                {products.length > 0 ? (
                    products.map(product => (
                        <div className="product-card" key={product.productId}>
                            <Link to={`/Detail/${product.productId}`} className="product-link">
                                <div className="product-image-container">
                                    <img 
                                        src={`http://localhost:8080/api/public/products/image/${product.image}`}
                                        alt={product.productName}
                                        className="product-image"
                                    />
                                    {product.discount > 0 && (
                                        <span className="discount-badge">-{product.discount}%</span>
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.productName}</h3>
                                    <div className="product-price">
                                        <span className="current-price">{formatPrice(product.price)}₫</span>
                                        {product.discount > 0 && (
                                            <span className="original-price">
                                                {formatPrice(product.price * (100 + product.discount) / 100)}₫
                                            </span>
                                        )}
                                    </div>
                                    <div className="product-category">{product.category?.name}</div>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchQuery}"</p>
                        <p>Vui lòng thử lại với từ khóa khác</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults; 