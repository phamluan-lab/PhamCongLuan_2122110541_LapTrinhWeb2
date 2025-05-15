import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GET_ID, GET_ALL } from '../api/apiService';
import './ProductDetail.css';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [productImages, setProductImages] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { productId } = useParams();
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!productId) {
                    console.error('Product ID is missing');
                    setLoading(false);
                    return;
                }

                // Fetch main product
                const productResponse = await GET_ID('public/products', productId);
                console.log('Product Response:', productResponse);
                setProduct(productResponse);

                // Fetch product images
                try {
                    const imagesResponse = await axios.get(
                        `http://localhost:8080/api/public/products/${productId}/images`
                    );
                    console.log('Images Response:', imagesResponse.data);
                    setProductImages(imagesResponse.data);
                    if (imagesResponse.data && imagesResponse.data[0]) {
                        setSelectedImage(imagesResponse.data[0].image1);
                    }
                } catch (error) {
                    console.error('Failed to fetch product images:', error);
                }

                // Fetch related products
                if (productResponse?.category?.id) {
                    const params = {
                        pageNumber: 0,
                        pageSize: 4,
                        sortBy: 'productId',
                        sortOrder: 'asc'
                    };
                    const relatedResponse = await GET_ALL(`categories/${productResponse.category.id}/products`, params);
                    const filteredProducts = relatedResponse.content.filter(
                        item => item.productId !== productResponse.productId
                    );
                    setRelatedProducts(filteredProducts);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                if (!productId) return;

                const response = await axios.get(
                    `http://localhost:8080/api/products/${productId}/reviews`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            
                             'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    }
                );

                if (response.data) {
                    setReviews(response.data);
                    
                    // Kiểm tra mảng có phần tử mới tính
                    if (response.data.length > 0) {
                        const total = response.data.reduce((sum, review) => sum + review.rating, 0);
                        setAverageRating(total / response.data.length);
                        setTotalReviews(response.data.length);
                    } else {
                        setAverageRating(0);
                        setTotalReviews(0);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
                // Set giá trị mặc định nếu có lỗi
                setReviews([]);
                setAverageRating(0);
                setTotalReviews(0);
            }
        };

        fetchReviews();
    }, [productId]); // Chỉ phụ thuộc vào productId

    const handleQuantityChange = (value) => {
        setQuantity(prev => Math.max(1, prev + value));
    };

    const handleAddToCart = async () => {
        try {
            const userStr = localStorage.getItem('user');
            const token = localStorage.getItem('authToken');

            if (!userStr || !token) {
                toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
                navigate('/login');
                return;
            }

            const user = JSON.parse(userStr);
            if (!user || !user.GH || !user.GH.cartId) {
                toast.error('Không tìm thấy thông tin giỏ hàng!');
                return;
            }

            // Gửi request thêm sản phẩm vào giỏ hàng
            await axios.post(
                `http://localhost:8080/api/public/carts/${user.GH.cartId}/products/${product.productId}/quantity/${quantity}`,
                null,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (error) {
            console.error('Add to cart error:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
                navigate('/login');
            } else {
                toast.error('Không thể thêm sản phẩm vào giỏ hàng!');
            }
        }
    };

    const StarRating = ({ rating }) => {
        return (
            <div className="star-display">
                {[...Array(5)].map((_, index) => (
                    <FaStar
                        key={index}
                        className="star"
                        color={index < Math.round(rating) ? "#ffc107" : "#e4e5e9"}
                        size={20}
                    />
                ))}
            </div>
        );
    };

    const handleImageChange = (index) => {
        setCurrentImageIndex(index);
    };

    const getCurrentImage = () => {
        if (!productImages) return product?.image;
        
        switch(currentImageIndex) {
            case 1:
                return productImages.image1;
            case 2:
                return productImages.image2;
            case 3:
                return productImages.image3;
            default:
                return product.image;
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (!product) return <div className="container mt-5">Product not found</div>;

    return (
        <div className="product-detail-wrapper">
            <div className="product-detail-container">
                <section className="product-detail-breadcrumb">
                    <div className="container">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item">
                                <a href={`/category/${product.category.id}`}>
                                    {product.category.name || 'Category'}
                                </a>
                            </li>
                            <li className="breadcrumb-item active">{product.productName}</li>
                        </ol>
                    </div>
                </section>

                <section className="product-detail-content">
                    <div className="container">
                        <div className="row">
                            <aside className="col-md-6">
                                <div className="product-detail-gallery">
                                    <div className="product-detail-images">
                                        <div className="product-detail-img-wrap main-image">
                                            <img 
                                                src={`http://localhost:8080/api/public/products/image/${selectedImage || product.image}`}
                                                alt={product.productName}
                                                className="detail-product-image"
                                            />
                                        </div>
                                        <div className="additional-images">
                                            {productImages && productImages[0] && (
                                                <>
                                                    <div 
                                                        className={`product-detail-img-wrap additional-image ${selectedImage === productImages[0].image1 ? 'active' : ''}`}
                                                        onClick={() => handleImageClick(productImages[0].image1)}
                                                    >
                                                        <img 
                                                            src={`http://localhost:8080/api/public/products/image/${productImages[0].image1}`}
                                                            alt={`${product.productName} - Image 1`}
                                                            className="detail-product-image"
                                                        />
                                                    </div>
                                                    <div 
                                                        className={`product-detail-img-wrap additional-image ${selectedImage === productImages[0].image2 ? 'active' : ''}`}
                                                        onClick={() => handleImageClick(productImages[0].image2)}
                                                    >
                                                        <img 
                                                            src={`http://localhost:8080/api/public/products/image/${productImages[0].image2}`}
                                                            alt={`${product.productName} - Image 2`}
                                                            className="detail-product-image"
                                                        />
                                                    </div>
                                                    <div 
                                                        className={`product-detail-img-wrap additional-image ${selectedImage === productImages[0].image3 ? 'active' : ''}`}
                                                        onClick={() => handleImageClick(productImages[0].image3)}
                                                    >
                                                        <img 
                                                            src={`http://localhost:8080/api/public/products/image/${productImages[0].image3}`}
                                                            alt={`${product.productName} - Image 3`}
                                                            className="detail-product-image"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            <main className="col-md-6">
                                <article className="product-detail-info">
                                    <h2 className="detail-product-title">{product.productName}</h2>
                                    
                                    {product.discount > 0 && (
                                        <div className="detail-discount-badge">
                                            -{product.discount}% OFF
                                        </div>
                                    )}

                                    <div className="detail-price-info">
                                        <span className="detail-current-price">
                                            ${product.price}
                                        </span>
                                        {product.discount > 0 && (
                                            <span className="detail-original-price">
                                                ${(product.price * (100 + product.discount) / 100).toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="detail-description">
                                        <h5>Description</h5>
                                        <p>{product.description || 'No description available'}</p>
                                    </div>

                                    <div className="detail-actions">
                                        <div className="detail-quantity-selector">
                                            <button 
                                                className="btn btn-light"
                                                onClick={() => handleQuantityChange(-1)}
                                            >
                                                -
                                            </button>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                min="1" 
                                            />
                                            <button 
                                                className="btn btn-light"
                                                onClick={() => handleQuantityChange(1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            className="detail-add-to-cart"
                                            onClick={handleAddToCart}
                                        >
                                            <i className="fas fa-shopping-cart"></i>
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>

                                    <div className="rating-summary">
                                        <StarRating rating={averageRating || 0} />
                                        <span className="rating-stats">
                                            {(averageRating || 0).toFixed(1)} / 5 ({totalReviews} đánh giá)
                                        </span>
                                    </div>
                                </article>
                            </main>
                        </div>
                    </div>
                </section>
            </div>

            <section className="reviews-section">
                <div className="container">
                    <h3 className="reviews-title">Đánh giá từ khách hàng</h3>
                    <div className="reviews-container">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <h4 className="reviewer-name">{review.userName || 'Anonymous'}</h4>
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <StarRating rating={review.rating || 0} />
                                    </div>
                                    <div className="review-content">
                                        <p>{review.comment || 'Không có bình luận'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Chưa có đánh giá nào</p>
                        )}
                    </div>
                </div>
            </section>

           
        </div>
    );
};

const styles = `
.rating-summary {
    display: flex;
    align-items: center;
    margin: 15px 0;
    gap: 10px;
}

.rating-stats {
    color: #666;
    font-size: 14px;
}

.star-display {
    display: flex;
    gap: 2px;
}

.reviews-section {
    padding: 40px 0;
    background: #f9f9f9;
}

.reviews-title {
    margin-bottom: 20px;
    font-size: 24px;
}

.review-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.reviewer-info {
    display: flex;
    flex-direction: column;
}

.reviewer-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.review-date {
    font-size: 12px;
    color: #666;
}

.review-content {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
}

.related-product-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.related-product-card:hover {
    transform: translateY(-5px);
}

.related-product-link {
    text-decoration: none;
    color: inherit;
}

.related-product-image {
    position: relative;
    padding-bottom: 100%;
    overflow: hidden;
    margin-bottom: 10px;
}

.related-product-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.related-product-info {
    padding: 10px 0;
}

.related-product-name {
    font-size: 14px;
    margin: 0 0 10px;
    color: #333;
    height: 40px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.related-product-price {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.current-price {
    font-size: 16px;
    font-weight: 600;
    color: #e94560;
}

.original-price {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
}

.discount-badge {
    background: #e94560;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ProductDetail;
