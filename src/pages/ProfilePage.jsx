import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');  // Or wherever you're storing the token
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setUserDetails(response.data.user);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                if (err.response?.status === 401) {
                    navigate('/login');  // Redirect to login if unauthorized
                }
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');  // Clear the token
        navigate('/login');  // Redirect to login page
    };

    const toggleEdit = () => {
        if (isEditing) {
            // If switching to non-edit mode, save the changes
            const saveChanges = async () => {
                try {
                    const token = localStorage.getItem('token');
                    await axios.put(
                        `${process.env.REACT_APP_API_URL}/api/auth/profile`,
                        {
                            full_name: userDetails.full_name,
                            email: userDetails.email,
                            phone_number: userDetails.phone_number
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        }
                    );
                } catch (err) {
                    console.error('Error saving profile:', err);
                    alert('Failed to save profile.');
                }
            };
            saveChanges();
        }
        setIsEditing(!isEditing);
    };

    if (!userDetails) return <div></div>;  // Loading state while fetching data

    return (
        <div className="profile-container">
            <div className="avatar">
                {userDetails.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
            </div>

            {isEditing ? (
                <>
                    <input
                        className="profile-input"
                        name="fullName"
                        value={userDetails.full_name}
                        onChange={(e) => setUserDetails({ ...userDetails, full_name: e.target.value })}
                    />
                    <input
                        className="profile-input"
                        name="email"
                        value={userDetails.email}
                        onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                    />
                    <input
                        className="profile-input"
                        name="phone"
                        value={userDetails.phone_number}
                        onChange={(e) => setUserDetails({ ...userDetails, phone_number: e.target.value })}
                    />
                </>
            ) : (
                <>
                    <p><strong>{userDetails.full_name}</strong></p>
                    <p>{userDetails.email}</p>
                    <p>{userDetails.phone_number}</p>
                </>
            )}

            <button className="edit-btn" onClick={toggleEdit}>
                {isEditing ? 'Save' : 'Edit Details'}
            </button>

            <button className="logout-btn" onClick={handleLogout}>
                🔓 Logout
            </button>
        </div>
    );
};

export default ProfilePage;
