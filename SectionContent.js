import React, { useState, useEffect } from "react";
import { LOGIN, GET_USER_INFO } from "../../api/apiService";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaUser, FaLock } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import './Login.css';

const SectionContent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUserName } = useUser();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        let token = params.get('token');
        const error = params.get('error');
        
        console.log("Current location:", location);
        console.log("Search params:", window.location.search);
        console.log("Token from URL:", token);
        
        if (error) {
            setError('Đăng nhập Google thất bại');
            return;
        }

        if (token) {
            setIsLoading(true);
            
            try {
                // Lưu token
                localStorage.setItem('authToken', token);
                console.log("Token saved to localStorage");
                
                // Giải mã token để lấy email
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const emailFromToken = payload.email;
                    console.log("Email from token:", emailFromToken);
                    
                    // Lấy thông tin user
                    const fetchUserInfo = async () => {
                        try {
                            console.log("Fetching user info for email:", emailFromToken);
                            const userResponse = await GET_USER_INFO(emailFromToken);
                            console.log("User Response:", userResponse);
                            
                            if (userResponse) {
                                const userData = {
                                    userId: userResponse.userId,
                                    firstName: userResponse.firstName,
                                    lastName: userResponse.lastName,
                                    email: emailFromToken,
                                    cartId: userResponse.cart?.cartId,
                                    GH: userResponse.cart,
                                    roles: userResponse.roles
                                };
                                
                                console.log("Saving user data:", userData);
                                localStorage.setItem('user', JSON.stringify(userData));
                                updateUserName(userResponse.firstName);
                                
                                // Chuyển hướng về trang chủ
                                navigate('/', { replace: true });
                            }
                        } catch (error) {
                            console.error('Error fetching user info:', error);
                            setError('Không thể lấy thông tin người dùng. Vui lòng thử lại.');
                            localStorage.removeItem('authToken');
                        } finally {
                            setIsLoading(false);
                        }
                    };

                    fetchUserInfo();
                } else {
                    throw new Error('Invalid token format');
                }
            } catch (error) {
                console.error('Error processing token:', error);
                setError('Token không hợp lệ');
                setIsLoading(false);
                localStorage.removeItem('authToken');
            }
        }
    }, [location, navigate, updateUserName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const loginResponse = await LOGIN({ email, password });
            console.log("Login Response:", loginResponse);

            if (loginResponse && loginResponse.data) {
                const token = loginResponse.data['jwt-token'];
                if (token) {
                    localStorage.setItem('authToken', token);
                    try {
                        const userResponse = await GET_USER_INFO(email);
                        console.log("User Response:", userResponse);

                        if (userResponse) {
                            const userData = {
                                userId: userResponse.userId,
                                firstName: userResponse.firstName,
                                lastName: userResponse.lastName,
                                email: userResponse.email,
                                cartId: userResponse.cart?.cartId,
                                GH: userResponse.cart,
                                roles: userResponse.roles
                            };
                            localStorage.setItem('user', JSON.stringify(userData));
                            updateUserName(userResponse.firstName);
                            navigate('/');
                        }
                    } catch (userError) {
                        console.error('Error fetching user info:', userError);
                        setError('Không thể lấy thông tin người dùng');
                        localStorage.removeItem('authToken');
                    }
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Đăng nhập thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Đăng nhập</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                    <div className="google-login-container">
                        <button 
                            type="button" 
                            className="google-login-button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" />
                            Đăng nhập với Google
                        </button>
                    </div>
                    <div className="additional-links">
                        <Link to="/register" className="register-link">
                            Chưa có tài khoản? Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SectionContent;