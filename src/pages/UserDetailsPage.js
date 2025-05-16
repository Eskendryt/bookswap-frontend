import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserDetailsPage.css';

const UserDetailsPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`)
            .then(res => setUser(res.data))
            .catch(err => console.error('Error fetching user:', err));
    }, [userId]);

    if (!user) return <div className="user-details-loading">Loading user...</div>;

    return (
        <div className="user-details-container">
            <button className="back-button" onClick={() => navigate(-1)}>&larr; Back</button>
            <div className="user-card">
                <h2 className="user-name">{user.full_name}</h2>
                <p className="user-info"><strong>Email:</strong> {user.email}</p>
                <p className="user-info"><strong>Phone:</strong> {user.phone_number}</p>
            </div>
        </div>
    );
};

export default UserDetailsPage;
