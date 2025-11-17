const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middlewares/rateLimiter');

// Authentication pages
router.get('/create-account', (req, res) => {
    res.render('auth/register', { 
        title: "Create an account"
    });
});

router.get('/login', (req, res) => {
    res.render('auth/signin', { 
        title: "Log in" 
    });
});

router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', {
        title: "Forgot Password"
    });
});

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    res.render('auth/reset-password', {
        title: "Reset Password",
        token
    });
});

// Authentication actions
router.post('/register', authController.signup);
router.post('/signin',loginLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/logout', authController.logout);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;