import React from 'react';
import sliderImage from '../../assets/images/items/1.jpg'; 

const Slider = () => (
    <section className="section-main padding-y">
        <div className="container">
            <div className="row">
                {/* Left Sidebar */}
                <div className="col-md-3">
                    <h5 className="title-section">MY MARKETS</h5>
                    <nav className="nav-category">
                        <ul className="menu-category">
                            <li><a href="#">Fashion and clothes</a></li>
                            <li><a href="#">Automobile and motors</a></li>
                            <li><a href="#">Gardening and agriculture</a></li>
                            <li><a href="#">Electronics and tech</a></li>
                            <li><a href="#">Packaginf and printing</a></li>
                            <li><a href="#">Home and kitchen</a></li>
                            <li><a href="#">Digital goods</a></li>
                            <li><a href="#">More items</a></li>
                        </ul>
                    </nav>
                </div>

                {/* Center Slider */}
                <div className="col-md-6">
                    <div className="slider-wrapper">
                        <img 
                            src={sliderImage}
                            alt="Slider" 
                            className="w-100 rounded"
                        />
                    </div>
                </div>

                {/* Right Popular Category */}
                <div className="col-md-3">
                    <h5 className="title-section">Popular category</h5>
                    <div className="category-items">
                        <div className="category-item d-flex align-items-center mb-3">
                            <div className="text">
                                <h6>Men clothing</h6>
                                <a href="#" className="btn btn-sm btn-light">Source now</a>
                            </div>
                            <img src="/images/items/category-1.jpg" className="img-sm" alt="" />
                        </div>
                        <div className="category-item d-flex align-items-center mb-3">
                            <div className="text">
                                <h6>Winter clothing</h6>
                                <a href="#" className="btn btn-sm btn-light">Source now</a>
                            </div>
                            <img src="/images/items/category-2.jpg" className="img-sm" alt="" />
                        </div>
                        <div className="category-item d-flex align-items-center">
                            <div className="text">
                                <h6>Home inventory</h6>
                                <a href="#" className="btn btn-sm btn-light">Source now</a>
                            </div>
                            <img src="/images/items/category-3.jpg" className="img-sm" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default Slider;