const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const app = express();
const port = process.env.PORT ?? 3000;

// Set the view engine to EJS
app.set("view engine", "ejs");

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost", // Replace with your database host
  user: process.env.DB_USER ?? "root", // Replace with your database user
  password: process.env.DB_PASSWORD ?? "password", // Replace with your database password
  database: process.env.DB_NAME ?? "prabhav", // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Access environment variables
const SECRET_MESSAGE = process.env.SECRET_MESSAGE ?? "secret message";

// Middleware to parse query parameters
app.use(express.urlencoded({ extended: true }));

// Route to display the secret message
app.get("/secret", (req, res) => {
  const password = req.query.password; // Get password from query parameter

  if (password === process.env.PASSWORD) {
    // Render the secret message page
    const queryForCurrentVisitCount = "SELECT count FROM counters WHERE id = 1";
    db.query(queryForCurrentVisitCount, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      const currentVisitCount = result[0].count;

      // Increment the visit count
      db.query("UPDATE counters SET count = count + 1 WHERE id = 1", (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });

      if (currentVisitCount + 1 >= 1000000) {
        res.render("secret-message", { secretMessage: SECRET_MESSAGE });
      } else {
        res.render("secret-message", {
          secretMessage: `Um actually, we need ${
            1000000 - (currentVisitCount + 1)
          } more visits before we can reveal the secret message. By the way, do you know how many AWS credits do you save when you have multiple websites share the same database? Crazy...`,
        });
      }
    });
  } else {
    // Render the access denied page
    res.render("access-denied");
  }
});

// FOR ADMIN PURPOSES ONLY
app.post("/set_environment_variables", (req, res) => {
  // Set environment variables
  const adminPassword = req.get("Admin-Password");
  const variable = req.query.variable;
  const value = req.query.value;
  if ((process.env.ADMIN_PASSWORD = adminPassword)) {
    process.env[variable] = value;
    res.send("Environment variable set successfully");
  } else {
    res.status(401).send("Not authorized");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
