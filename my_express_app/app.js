const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT ?? 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Access environment variables
const SECRET_MESSAGE = process.env.SECRET_MESSAGE ?? "secret message";

// Middleware to parse query parameters
app.use(express.urlencoded({ extended: true }));

// Route to display the secret message
app.get('/secret', (req, res) => {
    const password = req.query.password; // Get password from query parameter
    
    if (password === process.env.PASSWORD) {
        // Render the secret message page
        res.render('secret-message', { secretMessage: SECRET_MESSAGE });
    } else {
        // Render the access denied page
        res.render('access-denied');
    }
});

// FOR ADMIN PURPOSES ONLY
app.post('/set_environment_variables', (req, res) => {
    // Set environment variables
    const adminPassword = req.get("Admin-Password");
    const variable = req.query.variable;
    const value = req.query.value;
    if (process.env.ADMIN_PASSWORD = adminPassword) {
      process.env[variable] = value;
      res.send('Environment variable set successfully');
    } else {
      res.status(401).send('Not authorized');
    }
    
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
