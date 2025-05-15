import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaTags, FaImages, FaPercent, FaComments, FaSignOutAlt } from 'react-icons/fa';
import './AdminApp.css';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import CategoryList from './pages/CategoryList';
import CategoryCreate from './pages/CategoryCreate';
import CategoryEdit from './pages/CategoryEdit';
import BannerList from './pages/BannerList';
import BannerCreate from './pages/BannerCreate';
import BannerEdit from './pages/BannerEdit';
import ProductSaleList from './pages/ProductSaleList';
import ProductSaleCreate from './pages/ProductSaleCreate';
import ProductSaleEdit from './pages/ProductSaleEdit';


function AdminApp() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('authToken');
            navigate('/login');
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>Alistyle Admin</h2>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin" className="nav-item">
                        <FaHome /> <span>Trang chủ</span>
                    </Link>
                    <Link to="/admin/products" className="nav-item">
                        <FaBox /> <span>Sản phẩm</span>
                    </Link>
                    <Link to="/admin/categories" className="nav-item">
                        <FaTags /> <span>Danh mục</span>
                    </Link>
                    <Link to="/admin/banners" className="nav-item">
                        <FaImages /> <span>Banners</span>
                    </Link>
                   
                   
                </nav>
                <button className="btn-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> <span>Đăng xuất</span>
                </button>
            </aside>
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Alistyle Perfume Admin</h1>
                </header>
                <div className="admin-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/create" element={<ProductCreate />} />
                        <Route path="/products/edit/:id" element={<ProductEdit />} />
                        <Route path="/categories" element={<CategoryList />} />
                        <Route path="/categories/create" element={<CategoryCreate />} />
                        <Route path="/categories/edit/:id" element={<CategoryEdit />} />
                        <Route path="/banners" element={<BannerList />} />
                        <Route path="/banners/create" element={<BannerCreate />} />
                        <Route path="/banners/edit/:id" element={<BannerEdit />} />
                      
                     
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default AdminApp; 