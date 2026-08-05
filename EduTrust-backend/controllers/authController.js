const User = require('../models/User'); // Adjust path based on your model location
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT signing (Ensure JWT_SECRET is set in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * @desc    Register a new user / school admin
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, role, schoolName } = req.body;

        // 1. Check if required fields are provided
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (fullName, email, password).'
            });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create new user record
        const newUser = await User.create({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'Administrator',
            schoolName: schoolName || 'My School'
        });

        // 5. Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 6. Return response (excluding hashed password)
        return res.status(201).json({
            success: true,
            message: 'Registration successful.',
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                schoolName: newUser.schoolName
            }
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration.',
            error: error.message
        });
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        // 2. Check if user exists (explicitly select password if schema hides it by default)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // 3. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 5. Return success payload formatted for client localStorage
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                schoolName: user.schoolName || 'Greenfield School'
            }
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.',
            error: error.message
        });
    }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        // req.user is set by authentication middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error in getMe:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error retrieving user data.',
            error: error.message
        });
    }
};

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// =======================================
// Login
// =======================================
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }

        // Update last login
        user.last_login = new Date();

        await user.save();

        // Generate Token
        const token = jwt.sign(
            {
                id: user._id,
                school_id: user.school_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            user: {

                id: user._id,

                full_name: user.full_name,

                email: user.email,

                role: user.role,

                school_id: user.school_id

            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =======================================
// Get Logged-in User
// =======================================
exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("school_id");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
