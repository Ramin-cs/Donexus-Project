import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/index.js';
import { 
  authenticateToken, 
  generateToken, 
  generateRefreshToken 
} from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route POST /auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.person.findUnique({
      where: { emailAddress: email },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    // Update last seen
    await prisma.person.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() }
    });

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.emailAddress,
          userType: user.userType,
          company: user.company
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * @route POST /auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', validateRequest(schemas.register), async (req, res) => {
  try {
    const { fullName, email, password, companyId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.person.findUnique({
      where: { emailAddress: email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        code: 'COMPANY_NOT_FOUND'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.person.create({
      data: {
        fullName,
        emailAddress: email,
        passwordHash,
        companyId,
        userType: 'NORMAL' // Default user type
      },
      include: { company: true }
    });

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.emailAddress,
          userType: user.userType,
          company: user.company
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * @route POST /auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if token exists and is valid
    const tokenRecord = await prisma.sessionToken.findFirst({
      where: {
        value: refreshToken,
        revoked: false,
        expiresOn: { gt: new Date() }
      },
      include: {
        person: {
          include: { company: true }
        }
      }
    });

    if (!tokenRecord) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(tokenRecord.person);

    res.json({
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
});

/**
 * @route POST /auth/logout
 * @desc Logout user and revoke refresh token
 * @access Private
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Revoke refresh token
    await prisma.sessionToken.updateMany({
      where: {
        personId: req.user.id,
        value: token
      },
      data: {
        revoked: true
      }
    });

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * @route GET /auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.person.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    res.json({
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.emailAddress,
          userType: user.userType,
          company: user.company,
          lastSeenAt: user.lastSeenAt,
          createdOn: user.createdOn
        }
      }
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      error: 'Profile retrieval failed',
      code: 'PROFILE_ERROR'
    });
  }
});

export default router;