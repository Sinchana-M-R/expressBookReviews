const express = require('express');
const axios = require('axios');
const public_users = express.Router();

let books = require('./booksdb.js');

// Task 1: Get all books
public_users.get('/', async function (req, res) {
    try {
        const booksData = await new Promise((resolve, reject) => {
            resolve(books);
        });
        res.status(200).send(JSON.stringify(booksData, null, 4));
    } catch (error) {
        res.status(500).send({ message: 'Error fetching books list' });
    }
});

// Task 2: Get book details by ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;

    try {
        const bookDetails = await new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) resolve(book);
            else reject('Book not found');
        });

        res.status(200).send(JSON.stringify(bookDetails, null, 4));
    } catch (error) {
        res.status(404).send({ message: 'Book not found' });
    }
});

// Task 3: Get books by author
public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params;

    try {
        const booksByAuthor = await new Promise((resolve, reject) => {
            const filteredBooks = Object.keys(books)
                .map(isbn => books[isbn])
                .filter(book => book.author.toLowerCase() === author.toLowerCase());

            if (filteredBooks.length > 0) resolve(filteredBooks);
            else reject('No books found by this author');
        });

        res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } catch (error) {
        res.status(404).send({ message: 'No books found by this author' });
    }
});

// Task 4: Get books by title
public_users.get('/title/:title', async function (req, res) {
    const { title } = req.params;

    try {
        const booksByTitle = await new Promise((resolve, reject) => {
            const filteredBooks = Object.keys(books)
                .map(isbn => books[isbn])
                .filter(book => book.title.toLowerCase() === title.toLowerCase());

            if (filteredBooks.length > 0) resolve(filteredBooks);
            else reject('No books found with this title');
        });

        res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } catch (error) {
        res.status(404).send({ message: 'No books found with this title' });
    }
});

// Task 5: Get book reviews by ISBN
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;

    const book = books[isbn];
    if (book && book.reviews) {
        res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        res.status(404).send({ message: 'Reviews not found for this book' });
    }
});

module.exports.general = public_users;
