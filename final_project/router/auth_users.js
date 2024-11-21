const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Assuming this contains an array of books
const regd_users = express.Router();

let users = []; // This should store registered users (in production, this would be a database)

// Check if the username exists (returns boolean)
const isValid = (username) => {
  return users.some(user => user.username === username); // Checks if the username is in the users array
}

// Authenticate user (returns boolean)
const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username); // Find user by username
  return user && user.password === password; // Check if password matches
}

// Login route (only registered users can log in)
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists
  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the password is correct
  if (!authenticatedUser(username, password)) {
    return res.status(403).json({ message: "Invalid password" });
  }

  // Generate a JWT token for the authenticated user
  const token = jwt.sign({ username: username }, 'your_jwt_secret_key', { expiresIn: '1h' }); // Replace with your actual secret key

  // Send the token as part of the response
  res.json({ message: "Login successful", token: token });
});

// Add or update a book review for an authenticated user
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Get token from the Authorization header

  if (!token) {
    return res.status(403).json({ message: "Authorization token is required" });
  }

  // Verify the JWT token
  jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Find the book by ISBN
    const book = books.find(b => b.isbn === isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user already has a review for this book
    let existingReview = book.reviews.find(r => r.username === user.username);

    if (existingReview) {
      // If the review exists, update it
      existingReview.review = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // If the review does not exist, add a new review
      book.reviews.push({ username: user.username, review: review });
      return res.status(201).json({ message: "Review added successfully" });
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
