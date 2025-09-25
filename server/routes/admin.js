const express = require('express');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Create admin user (development only)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.name = name;
      await user.save();
      
      res.json({ 
        message: 'User updated to admin successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } else {
      // Create new admin user
      user = new User({
        email: email.toLowerCase(),
        name,
        role: 'admin',
        isVerified: true
      });

      await user.save();

      res.json({ 
        message: 'Admin user created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-magicLinkToken -magicLinkExpires');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
