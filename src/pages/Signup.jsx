// src/pages/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

const Signup = () => {
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const validate = () => {
        if (!form.full_name || !form.email || !form.phone_number || !form.password) {
            setError('All fields are required.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Create Your Account</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    name="full_name"
                    placeholder="Full Name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="phone_number"
                    placeholder="Phone Number"
                    value={form.phone_number}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                {error && <div className="form-error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
            <p className="auth-footer">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Signup;
