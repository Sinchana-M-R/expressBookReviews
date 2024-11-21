const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
 const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(403).send('Token is required for authentication.');
  }

  // Verify the JWT token
  jwt.verify(token, 'fingerprint_customer', (err, user) => {
    if (err) {
      return res.status(403).send('Invalid or expired token.');
    }
    // Store the user information in the request object for use in subsequent routes
    req.user = user;
    next();  // Continue to the next middleware or route handler
  });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
