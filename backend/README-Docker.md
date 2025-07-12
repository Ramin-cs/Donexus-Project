# Donexus Backend - Docker Setup

## 🐳 Docker Quick Start

### Prerequisites
- Docker
- Docker Compose

### 🚀 Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd backend
   ```

2. **Start the application with Docker Compose:**
   ```bash
   npm run docker:compose
   ```

3. **Access the application:**
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/ping

### 🧪 Running Tests with Docker

1. **Run tests in Docker:**
   ```bash
   npm run docker:test
   ```

2. **Clean up test containers:**
   ```bash
   npm run docker:test:down
   ```

### 🔧 Manual Docker Commands

#### Build the Docker image:
```bash
npm run docker:build
```

#### Run the container:
```bash
npm run docker:run
```

#### Stop the application:
```bash
npm run docker:compose:down
```

### 📊 Docker Services

#### Production Services:
- **Backend**: Node.js application on port 4000
- **PostgreSQL**: Database on port 5432

#### Test Services:
- **Backend Test**: Node.js application on port 4001
- **PostgreSQL Test**: Database on port 5433

### 🔍 Health Checks

The application includes health checks:
- Backend: `/ping` endpoint
- Database: PostgreSQL connection check

### 🛠️ Environment Variables

The application uses the following environment variables:
- `NODE_ENV`: Environment (development/production/test)
- `PORT`: Application port (default: 4000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: JWT refresh secret

### 📁 Docker Files

- `Dockerfile`: Main application container
- `docker-compose.yml`: Production services
- `docker-compose.test.yml`: Test services
- `.dockerignore`: Files to exclude from build

### 🚨 Troubleshooting

#### Common Issues:

1. **Port already in use:**
   ```bash
   # Stop existing containers
   docker-compose down
   ```

2. **Database connection issues:**
   ```bash
   # Restart with fresh database
   docker-compose down -v
   docker-compose up -d
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### 🔒 Security Features

- Non-root user in container
- Health checks for monitoring
- Environment variable configuration
- Volume mounts for data persistence