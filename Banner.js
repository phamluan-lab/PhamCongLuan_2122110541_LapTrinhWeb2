import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Banner.css'; // Tạo file CSS riêng cho Banner

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/public/banners');
                console.log('Banner Response:', response.data);
                setBanners(response.data);
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <section className="banner-section">
            <div className="container">
                <Carousel fade interval={3000} indicators={true} controls={true}>
                    {banners.map((banner) => (
                        <Carousel.Item key={banner.id}>
                            <img
                                className="d-block w-100 banner-image"
                                src={`http://localhost:8080/api/public/banners/image/${banner.image}`}
                                alt={banner.name}
                            />
                            <Carousel.Caption className="carousel-caption">
                               
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>
        </section>
    );
};

export default Banner; 