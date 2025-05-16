import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookList = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books`);
                setBooks(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBooks();
    }, []);

    return (
        <div>
            <h2>Books Available for Swap</h2>
            <ul>
                {books.map(book => (
                    <li key={book._id}>
                        <h3>{book.title}</h3>
                        <p>By: {book.author}</p>
                        <p>{book.description}</p>
                        <p>Status: {book.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookList;
