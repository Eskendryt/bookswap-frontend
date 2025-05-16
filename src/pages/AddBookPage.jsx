import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddBookPage.css';
import { FaArrowLeft } from 'react-icons/fa';

const AddBookPage = () => {
    const [cover, setCover] = useState(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const navigate = useNavigate();

    const handleCoverChange = (e) => {
        setCover(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cover) {
            setMessage('❌ Please upload a cover image.');
            setMessageType('error');
            return;
        }

        const formData = new FormData();
        formData.append('cover', cover);
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/books/add`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            console.log('📘 Book response:', data);

            setMessage('✅ Book added successfully!');
            setMessageType('success');

            setCover(null);
            setTitle('');
            setAuthor('');
            setDescription('');
        } catch (error) {
            console.error('❌ Error submitting book:', error.message);
            setMessage('❌ Failed to add book. Please try again.');
            setMessageType('error');
        }

        // Clear message after 4 seconds
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 4000);
    };

    return (
        <div className="add-book-page">
            <button className="back-button" onClick={() => navigate(-1)} title="Back">
                <FaArrowLeft />
            </button>

            <div className="add-book-form">
                <h2>Add New Book</h2>

                {message && (
                    <div className={`form-message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="cover">Cover Image</label>
                    <input
                        type="file"
                        id="cover"
                        accept="image/*"
                        onChange={handleCoverChange}
                        required
                    />

                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter book title"
                        required
                    />

                    <label htmlFor="author">Author</label>
                    <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Enter author's name"
                        required
                    />

                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a short description"
                        required
                    ></textarea>

                    <button type="submit">Add Book</button>
                </form>
            </div>
        </div>
    );
};

export default AddBookPage;
