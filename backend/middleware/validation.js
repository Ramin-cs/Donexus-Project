import { z } from 'zod';

/**
 * Validation middleware using Zod schemas
 * @param {z.ZodSchema} schema - Zod schema for validation
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Validation processing failed',
        code: 'VALIDATION_PROCESSING_ERROR'
      });
    }
  };
};

// Validation schemas
export const schemas = {
  // Authentication schemas
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters')
    })
  }),

  register: z.object({
    body: z.object({
      fullName: z.string().min(2, 'Full name must be at least 2 characters'),
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      companyId: z.number().int().positive('Company ID must be a positive integer')
    })
  }),

  // Ticket schemas
  createTicket: z.object({
    body: z.object({
      subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject too long'),
      details: z.string().optional(),
      state: z.enum(['open', 'pending', 'closed', 'resolved']).optional()
    })
  }),

  updateTicket: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Ticket ID must be a number')
    }),
    body: z.object({
      subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject too long').optional(),
      details: z.string().optional(),
      state: z.enum(['open', 'pending', 'closed', 'resolved']).optional()
    })
  }),

  getTicket: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Ticket ID must be a number')
    })
  }),

  deleteTicket: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Ticket ID must be a number')
    })
  }),

  // User management schemas
  createUser: z.object({
    body: z.object({
      fullName: z.string().min(2, 'Full name must be at least 2 characters'),
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      userType: z.enum(['NORMAL', 'SUPPORT', 'ADMIN']).optional(),
      companyId: z.number().int().positive('Company ID must be a positive integer')
    })
  }),

  updateUser: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, 'User ID must be a number')
    }),
    body: z.object({
      fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
      email: z.string().email('Invalid email format').optional(),
      userType: z.enum(['NORMAL', 'SUPPORT', 'ADMIN']).optional(),
      companyId: z.number().int().positive('Company ID must be a positive integer').optional()
    })
  }),

  // Company schemas
  createCompany: z.object({
    body: z.object({
      title: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long')
    })
  }),

  // Query schemas
  listTickets: z.object({
    query: z.object({
      page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
      limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
      status: z.enum(['open', 'pending', 'closed', 'resolved']).optional(),
      search: z.string().optional()
    })
  }),

  listUsers: z.object({
    query: z.object({
      page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
      limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
      userType: z.enum(['NORMAL', 'SUPPORT', 'ADMIN']).optional(),
      companyId: z.string().regex(/^\d+$/, 'Company ID must be a number').optional()
    })
  })
};