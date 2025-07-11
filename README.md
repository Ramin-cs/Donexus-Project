# 🎫 Advanced Ticketing System

A comprehensive, role-based ticketing system built with modern technologies and best practices. This project demonstrates a complete full-stack application with authentication, authorization, and a beautiful user interface.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** with three user types:
  - **NORMAL**: Can create tickets and view their own tickets
  - **SUPPORT**: Can view and manage tickets from their organization
  - **ADMIN**: Full access to all tickets, users, and companies
- **Secure password hashing** using bcrypt
- **Token refresh mechanism** for seamless user experience

### 🎫 Ticket Management
- **Create, read, update, delete** tickets with full CRUD operations
- **Status tracking** (open, pending, resolved, closed)
- **Organization-based access control** - users can only see tickets from their organization
- **Search and filtering** capabilities
- **Pagination** for large datasets
- **Real-time status updates**

### 👥 User Management (Admin Only)
- **User creation and management**
- **Role assignment** (NORMAL, SUPPORT, ADMIN)
- **Company assignment**
- **User statistics and analytics**

### 🏢 Company Management (Admin Only)
- **Company creation and management**
- **Member and ticket statistics**
- **Data integrity protection** (cannot delete companies with active data)

### 🛡️ Security Features
- **Rate limiting** to prevent abuse
- **Helmet.js** for security headers
- **CORS configuration** for cross-origin requests
- **Input validation** using Zod schemas
- **SQL injection protection** via Prisma ORM
- **XSS protection** with proper content security policies

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Beautiful gradient background** and modern card-based layout
- **Smooth animations** and hover effects
- **Modal dialogs** for forms
- **Status indicators** with color coding
- **Role-based UI** that adapts to user permissions

## 📸 Screenshots

### 🔐 Login Page
![Login Page]([https://i.imgur.com/8XZqY2L.png](https://imgur.com/a/HOAGyPy))

### 🎫 Tickets Dashboard
![Tickets Dashboard](https://i.imgur.com/JQwE5mN.png)

## 🏗️ Architecture

### Backend Architecture
```
backend/
├── db/                 # Database service and Prisma client
├── middleware/         # Authentication, validation, and security middleware
├── routes/            # API route handlers
│   ├── auth.js        # Authentication routes
│   ├── tickets.js     # Ticket management routes
│   ├── users.js       # User management routes
│   └── companies.js   # Company management routes
├── prisma/            # Database schema and migrations
│   ├── schema.prisma  # Prisma schema definition
│   └── seed.js        # Database seeding script
├── tests/             # Manual test suite
│   ├── basic-tests.js
│   ├── validation-tests.js
│   ├── security-tests.js
│   └── run-tests.js
└── index.js           # Main application entry point
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── App.jsx        # Main application component
│   ├── App.css        # Modern styling
│   └── api.js         # API service layer
└── index.html         # HTML entry point
```

### Database Schema
- **Companies**: Organizations that users belong to
- **Users**: People with different roles and permissions
- **Tickets**: Support issues with status tracking
- **Session Tokens**: JWT refresh tokens for authentication

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** 
- **PostgreSQL 16+**
- **npm or yarn**

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd ticketing-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL Installation
```bash
# Create PostgreSQL database
createdb donexus_challenge

# Set up environment variables
cd backend
cp .env.example .env
```

#### Option B: Docker PostgreSQL (Optional)
```bash
# Start PostgreSQL with Docker
docker run --name donexus-postgres \
  -e POSTGRES_DB=donexus_challenge \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 3. Environment Configuration

Edit `backend/.env` file with your database credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/donexus_challenge"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Server Configuration
PORT=4000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

### 4. Database Migration and Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with test data
npm run db:seed
```

### 5. Start the Application

#### Development Mode
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in new terminal)
npm run dev

# Or start both simultaneously (from root directory)
npm run dev:all
```

#### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/ping

## 🐳 Docker Setup (Optional)

If you prefer to use Docker, the project includes complete Docker configuration:

### Prerequisites
- **Docker**
- **Docker Compose**

### Quick Start with Docker
```bash
# Start the entire application with Docker
cd backend
npm run docker:compose

# Run tests in Docker
npm run docker:test

# Stop the application
npm run docker:compose:down
```

### Manual Docker Commands
```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Stop containers
npm run docker:compose:down
```

For detailed Docker documentation, see [README-Docker.md](README-Docker.md).

## 👤 Test Accounts

The system comes with pre-seeded test accounts:

| Role | Email | Password | Company |
|------|-------|----------|---------|
| Admin | admin@acme.com | password123 | Acme Corp |
| Support | support@acme.com | password123 | Acme Corp |
| User | user1@acme.com | password123 | Acme Corp |
| Admin | admin@globex.com | password123 | Globex Inc |
| Support | support@globex.com | password123 | Globex Inc |
| User | user1@globex.com | password123 | Globex Inc |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Tickets
- `GET /api/tickets` - Get all tickets (with filtering)
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (admin only)
- `GET /api/tickets/stats/summary` - Get ticket statistics

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/summary` - Get user statistics

### Companies (Admin Only)
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get specific company
- `POST /api/companies` - Create new company
- `PATCH /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company
- `GET /api/companies/stats/summary` - Get company statistics

## 🛡️ Security Implementation

### Authentication Flow
1. **Login**: User provides credentials, receives JWT access token and refresh token
2. **Token Validation**: Each request validates JWT token and checks user permissions
3. **Token Refresh**: Automatic token refresh using refresh tokens
4. **Logout**: Tokens are revoked and cleared from client

### Authorization Matrix
| Action | NORMAL | SUPPORT | ADMIN |
|--------|--------|---------|-------|
| View own tickets | ✅ | ✅ | ✅ |
| View organization tickets | ❌ | ✅ | ✅ |
| View all tickets | ❌ | ❌ | ✅ |
| Create tickets | ✅ | ✅ | ✅ |
| Update ticket status | ❌ | ✅ | ✅ |
| Delete tickets | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Manage companies | ❌ | ❌ | ✅ |

### Security Measures
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs validated using Zod schemas
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CORS Protection**: Configured for specific origins
- **Password Security**: bcrypt hashing with 12 rounds

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-first approach** with responsive breakpoints
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly interface** with appropriate button sizes

### Modern Styling
- **Gradient backgrounds** for visual appeal
- **Card-based layout** for organized content presentation
- **Smooth animations** and hover effects
- **Color-coded status indicators** for quick recognition

### User Experience
- **Role-based navigation** that shows only relevant options
- **Modal dialogs** for forms to maintain context
- **Loading states** and error handling
- **Confirmation dialogs** for destructive actions

## 🧪 Testing

### Manual Test Suite
```bash
cd backend
npm test
```

The project includes a comprehensive manual test suite covering:
- **Basic API Tests**: Health checks, security headers, 404 handling
- **Validation Tests**: Input validation, authentication requirements
- **Security Tests**: Rate limiting, SQL injection protection, XSS protection

### Database Testing
```bash
cd backend
npm run db:studio  # Open Prisma Studio for database inspection
```

## 📊 Performance Features

- **Database indexing** on frequently queried fields
- **Pagination** to handle large datasets efficiently
- **Selective data fetching** to minimize payload size
- **Caching strategies** for frequently accessed data
- **Optimized queries** using Prisma's query optimization

## 🔄 Development Workflow

### Database Changes
```bash
# After modifying schema.prisma
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create and apply migrations
npm run db:seed      # Seed with test data
```

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript-like validation** with Zod schemas
- **Consistent error handling** across all endpoints

## 🚀 Deployment

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server Configuration
PORT=4000
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

## � Screenshots

### 🔐 Login Page
![Login Page](https://i.imgur.com/8XZqY2L.png)

### 🎫 Tickets Dashboard
![Tickets Dashboard](https://i.imgur.com/JQwE5mN.png)

## � Available Scripts

### Backend Scripts
```bash
npm run dev              # Start development server
npm start               # Start production server
npm test                # Run manual test suite
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data
npm run db:studio       # Open Prisma Studio
```

### Docker Scripts (Optional)
```bash
npm run docker:build    # Build Docker image
npm run docker:compose  # Start with Docker Compose
npm run docker:test     # Run tests in Docker
npm run docker:compose:down  # Stop Docker services
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
psql -l | grep donexus_challenge
```

#### Port Already in Use
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

#### Migration Issues
```bash
# Reset database and run migrations
npm run db:migrate:reset
npm run db:seed
```

#### Docker Issues
```bash
# Clean up Docker containers
docker-compose down -v
docker system prune -f

# Rebuild containers
docker-compose up --build
```

## 📈 Performance Optimization

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried fields
- **Query Optimization**: Using Prisma's query optimization
- **Connection Pooling**: Efficient database connection management

### Application Optimization
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Caching**: Implemented for frequently accessed data
- **Pagination**: Handles large datasets efficiently

### Security Optimization
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using Zod
- **SQL Injection Protection**: Parameterized queries via Prisma
- **XSS Protection**: Content Security Policy headers

---

**🎉 The Advanced Ticketing System is now ready for production use!**

This project demonstrates modern web development best practices with a focus on security, performance, and user experience. The comprehensive test suite ensures reliability, while the Docker setup provides easy deployment options.
