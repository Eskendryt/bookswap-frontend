//frontend/src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import '../styles/MainPage.css';
import { FaExchangeAlt, FaBook, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import SwapModal from '../components/SwapModal';
import axios from 'axios';
import { toast } from 'react-toastify';

const MainPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const [activeTab, setActiveTab] = useState('home');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [selectedBookForSwap, setSelectedBookForSwap] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [myBooks, setMyBooks] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);

    // New state for swaps
    const [sentSwaps, setSentSwaps] = useState([]);
    const [receivedSwaps, setReceivedSwaps] = useState([]);
    const [isLoadingSwaps, setIsLoadingSwaps] = useState(false);

    useEffect(() => {
        const fetchMyBooks = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/my`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMyBooks(res.data);
            } catch (err) {
                console.error('Failed to fetch user books:', err);
            }
        };

        fetchMyBooks();
    }, []);

    useEffect(() => {
        const fetchAvailableBooks = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/available`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAvailableBooks(res.data);
            } catch (err) {
                console.error('Failed to fetch available books:', err);
            }
        };

        fetchAvailableBooks();
    }, []);

    // Fetch swaps when swaps tab is active
    useEffect(() => {
        const fetchSwaps = async () => {
            if (activeTab === 'swaps') {
                setIsLoadingSwaps(true);
                try {
                    const token = localStorage.getItem('token');
                    const [sentRes, receivedRes] = await Promise.all([
                        axios.get(`${process.env.REACT_APP_API_URL}/api/swaps/sent`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        axios.get(`${process.env.REACT_APP_API_URL}/api/swaps/received`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                    ]);
                    setSentSwaps(sentRes.data);
                    setReceivedSwaps(receivedRes.data);
                } catch (err) {
                    console.error('Failed to fetch swaps:', err);
                    toast.error('Failed to load swaps');
                } finally {
                    setIsLoadingSwaps(false);
                }
            }
        };
        fetchSwaps();
    }, [activeTab]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setFilteredBooks([]);
            setShowSearchResults(false);
            return;
        }

        const filtered = availableBooks.filter(book =>
            book.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredBooks(filtered);
        setShowSearchResults(filtered.length > 0);
    };

    const handleDelete = (book) => {
        setBookToDelete(book);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/books/${bookToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMyBooks(prevBooks => prevBooks.filter(b => b._id !== bookToDelete._id));
            setShowDeleteModal(false);
            setBookToDelete(null);
        } catch (err) {
            console.error('❌ Failed to delete book:', err);
            alert('Failed to delete book');
        }
    };

    const handleSwapRequest = (bookId) => {
        setSelectedBookForSwap(bookId);
        setShowSwapModal(true);
    };

    const confirmSwap = async (offeredBookId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/swaps/create`,
                {
                    bookRequestedId: selectedBookForSwap,
                    bookOfferedId: offeredBookId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('📬 Swap request sent!');
        } catch (err) {
            console.error('❌ Failed to send swap request:', err.response?.data || err.message);
            toast.error('❌ Could not send swap request');
        } finally {
            setShowSwapModal(false);
            setSelectedBookForSwap(null);
        }
    };

    const handleStatusChange = async (swapId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/swaps/${swapId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReceivedSwaps(prevSwaps =>
                prevSwaps.map(swap =>
                    swap._id === swapId ? { ...swap, status: newStatus } : swap
                )
            );
            toast.success(`Swap ${newStatus}`);
        } catch (err) {
            console.error('Failed to update swap status:', err);
            toast.error('Failed to update swap');
        }
    };

    const handleCancelSwap = async (swapId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/swaps/${swapId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSentSwaps(prevSwaps => prevSwaps.filter(swap => swap._id !== swapId));
            toast.success('Swap cancelled');
        } catch (err) {
            console.error('Failed to cancel swap:', err);
            toast.error('Failed to cancel swap');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <main className="book-grid">
                        {availableBooks.map((book) => (
                            <div className="book-card" key={book._id}>
                                <button className="heart-button" />
                                <Link to={`/books/${book._id}`} className="book-card">
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}${book.cover}`}
                                        alt={book.title}
                                    />
                                </Link>
                                <div className="book-info">
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-subtitle">{book.author}</p>
                                </div>
                                <button className="swap-button" onClick={() => handleSwapRequest(book._id)}>
                                    <FaExchangeAlt style={{ marginRight: '6px' }} />Request Swap
                                </button>
                            </div>
                        ))}
                    </main>
                );

            case 'books':
                return (
                    <main className="book-grid">
                        {myBooks.map((book) => (
                            <div className="book-card" key={book._id}>
                                <Link to={`/books/${book._id}`} className="book-card">
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}${book.cover}`}
                                        alt={book.title}
                                    />
                                </Link>
                                <div className="book-info">
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-subtitle">{book.author}</p>
                                </div>
                                <div className="book-actions-row">
                                    <select
                                        className="book-status"
                                        value={book.status}
                                        onChange={async (e) => {
                                            const newStatus = e.target.value;
                                            const token = localStorage.getItem('token');
                                            try {
                                                const res = await axios.patch(
                                                    `${process.env.REACT_APP_API_URL}/api/books/${book._id}/status`,
                                                    { status: newStatus },
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                setMyBooks((prevBooks) =>
                                                    prevBooks.map((b) =>
                                                        b._id === book._id ? { ...b, status: res.data.status } : b
                                                    )
                                                );
                                            } catch (err) {
                                                console.error('Failed to update status:', err);
                                                alert('Could not update book status');
                                            }
                                        }}
                                    >
                                        <option value="available">Available</option>
                                        <option value="swapped">Swapped</option>
                                    </select>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(book)}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="fab-button" onClick={() => navigate('/add-book')}>
                            <FaPlus />
                        </button>
                    </main>
                );

            case 'profile':
                return <ProfilePage />;

            case 'swaps':
                return (
                    <main className="swap-grid">
                        {isLoadingSwaps ? (
                            <div className="loading-spinner">Loading swaps...</div>
                        ) : (
                            <>
                                {/* Sent Swap Requests */}
                                <div className="swap-section">
                                    <h3 className="swap-section-title">Sent Requests</h3>
                                    {sentSwaps.length === 0 ? (
                                        <p className="no-swaps-message">No sent swap requests</p>
                                    ) : (
                                        sentSwaps.map((swap) => {
                                            const cardContent = (
                                                <div className="swap-card" key={swap._id}>
                                                    <div className="swap-card-cover">
                                                        {swap.bookOffered?.cover && (
                                                            <img
                                                                src={`${process.env.REACT_APP_API_URL}${swap.bookOffered.cover}`}
                                                                alt={swap.bookOffered.title}
                                                                className="swap-card-cover-image"
                                                            />
                                                        )}
                                                        {swap.bookRequested?.cover && (
                                                            <img
                                                                src={`${process.env.REACT_APP_API_URL}${swap.bookRequested.cover}`}
                                                                alt={swap.bookRequested.title}
                                                                className="swap-card-cover-image"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="swap-card-info">
                                                        <h3 className="swap-book-title">
                                                            {swap.bookOffered?.title || 'Unknown Book'} for {swap.bookRequested?.title || 'Unknown Book'}
                                                        </h3>
                                                        <p className="swap-book-subtitle">
                                                            To: {swap.requestedFrom?.full_name || 'Unknown User'}
                                                        </p>
                                                    </div>

                                                    <div className="swap-actions">
                                                        <span className={`swap-status ${swap.status}`}>
                                                            {swap.status}
                                                        </span>
                                                        {swap.status === 'pending' && (
                                                            <button
                                                                className="cancel-button"
                                                                onClick={() => handleCancelSwap(swap._id)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );

                                            return swap.status === 'accepted' && swap.requestedFrom?._id ? (
                                                <Link
                                                    to={`/user/${swap.requestedFrom._id}`}
                                                    key={swap._id}
                                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    {cardContent}
                                                </Link>
                                            ) : (
                                                cardContent
                                            );
                                        })
                                    )}
                                </div>

                                {/* Received Swap Requests */}
                                <div className="swap-section">
                                    <h3 className="swap-section-title">Received Requests</h3>
                                    {receivedSwaps.length === 0 ? (
                                        <p className="no-swaps-message">No received swap requests</p>
                                    ) : (
                                        receivedSwaps.map((swap) => (
                                            <div className="swap-card" key={swap._id}>
                                                <div className="swap-card-cover">
                                                    {swap.bookRequested?.cover && (
                                                        <img
                                                            src={`${process.env.REACT_APP_API_URL}${swap.bookRequested.cover}`}
                                                            alt={swap.bookRequested.title}
                                                            className="swap-card-cover-image"
                                                        />
                                                    )}
                                                    {swap.bookOffered?.cover && (
                                                        <img
                                                            src={`${process.env.REACT_APP_API_URL}${swap.bookOffered.cover}`}
                                                            alt={swap.bookOffered.title}
                                                            className="swap-card-cover-image"
                                                        />
                                                    )}
                                                </div>
                                                <div className="swap-card-info">
                                                    <h3 className="swap-book-title">
                                                        {swap.bookOffered?.title || 'Unknown Book'} for {swap.bookRequested?.title || 'Unknown Book'}
                                                    </h3>
                                                    <p className="swap-book-subtitle">
                                                        From: {swap.offeredBy?.full_name || 'Unknown User'}
                                                    </p>
                                                </div>

                                                <div className="swap-actions">
                                                    {swap.status === 'pending' ? (
                                                        <>
                                                            <button
                                                                className="accept-button"
                                                                onClick={() => handleStatusChange(swap._id, 'accepted')}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="reject-button"
                                                                onClick={() => handleStatusChange(swap._id, 'rejected')}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className={`swap-status ${swap.status}`}>
                                                            {swap.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </main>
                );

            default:
                return null;
        }
    };

    return (
        <div className="main-container">
            <aside className="sidebar">
                <h1>Book Swap</h1>
                <nav>
                    <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 Home</button>
                    <button className={activeTab === 'books' ? 'active' : ''} onClick={() => setActiveTab('books')}>
                        <FaBook style={{ marginRight: '6px' }} />Library
                    </button>
                    <button className={activeTab === 'swaps' ? 'active' : ''} onClick={() => setActiveTab('swaps')}>
                        🔄 Swaps
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</button>
                </nav>
            </aside>

            <div className="content-container">
                <header className="search-bar">
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSearchResults(filteredBooks.length > 0)}
                        onBlur={() => {
                            setTimeout(() => setShowSearchResults(false), 200);
                        }}
                    />
                    {showSearchResults && (
                        <div className="search-results-overlay">
                            {filteredBooks.map(book => (
                                <div
                                    key={book._id}
                                    className="search-result-item"
                                    onMouseDown={() => navigate(`/books/${book._id}`)}
                                >
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}${book.cover}`}
                                        alt={book.title}
                                        className="search-result-cover"
                                    />
                                    <span className="search-result-title">{book.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </header>

                {renderTabContent()}

                <footer className="bottom-nav">
                    <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 Home</button>
                    <button className={activeTab === 'books' ? 'active' : ''} onClick={() => setActiveTab('books')}>
                        <FaBook style={{ marginRight: '4px' }} /> Library
                    </button>
                    <button className={activeTab === 'swaps' ? 'active' : ''} onClick={() => setActiveTab('swaps')}>
                        🔄 Swaps
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</button>
                </footer>
            </div>

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p>Are you sure you want to delete <strong>{bookToDelete?.title}</strong>?</p>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={confirmDelete}>Yes</button>
                            <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showSwapModal && (
                <SwapModal
                    bookTitle={
                        availableBooks.find(book => book._id === selectedBookForSwap)?.title || 'Unknown Title'
                    }
                    myBooks={myBooks}
                    onConfirm={confirmSwap}
                    onCancel={() => setShowSwapModal(false)}
                />
            )}
        </div>
    );
};

export default MainPage;