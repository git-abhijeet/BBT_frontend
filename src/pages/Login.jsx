import React, { useState } from 'react';
import { loginUser } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
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
            const { data } = await loginUser(formData);
            console.log("🚀 ~ handleLogin ~ data:", data);
            sessionStorage.setItem('token', data.data.token);
            sessionStorage.setItem('user', JSON.stringify(data.data.user));
            navigate('/');
        } catch (err) {
            console.log("🚀 ~ handleLogin ~ err:", err)
            console.error(err);
            alert(err.response.data.message);
            setFormData(initialFormData);
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
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 p-2 mb-4 rounded"
                />
                <button onClick={handleLogin} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200">
                    Login
                </button>
                <p className="mt-4 text-center">
                    Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
}