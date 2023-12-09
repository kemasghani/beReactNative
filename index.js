const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 4000;
app.use(cors());
// Middleware to parse JSON requests (built-in in Express 4.16.0 and above)
app.use(express.json());

// MySQL database connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reactnativedb'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// In-memory user data (replace with database in a real-world scenario)
const users = [];

// Register endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if the username is already taken
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already taken' });
    }

    // Insert into MySQL database (replace with your database query)
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
        if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Registration successful' });
    });
});
// Add this route to get user ID by username
app.get('/getUserId/:username', (req, res) => {
    const { username } = req.params;

    // Use your database query method to find the user ID by username
    db.promise().query('SELECT id FROM users WHERE username = ?', [username])
        .then(([user]) => {
            // If the user is not found, return an error
            if (!user || user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Return the user ID
            res.json({ userId: user[0].id });
        })
        .catch((error) => {
            console.error('Error getting user ID by username:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Use your database query method to find the user
    db.promise().query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
        .then(([user]) => {
            // If the user is not found or the password is incorrect, return an error
            if (!user || user.length === 0) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            res.json({ message: 'Login successful' });
        })
        .catch((error) => {
            console.error('Error during login:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define the directory where uploaded files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname); // Define the file name
    }
});

const upload = multer({ storage });

// Items endpoint to add an item to the items table with file upload
app.post('/item', upload.single('image'), (req, res) => {
    const { name, description, quantity } = req.body;
    const imagePath = req.file.path; // File path after upload

    // Insert into items table (replace with your database query)
    db.query(
        'INSERT INTO item (name, image, description, quantity) VALUES (?, ?, ?, ?)',
        [name, imagePath, description, quantity],
        (err, results) => {
            if (err) {
                console.error('Error inserting item into database:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            res.json({ message: 'Item added successfully', itemId: results.insertId });
        }
    );
});

// Supplier endpoint to add a supplier to the supplier table
app.post('/supplier', (req, res) => {
    const { name, address, phone } = req.body;

    // Insert into suppliers table (replace with your database query)
    db.query(
        'INSERT INTO supplier (name, address, phone) VALUES (?, ?, ?)',
        [name, address, phone],
        (err, results) => {
            if (err) {
                console.error('Error inserting supplier into database:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            res.json({ message: 'Supplier added successfully', supplierId: results.insertId });
        }
    );
});

// Reports endpoint to add a report to the report table
app.post('/report', (req, res) => {
    const { date, income, outcome } = req.body;

    // Insert into reports table (replace with your database query)
    db.query(
        'INSERT INTO report (date, income, outcome) VALUES (?, ?, ?)',
        [date, income, outcome],
        (err, results) => {
            if (err) {
                console.error('Error inserting report into database:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            res.json({ message: 'Report added successfully', reportId: results.insertId });
        }
    );
});
// Reports endpoint to get all reports
app.get('/reports', (req, res) => {
    // Replace with your database query to fetch all reports
    db.query('SELECT * FROM report', (err, results) => {
        if (err) {
            console.error('Error fetching reports from database:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.json(results);
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
