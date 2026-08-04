const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRouters = require('./routes/userRoutes');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
    origin:'https://edutrust-15ii.onrender.com'
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/users', userRouters);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
