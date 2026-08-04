const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRouters = require('./routes/userRoutes');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
    origin: [
        'https://abdul-cel.github.io', // Your GitHub Pages Frontend
        'http://localhost:3000',        // Optional: Local React app
        'http://127.0.0.1:5500'         // Optional: VS Code Live Server
    ],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/users', userRouters);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
