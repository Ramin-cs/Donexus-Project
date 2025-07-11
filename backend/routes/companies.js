import express from 'express';
import { prisma } from '../db/index.js';
import { 
  authenticateToken, 
  requireRole 
} from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route GET /companies
 * @desc Get all companies
 * @access Private (ADMIN only)
 */
router.get('/', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const companies = await prisma.company.findMany({
        include: {
          _count: {
            select: {
              members: true,
              issues: true
            }
          }
        },
        orderBy: { title: 'asc' }
      });

      res.json({
        message: 'Companies retrieved successfully',
        data: { companies }
      });
    } catch (error) {
      console.error('Get companies error:', error);
      res.status(500).json({
        error: 'Failed to retrieve companies',
        code: 'COMPANIES_RETRIEVAL_ERROR'
      });
    }
  }
);

/**
 * @route GET /companies/:id
 * @desc Get specific company by ID
 * @access Private (ADMIN only)
 */
router.get('/:id', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          members: {
            select: {
              id: true,
              fullName: true,
              emailAddress: true,
              userType: true,
              lastSeenAt: true,
              createdOn: true
            },
            orderBy: { fullName: 'asc' }
          },
          issues: {
            select: {
              id: true,
              subject: true,
              state: true,
              createdOn: true
            },
            orderBy: { createdOn: 'desc' },
            take: 10 // Only get latest 10 issues
          },
          _count: {
            select: {
              members: true,
              issues: true
            }
          }
        }
      });

      if (!company) {
        return res.status(404).json({
          error: 'Company not found',
          code: 'COMPANY_NOT_FOUND'
        });
      }

      res.json({
        message: 'Company retrieved successfully',
        data: { company }
      });
    } catch (error) {
      console.error('Get company error:', error);
      res.status(500).json({
        error: 'Failed to retrieve company',
        code: 'COMPANY_RETRIEVAL_ERROR'
      });
    }
  }
);

/**
 * @route POST /companies
 * @desc Create new company
 * @access Private (ADMIN only)
 */
router.post('/', 
  authenticateToken, 
  requireRole(['ADMIN']),
  validateRequest(schemas.createCompany),
  async (req, res) => {
    try {
      const { title } = req.body;

      // Check if company already exists
      const existingCompany = await prisma.company.findFirst({
        where: { title: { equals: title, mode: 'insensitive' } }
      });

      if (existingCompany) {
        return res.status(409).json({
          error: 'Company already exists',
          code: 'COMPANY_EXISTS'
        });
      }

      const company = await prisma.company.create({
        data: { title },
        include: {
          _count: {
            select: {
              members: true,
              issues: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Company created successfully',
        data: { company }
      });
    } catch (error) {
      console.error('Create company error:', error);
      res.status(500).json({
        error: 'Failed to create company',
        code: 'COMPANY_CREATION_ERROR'
      });
    }
  }
);

/**
 * @route PATCH /companies/:id
 * @desc Update company
 * @access Private (ADMIN only)
 */
router.patch('/:id', 
  authenticateToken, 
  requireRole(['ADMIN']),
  validateRequest(schemas.createCompany), // Reuse the same schema
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const { title } = req.body;

      // Check if company exists
      const existingCompany = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!existingCompany) {
        return res.status(404).json({
          error: 'Company not found',
          code: 'COMPANY_NOT_FOUND'
        });
      }

      // Check if new title already exists
      if (title !== existingCompany.title) {
        const titleExists = await prisma.company.findFirst({
          where: { 
            title: { equals: title, mode: 'insensitive' },
            id: { not: companyId }
          }
        });

        if (titleExists) {
          return res.status(409).json({
            error: 'Company name already exists',
            code: 'COMPANY_NAME_EXISTS'
          });
        }
      }

      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: { title },
        include: {
          _count: {
            select: {
              members: true,
              issues: true
            }
          }
        }
      });

      res.json({
        message: 'Company updated successfully',
        data: { company: updatedCompany }
      });
    } catch (error) {
      console.error('Update company error:', error);
      res.status(500).json({
        error: 'Failed to update company',
        code: 'COMPANY_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @route DELETE /companies/:id
 * @desc Delete company
 * @access Private (ADMIN only)
 */
router.delete('/:id', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          _count: {
            select: {
              members: true,
              issues: true
            }
          }
        }
      });

      if (!company) {
        return res.status(404).json({
          error: 'Company not found',
          code: 'COMPANY_NOT_FOUND'
        });
      }

      // Check if company has members or issues
      if (company._count.members > 0 || company._count.issues > 0) {
        return res.status(400).json({
          error: 'Cannot delete company with members or issues',
          code: 'COMPANY_HAS_DATA',
          data: {
            members: company._count.members,
            issues: company._count.issues
          }
        });
      }

      await prisma.company.delete({
        where: { id: companyId }
      });

      res.json({
        message: 'Company deleted successfully'
      });
    } catch (error) {
      console.error('Delete company error:', error);
      res.status(500).json({
        error: 'Failed to delete company',
        code: 'COMPANY_DELETION_ERROR'
      });
    }
  }
);

/**
 * @route GET /companies/stats/summary
 * @desc Get company statistics
 * @access Private (ADMIN only)
 */
router.get('/stats/summary', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const [totalCompanies, companiesWithMembers, companiesWithIssues] = 
        await Promise.all([
          prisma.company.count(),
          prisma.company.count({
            where: {
              members: {
                some: {}
              }
            }
          }),
          prisma.company.count({
            where: {
              issues: {
                some: {}
              }
            }
          })
        ]);

      res.json({
        message: 'Company statistics retrieved successfully',
        data: {
          summary: {
            total: totalCompanies,
            withMembers: companiesWithMembers,
            withIssues: companiesWithIssues
          }
        }
      });
    } catch (error) {
      console.error('Get company stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve company statistics',
        code: 'COMPANY_STATS_ERROR'
      });
    }
  }
);

export default router;