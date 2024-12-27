import React, { useState } from 'react';
import { signupUser } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
    const navigate = useNavigate();
    const initialFormData = {
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        mobileNum: '',
    };
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        try {
            const response = await signupUser(formData);
            console.log("🚀 ~ handleSignup ~ response:", response);
            alert('Signup successful. Check your email for password.');
            navigate('/login');
        } catch (err) {
            console.log("🚀 ~ handleSignup ~ err asdasd:", err)
            // console.error(err);
            alert(err.response.data.message);
            setFormData(initialFormData); // Reset form data
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
                {Object.keys(formData).map((key) => (
                    <input
                        key={key}
                        name={key}
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={formData[key]}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 p-2 mb-4 rounded"
                    />
                ))}
                <button onClick={handleSignup} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">
                    Signup
                </button>
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
}