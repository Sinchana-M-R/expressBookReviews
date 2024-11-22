const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const session = require('express-session');

let users = []; // Stores registered users
let books = require('./booksdb.js'); // Import books database

const SECRET_KEY = 'fingerprint_customer'; // Key for JWT signing

// Helper to find user
const findUser = (username) => users.find((user) => user.username === username);

// Task 6 (already implemented): Register a new user
regd_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required!' });
    }

    const userExists = findUser(username);
    if (userExists) {
        return res.status(400).send({ message: 'Username already exists!' });
    }

    users.push({ username, password });
    res.status(201).send({ message: 'User registered successfully!' });
});


// Task 7: Log in a registered user
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required!' });
    }

    const user = findUser(username);
    if (!user || user.password !== password) {
        return res.status(401).send({ message: 'Invalid username or password!' });
    }

    // Create JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    req.session.token = token;

    res.status(200).send({ message: 'Login successful!', token });
});

// Middleware to check authentication
regd_users.use('/auth/*', (req, res, next) => {
    const token = req.session.token;

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access!' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Invalid token!' });
        }
        req.username = decoded.username;
        next();
    });
});

// Task 8: Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.username; // From middleware

    if (!review) {
        return res.status(400).send({ message: 'Review text is required!' });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).send({ message: 'Book not found!' });
    }

    // Add or update the review
    if (!book.reviews) book.reviews = {};
    book.reviews[username] = review;

    res.status(200).send({ message: 'Review added/updated successfully!', reviews: book.reviews });
});

// Task 9: Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.username; // From middleware

    const book = books[isbn];
    if (!book || !book.reviews || !book.reviews[username]) {
        return res.status(404).send({ message: 'Review not found!' });
    }

    // Delete the review
    delete book.reviews[username];

    res.status(200).send({ message: 'Review deleted successfully!', reviews: book.reviews });
});

module.exports.authenticated = regd_users;
