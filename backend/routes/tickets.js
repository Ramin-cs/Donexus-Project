import express from 'express';
import { prisma } from '../db/index.js';
import { 
  authenticateToken, 
  requireRole, 
  requireSameOrganization 
} from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route GET /tickets
 * @desc Get all tickets with filtering and pagination
 * @access Private (NORMAL, SUPPORT, ADMIN)
 */
router.get('/', 
  authenticateToken, 
  validateRequest(schemas.listTickets),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause based on user role and filters
      let whereClause = {};

      // Role-based filtering
      if (req.user.userType === 'ADMIN') {
        // Admin can see all tickets
      } else if (req.user.userType === 'SUPPORT') {
        // Support can see tickets from their organization
        whereClause.companyId = req.user.companyId;
      } else {
        // Normal users can only see their own tickets
        whereClause.personId = req.user.id;
      }

      // Status filter
      if (status) {
        whereClause.state = status;
      }

      // Search filter
      if (search) {
        whereClause.OR = [
          { subject: { contains: search, mode: 'insensitive' } },
          { details: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get tickets with pagination
      const [tickets, totalCount] = await Promise.all([
        prisma.issue.findMany({
          where: whereClause,
          include: {
            person: {
              select: {
                id: true,
                fullName: true,
                emailAddress: true
              }
            },
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
        prisma.issue.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.json({
        message: 'Tickets retrieved successfully',
        data: {
          tickets,
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
      console.error('Get tickets error:', error);
      res.status(500).json({
        error: 'Failed to retrieve tickets',
        code: 'TICKETS_RETRIEVAL_ERROR'
      });
    }
  }
);

/**
 * @route GET /tickets/:id
 * @desc Get specific ticket by ID
 * @access Private (NORMAL, SUPPORT, ADMIN)
 */
router.get('/:id', 
  authenticateToken, 
  validateRequest(schemas.getTicket),
  requireSameOrganization,
  async (req, res) => {
    try {
      const ticket = await prisma.issue.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          person: {
            select: {
              id: true,
              fullName: true,
              emailAddress: true
            }
          },
          company: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found',
          code: 'TICKET_NOT_FOUND'
        });
      }

      res.json({
        message: 'Ticket retrieved successfully',
        data: { ticket }
      });
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({
        error: 'Failed to retrieve ticket',
        code: 'TICKET_RETRIEVAL_ERROR'
      });
    }
  }
);

/**
 * @route POST /tickets
 * @desc Create new ticket
 * @access Private (NORMAL, SUPPORT, ADMIN)
 */
router.post('/', 
  authenticateToken, 
  validateRequest(schemas.createTicket),
  async (req, res) => {
    try {
      const { subject, details, state = 'open' } = req.body;

      const ticket = await prisma.issue.create({
        data: {
          subject,
          details,
          state,
          personId: req.user.id,
          companyId: req.user.companyId
        },
        include: {
          person: {
            select: {
              id: true,
              fullName: true,
              emailAddress: true
            }
          },
          company: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Ticket created successfully',
        data: { ticket }
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({
        error: 'Failed to create ticket',
        code: 'TICKET_CREATION_ERROR'
      });
    }
  }
);

/**
 * @route PATCH /tickets/:id
 * @desc Update ticket
 * @access Private (SUPPORT, ADMIN) - Users can only update their own tickets
 */
router.patch('/:id', 
  authenticateToken, 
  validateRequest(schemas.updateTicket),
  requireSameOrganization,
  async (req, res) => {
    try {
      const { subject, details, state } = req.body;
      const ticketId = parseInt(req.params.id);

      // Check if user can update this ticket
      const canUpdate = req.user.userType === 'ADMIN' || 
                       req.user.userType === 'SUPPORT' ||
                       (req.user.userType === 'NORMAL' && req.ticket.personId === req.user.id);

      if (!canUpdate) {
        return res.status(403).json({
          error: 'Insufficient permissions to update this ticket',
          code: 'UPDATE_PERMISSION_DENIED'
        });
      }

      const updatedTicket = await prisma.issue.update({
        where: { id: ticketId },
        data: {
          ...(subject && { subject }),
          ...(details !== undefined && { details }),
          ...(state && { state })
        },
        include: {
          person: {
            select: {
              id: true,
              fullName: true,
              emailAddress: true
            }
          },
          company: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.json({
        message: 'Ticket updated successfully',
        data: { ticket: updatedTicket }
      });
    } catch (error) {
      console.error('Update ticket error:', error);
      res.status(500).json({
        error: 'Failed to update ticket',
        code: 'TICKET_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @route DELETE /tickets/:id
 * @desc Delete ticket
 * @access Private (ADMIN only)
 */
router.delete('/:id', 
  authenticateToken, 
  validateRequest(schemas.deleteTicket),
  requireRole(['ADMIN']),
  requireSameOrganization,
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);

      await prisma.issue.delete({
        where: { id: ticketId }
      });

      res.json({
        message: 'Ticket deleted successfully'
      });
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({
        error: 'Failed to delete ticket',
        code: 'TICKET_DELETION_ERROR'
      });
    }
  }
);

/**
 * @route GET /tickets/stats/summary
 * @desc Get ticket statistics
 * @access Private (SUPPORT, ADMIN)
 */
router.get('/stats/summary', 
  authenticateToken, 
  requireRole(['SUPPORT', 'ADMIN']),
  async (req, res) => {
    try {
      let whereClause = {};

      // Role-based filtering
      if (req.user.userType === 'SUPPORT') {
        whereClause.companyId = req.user.companyId;
      }
      // Admin can see all tickets

      const [totalTickets, openTickets, pendingTickets, closedTickets, resolvedTickets] = 
        await Promise.all([
          prisma.issue.count({ where: whereClause }),
          prisma.issue.count({ where: { ...whereClause, state: 'open' } }),
          prisma.issue.count({ where: { ...whereClause, state: 'pending' } }),
          prisma.issue.count({ where: { ...whereClause, state: 'closed' } }),
          prisma.issue.count({ where: { ...whereClause, state: 'resolved' } })
        ]);

      res.json({
        message: 'Ticket statistics retrieved successfully',
        data: {
          summary: {
            total: totalTickets,
            open: openTickets,
            pending: pendingTickets,
            closed: closedTickets,
            resolved: resolvedTickets
          }
        }
      });
    } catch (error) {
      console.error('Get ticket stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve ticket statistics',
        code: 'TICKET_STATS_ERROR'
      });
    }
  }
);

export default router;