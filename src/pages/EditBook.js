import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // add axios import
import '../styles/EditBook.css';

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/details/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTitle(res.data.title);
                setAuthor(res.data.author);
                setDescription(res.data.description);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch book:', err);
                setError('Failed to load book details');
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('title', title);
            formData.append('author', author);
            formData.append('description', description);
            if (cover) {
                formData.append('cover', cover);
            }

            await axios.put(`${process.env.REACT_APP_API_URL}/api/books/update/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // alert('Book updated successfully!');
            navigate(-1);
        } catch (err) {
            console.error('Update failed:', err);
            setError('Failed to update book.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="edit-book-container">
            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
            <h2>Edit Book</h2>
            <form className="edit-book-form" onSubmit={handleSubmit}>
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label htmlFor="author">Author</label>
                <input
                    type="text"
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                />

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <label htmlFor="cover">Cover Image</label>
                <input
                    type="file"
                    id="cover"
                    accept="image/*"
                    onChange={(e) => setCover(e.target.files[0])}
                />

                <button type="submit">💾 Save Changes</button>
            </form>
        </div>
    );
};

export default EditBook;
