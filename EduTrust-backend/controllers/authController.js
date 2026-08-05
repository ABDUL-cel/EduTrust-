const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * @desc    Register a new school account
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        const {
            school_name,
            school_email,
            phone,
            address,
            school_type,
            academic_session,
            current_term,
            school_motto,
            website,
            principal_name,
            principal_email,
            password
        } = req.body;

        // 1. Validate required fields from register.html
        if (
            !school_name ||
            !school_email ||
            !phone ||
            !address ||
            !school_type ||
            !academic_session ||
            !current_term ||
            !principal_name ||
            !principal_email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please fill out all required fields.'
            });
        }

        // 2. Check if a school/principal with this email already exists
        const existingUser = await User.findOne({
            $or: [
                { email: school_email.toLowerCase() },
                { principalEmail: principal_email.toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save full record to MongoDB
        const newUser = await User.create({
            schoolName: school_name,
            schoolEmail: school_email.toLowerCase(),
            phone,
            address,
            schoolType: school_type,
            academicSession: academic_session,
            currentTerm: current_term,
            schoolMotto: school_motto || '',
            website: website || '',
            fullName: principal_name,
            principalEmail: principal_email.toLowerCase(),
            email: school_email.toLowerCase(), // Main auth email
            password: hashedPassword,
            role: 'Administrator'
        });

        // 5. Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 6. Return success response
        return res.status(201).json({
            success: true,
            message: 'School account created successfully!',
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

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { schoolEmail: email.toLowerCase() },
                { principalEmail: email.toLowerCase() }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                schoolName: user.schoolName
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
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
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
