import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/BookDetails.css';
import SwapModal from '../components/SwapModal';
import { toast } from 'react-toastify';
import { FaExchangeAlt } from 'react-icons/fa';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [selectedBookForSwap, setSelectedBookForSwap] = useState(null);

    const [myBooks, setMyBooks] = useState([]);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/details/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBook(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch book:', err);
                setLoading(false);
            }
        };

        const fetchMyBooks = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMyBooks(res.data);
            } catch (err) {
                console.error('Failed to fetch my books:', err);
            }
        };

        fetchBook();
        fetchMyBooks();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!book) return <p>Book not found.</p>;

    const storedUser = localStorage.getItem('user');
    const currentUserId = storedUser ? JSON.parse(storedUser).id : null;
    const isMyBook = book.owner === currentUserId;

    // Open modal - store book _id, not title
    const handleSwapRequest = () => {
        setSelectedBookForSwap(book._id);
        setShowSwapModal(true);
    };

    // Confirm swap receives the offered book id selected in modal
    const confirmSwap = async (selectedBookId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/swaps/create`,
                {
                    bookRequestedId: book._id,
                    bookOfferedId: selectedBookId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Swap request sent successfully!");
        } catch (error) {
            console.error('Failed to create swap:', error.response?.data || error.message);
            toast.error("Failed to create swap");
        } finally {
            setShowSwapModal(false);
            setSelectedBookForSwap(null);
        }
    };



    const cancelSwap = () => {
        setShowSwapModal(false);
        setSelectedBookForSwap(null);
    };

    return (
        <div className="book-details-container">
            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

            <div className="book-details-card">
                <img src={`${process.env.REACT_APP_API_URL}${book.cover}`} alt="Book Cover" className="book-details-cover" />
                <div className="book-details-info">
                    <h2>{book.title}</h2>
                    <p><strong>Author:</strong> {book.author}</p>
                    <p><strong>Description:</strong> {book.description}</p>

                    {isMyBook ? (
                        <button className="edit-button" onClick={() => navigate(`/edit/${book._id}`)}>✏️ Edit Book</button>
                    ) : (
                        <button className="swap-button" onClick={handleSwapRequest}>
                            <FaExchangeAlt style={{ marginRight: '6px' }} />Request Swap
                        </button>
                    )}
                </div>
            </div>

            {showSwapModal && (
                <SwapModal
                    bookTitle={book.title}
                    myBooks={myBooks}
                    onConfirm={confirmSwap}
                    onCancel={cancelSwap}
                />
            )}
        </div>
    );
};

export default BookDetails;
