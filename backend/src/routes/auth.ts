import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Register endpoint
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    // Validation
    if (!email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and company name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      companyName,
      role: 'user'
    });

    await user.save();

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          companyName: user.companyName,
          role: user.role
        }
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          companyName: user.companyName,
          role: user.role
        }
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user?._id,
          email: user?.email,
          companyName: user?.companyName,
          role: user?.role,
          createdAt: user?.createdAt
        }
      }
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

export default router;
