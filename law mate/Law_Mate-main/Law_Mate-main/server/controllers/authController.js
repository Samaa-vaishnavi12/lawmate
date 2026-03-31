import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, expiresIn = '30d') => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: expiresIn,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'public'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Role validation: selected role must match user's role/status in database
    if (role === 'admin') {
        if (!user.isAdmin) {
            res.status(401);
            throw new Error('Unauthorized: This account does not have Administrator privileges');
        }
    } else if (user.role !== role && !user.isAdmin) {
        // If not admin and roles don't match, block access
        res.status(401);
        throw new Error(`Unauthorized: This account is not registered as ${role}`);
    }

    if (await user.matchPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            token: generateToken(user._id, req.body.rememberMe ? '30d' : '1d'),
        });
    } else {
        res.status(401);
        throw new Error('Invalid password');
    }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully' });
});

export { registerUser, authUser, resetPassword };
