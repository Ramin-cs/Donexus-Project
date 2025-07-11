import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/index.js';
import { 
  authenticateToken, 
  requireRole 
} from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route GET /users
 * @desc Get all users with filtering and pagination
 * @access Private (ADMIN only)
 */
router.get('/', 
  authenticateToken, 
  requireRole(['ADMIN']),
  validateRequest(schemas.listUsers),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, userType, companyId } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      let whereClause = {};

      if (userType) {
        whereClause.userType = userType;
      }

      if (companyId) {
        whereClause.companyId = parseInt(companyId);
      }

      // Get users with pagination
      const [users, totalCount] = await Promise.all([
        prisma.person.findMany({
          where: whereClause,
          select: {
            id: true,
            fullName: true,
            emailAddress: true,
            userType: true,
            lastSeenAt: true,
            createdOn: true,
            company: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdOn: 'desc' },
          skip: offset,
          take: parseInt(limit)
        }),
        prisma.person.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.json({
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalCount,
            totalPages,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        error: 'Failed to retrieve users',
        code: 'USERS_RETRIEVAL_ERROR'
      });
    }
  }
);

/**
 * @route GET /users/:id
 * @desc Get specific user by ID
 * @access Private (ADMIN only)
 */
router.get('/:id', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      const user = await prisma.person.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          emailAddress: true,
          userType: true,
          lastSeenAt: true,
          createdOn: true,
          updatedOn: true,
          company: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({
        message: 'User retrieved successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Failed to retrieve user',
        code: 'USER_RETRIEVAL_ERROR'
      });
    }
  }
);

/**
 * @route POST /users
 * @desc Create new user (Admin only)
 * @access Private (ADMIN only)
 */
router.post('/', 
  authenticateToken, 
  requireRole(['ADMIN']),
  validateRequest(schemas.createUser),
  async (req, res) => {
    try {
      const { fullName, email, password, userType = 'NORMAL', companyId } = req.body;

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
          userType,
          companyId
        },
        select: {
          id: true,
          fullName: true,
          emailAddress: true,
          userType: true,
          createdOn: true,
          company: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'User created successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        error: 'Failed to create user',
        code: 'USER_CREATION_ERROR'
      });
    }
  }
);

/**
 * @route PATCH /users/:id
 * @desc Update user
 * @access Private (ADMIN only)
 */
router.patch('/:id', 
  authenticateToken, 
  requireRole(['ADMIN']),
  validateRequest(schemas.updateUser),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { fullName, email, userType, companyId } = req.body;

      // Check if user exists
      const existingUser = await prisma.person.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingUser.emailAddress) {
        const emailExists = await prisma.person.findUnique({
          where: { emailAddress: email }
        });

        if (emailExists) {
          return res.status(409).json({
            error: 'Email already in use',
            code: 'EMAIL_EXISTS'
          });
        }
      }

      // Check if company exists if being changed
      if (companyId && companyId !== existingUser.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: companyId }
        });

        if (!company) {
          return res.status(404).json({
            error: 'Company not found',
            code: 'COMPANY_NOT_FOUND'
          });
        }
      }

      // Update user
      const updatedUser = await prisma.person.update({
        where: { id: userId },
        data: {
          ...(fullName && { fullName }),
          ...(email && { emailAddress: email }),
          ...(userType && { userType }),
          ...(companyId && { companyId })
        },
        select: {
          id: true,
          fullName: true,
          emailAddress: true,
          userType: true,
          updatedOn: true,
          company: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.json({
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        error: 'Failed to update user',
        code: 'USER_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @route DELETE /users/:id
 * @desc Delete user
 * @access Private (ADMIN only)
 */
router.delete('/:id', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Check if user exists
      const user = await prisma.person.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({
          error: 'Cannot delete your own account',
          code: 'SELF_DELETION_NOT_ALLOWED'
        });
      }

      // Delete user (this will cascade delete their tickets and tokens)
      await prisma.person.delete({
        where: { id: userId }
      });

      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        error: 'Failed to delete user',
        code: 'USER_DELETION_ERROR'
      });
    }
  }
);

/**
 * @route GET /users/stats/summary
 * @desc Get user statistics
 * @access Private (ADMIN only)
 */
router.get('/stats/summary', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const [totalUsers, normalUsers, supportUsers, adminUsers, activeUsers] = 
        await Promise.all([
          prisma.person.count(),
          prisma.person.count({ where: { userType: 'NORMAL' } }),
          prisma.person.count({ where: { userType: 'SUPPORT' } }),
          prisma.person.count({ where: { userType: 'ADMIN' } }),
          prisma.person.count({
            where: {
              lastSeenAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          })
        ]);

      res.json({
        message: 'User statistics retrieved successfully',
        data: {
          summary: {
            total: totalUsers,
            normal: normalUsers,
            support: supportUsers,
            admin: adminUsers,
            active: activeUsers
          }
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve user statistics',
        code: 'USER_STATS_ERROR'
      });
    }
  }
);

export default router;