import React, { useState } from 'react';
import '../styles/SwapModal.css';

const SwapModal = ({ bookTitle, myBooks = [], onConfirm, onCancel }) => {
    const [selectedBookId, setSelectedBookId] = useState('');

    const handleConfirm = () => {
        if (selectedBookId) {
            onConfirm(selectedBookId);
        } else {
            alert('Please select a book to swap.');
        }
    };

    const selectedBook = myBooks.find(
        (book) => book._id === selectedBookId || book.id === selectedBookId
    );

    return (
        <div className="modal-overlay">
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <h2 id="modal-title">Swap Request for "{bookTitle}"</h2>

                {myBooks.length > 0 ? (
                    <div className="book-list">
                        <label htmlFor="book-select">Choose one of your books to offer:</label>
                        <select
                            id="book-select"
                            value={selectedBookId}
                            onChange={(e) => setSelectedBookId(e.target.value)}
                        >
                            <option value="" disabled>
                                -- Select a book --
                            </option>
                            {myBooks.map((book) => (
                                <option key={book._id || book.id} value={book._id || book.id}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <p>You have no available books to offer for swap.</p>
                )}

                {selectedBook && (
                    <div className="selected-book-preview">
                        <p><strong>Selected:</strong> {selectedBook.title}</p>
                        {selectedBook.cover && (
                            <img
                                src={`${process.env.REACT_APP_API_URL}${selectedBook.cover}`}
                                alt={`Cover of ${selectedBook.title}`}
                                style={{ maxWidth: '100px', marginTop: '10px' }}
                            />
                        )}
                    </div>
                )}

                <div className="modal-buttons">
                    <button
                        className="confirm-button"
                        onClick={handleConfirm}
                        disabled={!selectedBookId}
                        title={!selectedBookId ? 'Select a book first' : 'Confirm swap'}
                    >
                        Confirm
                    </button>
                    <button className="cancel-button" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwapModal;
