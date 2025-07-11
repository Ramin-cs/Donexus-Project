import jwt from 'jsonwebtoken';
import { prisma } from '../db/index.js';

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request object
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database with company info
    const user = await prisma.person.findUnique({
      where: { id: decoded.userId },
      include: {
        company: true,
        tokens: {
          where: {
            value: token,
            revoked: false,
            expiresOn: { gt: new Date() }
          }
        }
      }
    });

    if (!user || user.tokens.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    // Update last seen timestamp
    await prisma.person.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() }
    });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of allowed user types
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.userType
      });
    }

    next();
  };
};

/**
 * Organization-based access control middleware
 * Ensures users can only access their own organization's data
 */
export const requireSameOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.issue.findUnique({
      where: { id: parseInt(id) },
      include: { company: true }
    });

    if (!ticket) {
      return res.status(404).json({ 
        error: 'Ticket not found',
        code: 'TICKET_NOT_FOUND'
      });
    }

    // Admin can access all tickets
    if (req.user.userType === 'ADMIN') {
      req.ticket = ticket;
      return next();
    }

    // Users can only access tickets from their organization
    if (ticket.companyId !== req.user.companyId) {
      return res.status(403).json({ 
        error: 'Access denied to this ticket',
        code: 'ACCESS_DENIED'
      });
    }

    req.ticket = ticket;
    next();
  } catch (error) {
    console.error('Organization access control error:', error);
    return res.status(500).json({ 
      error: 'Access control check failed',
      code: 'ACCESS_CONTROL_ERROR'
    });
  }
};

/**
 * Generate and store access token in DB
 * @param {Object} user - User object
 * @returns {Promise<string>} Access token
 */
export const generateAndStoreAccessToken = async (user) => {
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.emailAddress,
      userType: user.userType,
      companyId: user.companyId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Store access token in database
  await prisma.sessionToken.create({
    data: {
      value: token,
      personId: user.id,
      expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    }
  });

  return token;
};

/**
 * Generate JWT token (sync, legacy)
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.emailAddress,
      userType: user.userType,
      companyId: user.companyId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {Promise<string>} Refresh token
 */
export const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  // Store refresh token in database
  await prisma.sessionToken.create({
    data: {
      value: token,
      personId: user.id,
      expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  return token;
};