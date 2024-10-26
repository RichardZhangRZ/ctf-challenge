from flask import Flask, render_template, request, redirect, url_for, session, flash
import mysql.connector
import os
import hashlib

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "secret")

# Configure MySQL connection
db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),  # Replace with your MySQL username
    "password": os.getenv("DB_PASSWORD", "password"),  # Replace with your MySQL password
    "database": os.getenv("DB_NAME", "prabhav"),
}

# Helper function to get a database connection
def get_db_connection():
    return mysql.connector.connect(**db_config)


@app.route("/", methods=["GET", "POST"])
def home():
    if "username" not in session or "token" not in session:
        return redirect(url_for("login"))
    
    # Check that token is valid
    if session["token"] != hashlib.sha256(session["username"].encode("utf-8")).hexdigest():
        return redirect(url_for("login"))
    
    # Initialize the evaluated expression as None (no input initially)
    evaluated_expression = None
    response_message = None

    if request.method == "POST":
        # Retrieve the input from the form submission
        user_input = request.form.get("user_input")
        if user_input:
            # Set the echoed input to display on the page
            evaluated_expression = eval(user_input)
            response_message = f"You have entered {user_input}"
        else:
            response_message = "Please enter a non-empty expression"

    return render_template(
        "home.html", username=session["username"], evaluated_expression=evaluated_expression, response_message=response_message
    )


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        sanitized_username = username.replace("'", "''")
        sanitized_password = password.replace("'", "''")

        # Query the user from the database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)
        cursor.execute(
            f"SELECT * FROM users WHERE username = '{sanitized_username}' AND password = '{sanitized_password}'"
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            session["username"] = sanitized_username
            m = hashlib.sha256()
            m.update(sanitized_username.encode("utf-8"))
            session["token"] = m.hexdigest()
            return redirect(url_for("home"))
        else:
            flash("Invalid credentials. Please try again.", "error")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("username", None)
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


if __name__ == "__main__":
    debug_on = os.getenv("DEBUG", "True") == "True"
    app.run(debug=debug_on)
