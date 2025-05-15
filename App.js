import "./assets/sass/app.scss"; 
import Header from './layouts/Header' 
import Footer from './layouts/Footer' 
import Main from './layouts/Main' 
import 'bootstrap/dist/css/bootstrap.min.css';
import AllProducts from './pages/AllProducts';
import CategoryProducts from './pages/CategoryProducts';
import { Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import React from 'react';
import Post from './pages/Post';
import CreatePost from './pages/CreatePost';
import AdminApp from './admin/AdminApp';
import SectionContent from "./pages/home/SectionContent";
import Register from "./pages/register/Register";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Order from "./pages/Orders";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import MomoCallback from './pages/MomoCallback';
import SearchResults from './pages/SearchResults';

function App() { 
    return (
        <UserProvider>
            <CartProvider>
                <Routes>
                    {/* Admin routes */}
                    <Route path="/admin/*" element={<AdminApp />} />
                    
                    {/* Client routes */}
                    <Route path="/*" element={
                        <div> 
                            <Header /> 
                            <Routes>
                                <Route path="/" element={<Main />} />
                                <Route path="/posts" element={<Post />} />
                                <Route path="/posts/create" element={<CreatePost />} />
                                <Route path="/orders" element={<Order />} />
                                <Route path="/products" element={<AllProducts />} />
                                <Route path="/search" element={<SearchResults />} />
                                <Route path="/login" element={<SectionContent />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/category/:categoryId" element={<CategoryProducts />} />
                                <Route path="/detail/:productId" element={<ProductDetail />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/orders/:orderId" element={<OrderDetail />} />
                                <Route path="/order" element={<MomoCallback />} />
                            </Routes>
                            <Footer /> 
                        </div>
                    } />
                </Routes>
            </CartProvider>
        </UserProvider>
    ); 
} 

export default App;
