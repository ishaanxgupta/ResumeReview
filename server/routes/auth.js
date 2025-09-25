const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateMagicLinkToken, sendMagicLink } = require('../services/emailService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Request magic link
router.post('/request-magic-link', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Check if user exists or create new one
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        name,
        role: 'user'
      });
    } else {
      user.name = name; // Update name if changed
    }

    // Generate magic link token
    const token = generateMagicLinkToken();
    user.magicLinkToken = token;
    user.magicLinkExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.save();

    // Send magic link email
    await sendMagicLink(email, token, name);

    res.json({ message: 'Magic link sent to your email' });
  } catch (error) {
    console.error('Magic link request error:', error);
    res.status(500).json({ message: 'Error sending magic link' });
  }
});

// Verify magic link and login
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await User.findOne({
      magicLinkToken: token,
      magicLinkExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Clear magic link token
    user.magicLinkToken = null;
    user.magicLinkExpires = null;
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Magic link verification error:', error);
    res.status(500).json({ message: 'Error verifying magic link' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error getting user information' });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the JWT
    // For now, we'll just return success and let the client remove the token
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
});

module.exports = router;
