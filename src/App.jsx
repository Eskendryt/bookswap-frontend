// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Signup from './pages/Signup';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import BookDetails from './pages/BookDetails';
import ProfilePage from './pages/ProfilePage';
import AddBookPage from './pages/AddBookPage';
import EditBook from './pages/EditBook';
import UserDetailsPage from './pages/UserDetailsPage';

const App = () => {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/add-book" element={<AddBookPage />} />
          <Route path="/edit/:id" element={<EditBook />} />
          <Route path="/user/:userId" element={<UserDetailsPage />} />
        </Routes>
        <ToastContainer position="top-center" autoClose={3000} />
      </>
    </Router>
  );
};

export default App;
