const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const Profile = require('../models/Profile');

class AuthController {
    static async signup(req, res) {
        const { firstName, lastName, email, password, confirmPassword, terms } = req.body;

        try {
            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.json({
                    redirect: '/auth/create-account',
                    status: 'error',
                    message: 'User already exists with this email! Please choose a different email.'
                });
            }

            if (terms !== 'on') {
                return res.json({
                    redirect: '/auth/create-account',
                    status: 'error',
                    message: 'You must agree to the terms and conditions to create an account.'
                });
            }

            if (password !== confirmPassword) {
                return res.json({
                    redirect: '/auth/create-account',
                    status: 'error',
                    message: 'Passwords do not match.'
                });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 10);

            const username_slug = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${crypto.randomBytes(2).toString('hex')}`;

            //Create user
            const newUser = await User.create({
                username: `${firstName} ${lastName}`,
                username_slug,
                email,
                password_hash,
                role: 'user'
            });

            return res.json({
                redirect: '/auth/signin',
                status: 'success',
                message: 'Account created successfully!'
            });

        } catch (error) {
            console.error(error);
            return res.redirect('/auth/create-account');
        }
    }

    static async signin(req, res) {
        const { email, password, remember } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.json({ redirect: '/auth/signin', status: 'error', message: 'Invalid email or password!' });
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');
            if (!isPasswordValid) {
                return res.json({ redirect: '/auth/signin', status: 'error', message: 'Invalid email or password!' });
            }

            // Generate JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    username_slug: user.username_slug,
                    profile_picture: user.profile_picture_url,
                    role: user.role,
                    email: user.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: remember ? '30d' : '7d' }
            );

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            const profile = await Profile.findByUserId(user.id);
            if (!profile) {
                // Create profile
                await Profile.create({
                    user_id: user.id,
                    display_name: user.username,
                    title: '',
                    bio: '',
                    location: '',
                    company: '',
                    website_url: '',
                    profile_picture_url: '',
                    theme: 'default',
                    is_public: true
                });
            }
            if (user.role === 'admin') {
                return res.json({ redirect: '/admin/dashboard', status: 'success', message: 'signin successful!' });
            } else {
                return res.json({ redirect: '/', status: 'success', message: 'signin successful!' });
            }

        } catch (error) {
            console.error('signin error:', error);
            return res.redirect('/auth/signin');
        }
    }

    static async forgotPassword(req, res) {
        const { email } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.json({
                    redirect: '/auth/forgot-password',
                    status: 'error',
                    message: 'No account found with this email.'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

            await User.setResetToken(user.email, resetToken, resetTokenExpires);

            const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password?token=${resetToken}`;

            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message: `Reset your password using this link: ${resetUrl}`,
                html: `
                <h2>Password Reset</h2>
                <p>Hello ${user.username},</p>
                <p>Click below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link expires in 30 minutes.</p>
            `
            });

            return res.json({
                redirect: '/auth/forgot-password',
                status: 'success',
                message: 'Password reset email sent successfully!'
            });

        } catch (error) {
            console.error(error);
            return res.redirect('/auth/forgot-password');
        }
    }

    static async resetPassword(req, res) {
        const { token } = req.query;
        const { password } = req.body;

        try {
            const user = await User.findByResetToken(token);
            if (!user) {
                return res.json({
                    redirect: '/auth/forgot-password',
                    status: 'error',
                    message: 'Invalid or expired token.'
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update & clear token
            await User.updatePassword(user.id, hashedPassword);

            return res.json({
                redirect: '/auth/signin',
                status: 'success',
                message: 'Password reset successfully!'
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error resetting password' });
        }
    }

    static async refreshToken(req, res) {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }

            const newToken = jwt.sign(
                {
                    userId: decoded.userId,
                    username: decoded.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ success: true });

        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }

    static async signout(req, res) {
        res.clearCookie('token');
        res.json({ success: true, message: 'Logged out successfully' });
    }

}

module.exports = AuthController;