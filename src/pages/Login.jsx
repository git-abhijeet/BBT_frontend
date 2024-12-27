import React, { useState } from 'react';
import { loginUser } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const initialFormData = {
        userName: '',
        password: '',
    };
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { data } = await loginUser(formData);
            console.log("🚀 ~ handleLogin ~ data:", data);
            sessionStorage.setItem('token', data.data.token);
            sessionStorage.setItem('user', JSON.stringify(data.data.user));
            navigate('/');
        } catch (err) {
            console.log("🚀 ~ handleLogin ~ err:", err);
            console.error(err);
            alert(err.response.data.message);
            setFormData(initialFormData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <input
                    name="userName"
                    placeholder="Username"
                    value={formData.userName}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 p-2 mb-4 rounded"
                    disabled={loading}
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 p-2 mb-4 rounded"
                    disabled={loading}
                />
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200 relative"
                >
                    {loading ? (
                        <>
                            <span className="opacity-0">Login</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </>
                    ) : (
                        'Login'
                    )}
                </button>
                <p className="mt-4 text-center">
                    Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
}