const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const loginLimiter = require('../middlewares/rateLimiter');

// Authentication pages
router.get('/create-account', (req, res) => {
    res.render('public/auth/register', { 
        title: "Create an account"
    });
});

router.get('/signin', (req, res) => {
    res.render('public/auth/signin', { 
        title: "Sign in" 
    });
});

router.get('/forgot-password', (req, res) => {
    res.render('public/auth/forgot-password', {
        title: "Forgot Password"
    });
});

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    res.render('public/auth/reset-password', {
        title: "Reset Password",
        token
    });
});

// Authentication actions
router.post('/register', authController.signup);
router.post('/signin',loginLimiter, authController.signin);
router.post('/refresh-token', authController.refreshToken);
router.get('/signout', authController.signout);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;