# HollowKit Microservices

A modern NestJS microservices monorepo with gRPC communication, Prisma ORM, and TypeScript.

## 🏗️ Architecture
```
hollowkit/
├── apps/                      # Microservice applications
│   ├── api-gateway/          # HTTP REST API Gateway
│   └── user-service/         # User management microservice
├── libs/                     # Shared libraries
│   ├── constants/           # Shared constants and configurations
│   ├── logger/             # Winston-based logging service
│   ├── proto/              # Protocol Buffer definitions
│   ├── shared/             # Shared utilities and components
│   └── types/              # Generated TypeScript types from protobuf
└── scripts/                # Build and automation scripts
```

## 🚀 Quick Start

### Prerequisites

**System Dependencies (Fedora/RHEL):**
```bash
# Install required system packages
sudo dnf install -y nodejs npm yarn protobuf-compiler protobuf-devel

# Install Bun (modern JavaScript runtime)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or restart terminal
```

**Other distributions:**
- **Ubuntu/Debian:** `sudo apt install nodejs npm yarn protobuf-compiler libprotobuf-dev`
- **macOS:** `brew install node yarn protobuf bun`
- **Arch:** `sudo pacman -S nodejs npm yarn protobuf`

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url> hollowkit
cd hollowkit
yarn install
```

2. **Generate Prisma client:**
```bash
cd apps/user-service
yarn prisma:generate
yarn prisma:push  # Create database schema
cd ../..
```

3. **Generate protobuf types (optional for development):**
```bash
yarn proto:compile
```

## 🏃 Running the Services

### Development Mode (No Build Required)

**Start all services with Bun:**
```bash
# Terminal 1 - User Service (gRPC - port 50051)
yarn start:user-service

# Terminal 2 - API Gateway (HTTP - port 3000)
yarn start:gateway
```

**Alternative - Individual services:**
```bash
# User Service
cd apps/user-service && bun --watch src/main.ts

# API Gateway
cd apps/api-gateway && bun --watch src/main.ts
```

### Production Mode

```bash
# Build all services (required for production)
cd apps/api-gateway && yarn build
cd ../user-service && yarn build

# Start services with Node.js
cd apps/user-service && yarn start:prod
cd ../api-gateway && yarn start:prod
```

## 📡 API Documentation

### REST API (API Gateway)

- **Base URL:** `http://localhost:3000/api/v1`
- **Swagger UI:** `http://localhost:3000/api/docs`

#### User Endpoints

```http
POST   /api/v1/users              # Create user
GET    /api/v1/users              # List users (with pagination)
GET    /api/v1/users/:id          # Get user by ID
PUT    /api/v1/users/:id          # Update user
DELETE /api/v1/users/:id          # Delete user
GET    /api/v1/users/email/:email # Get user by email
```

#### Example Requests

**Create User:**
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "securePassword123",
    "role": "user"
  }'
```

**List Users:**
```bash
curl "http://localhost:3000/api/v1/users?page=1&limit=10&search=john"
```

### gRPC Services

#### User Service (Port 50051)

```protobuf
service UserService {
  rpc CreateUser(CreateUserRequest) returns (UserResponse);
  rpc GetUser(GetUserRequest) returns (UserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc GetUserByEmail(GetUserByEmailRequest) returns (UserResponse);
}
```

## 🗄️ Database

### Prisma Setup

The project uses **Prisma ORM** with SQLite for development and can be configured for PostgreSQL/MySQL in production.

**Database Commands:**
```bash
cd apps/user-service

# Generate Prisma client
yarn prisma:generate

# Push schema to database
yarn prisma:push

# Create and run migrations
yarn prisma:migrate

# Reset database
yarn prisma:reset

# Open Prisma Studio
yarn prisma:studio
```

**Environment Variables (.env):**
```env
# User Service
DATABASE_URL="file:./dev.db"
NODE_ENV=development
LOG_LEVEL=info
GRPC_PORT=50051

# API Gateway
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=*
USER_SERVICE_URL=localhost:50051
```

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  password  String   // Bcrypt hashed
  role      String   @default("user")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 🔧 Development

### Adding a New Microservice

1. **Create service structure:**
```bash
mkdir -p apps/new-service/src
cd apps/new-service
```

2. **Create package.json:**
```json
{
  "name": "@hollowkit/new-service",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch"
  },
  "dependencies": {
    "@hollowkit/logger": "file:../../libs/logger",
    "@hollowkit/shared": "file:../../libs/shared",
    "@hollowkit/constants": "file:../../libs/constants",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/microservices": "^10.0.0"
  }
}
```

3. **Create NestJS files:**
```bash
# Create basic NestJS structure
touch src/main.ts src/app.module.ts
touch nest-cli.json tsconfig.json
```

4. **Define protobuf service:**
```bash
# Add to libs/proto/new-service.proto
# Update libs/constants/src/services.ts
# Run: yarn proto:compile
```

5. **Update API Gateway:**
```typescript
// Add to apps/api-gateway/src/new-service/
// Register in app.module.ts
```

### Protocol Buffers

**Adding new proto definitions:**

1. Create `libs/proto/service-name.proto`
2. Define service and messages
3. Update `libs/constants/src/services.ts` with ports and service names
4. Run `yarn proto:compile` to generate TypeScript types
5. Types will be available in `libs/types/src/`

**Example proto file:**
```protobuf
syntax = "proto3";
package servicename;

service ServiceNameService {
  rpc CreateItem(CreateItemRequest) returns (ItemResponse);
  rpc GetItem(GetItemRequest) returns (ItemResponse);
}

message Item {
  string id = 1;
  string name = 2;
}

message CreateItemRequest {
  string name = 1;
}

message GetItemRequest {
  string id = 1;
}

message ItemResponse {
  Item item = 1;
  string message = 2;
}
```

### Logging

The project includes a comprehensive Winston-based logging system:

```typescript
import { CustomLogger } from '@hollowkit/logger';

// In your service
constructor(private logger: CustomLogger) {}

// Usage
this.logger.log('Info message');
this.logger.error('Error message', error.stack);
this.logger.success('Success message');
this.logger.start('Service started');
this.logger.logRequest('GET', '/users');
this.logger.logGrpcCall('CreateUser', 'UserService');
```

**Log Features:**
- ✅ Colored console output with emojis
- 📝 File rotation (daily logs)
- 🔍 Request/Response logging
- ⚡ Performance timing
- 🌐 HTTP and gRPC interceptors
- 📊 Structured JSON logs

### Testing

```bash
# Run all tests
yarn test

# Run tests for specific service
cd apps/user-service && yarn test

# Coverage reports
yarn test:cov

# E2E tests
yarn test:e2e
```

### Code Quality

```bash
# Lint all code
yarn lint

# Format code
yarn format

# Type checking
yarn build
```

## 🐳 Docker Support

**Docker Compose (optional):**
```yaml
# docker-compose.yml
version: '3.8'
services:
  user-service:
    build: ./apps/user-service
    ports:
      - "50051:50051"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/hollowkit
  
  api-gateway:
    build: ./apps/api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - user-service
```

**Commands:**
```bash
yarn docker:build
yarn docker:up
yarn docker:down
```

## 🔧 Configuration

### Service Ports

| Service | Type | Port | Description |
|---------|------|------|-------------|
| API Gateway | HTTP | 3000 | REST API |
| User Service | gRPC | 50051 | User management |

### Environment Variables

**Global (.env):**
```env
NODE_ENV=development
LOG_LEVEL=info
```

**Service-specific:**
- `apps/api-gateway/.env`
- `apps/user-service/.env`

## 🎯 Production Deployment

### Build for Production

```bash
# Build all services
yarn build

# Or individual services
cd apps/api-gateway && yarn build
cd apps/user-service && yarn build
```

### Environment Setup

1. **Database:** Configure production database in `DATABASE_URL`
2. **Secrets:** Use proper secret management for passwords/keys
3. **Monitoring:** Enable structured logging and monitoring
4. **Load Balancing:** Use nginx/traefik for API Gateway
5. **Service Discovery:** Consider consul/etcd for service discovery

### Performance Optimization

- Enable gzip compression (already configured)
- Use Redis for caching
- Implement connection pooling
- Monitor with Prometheus/Grafana
- Use PM2 or Docker for process management

## 🆘 Troubleshooting

### Common Issues

**Import Errors:**
```bash
# Build libraries first
cd libs/logger && yarn build
cd ../shared && yarn build
cd ../constants && yarn build
cd ../types && yarn build
```

**gRPC Connection Issues:**
- Check if user-service is running on port 50051
- Verify proto file paths in service configuration
- Ensure firewall allows gRPC traffic

**Database Issues:**
```bash
cd apps/user-service
yarn prisma:generate  # Regenerate client
yarn prisma:push      # Apply schema changes
yarn prisma:reset     # Reset database (dev only)
```

**TypeScript Errors:**
```bash
# Clean build
rm -rf dist node_modules
yarn install
yarn build
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Start services with debug
yarn start:debug
```

## 📚 Project Structure Details

### Shared Libraries

- **`@hollowkit/logger`**: Winston-based logging with interceptors
- **`@hollowkit/shared`**: Common utilities, guards, filters, decorators
- **`@hollowkit/constants`**: Service configuration and constants
- **`@hollowkit/types`**: Generated protobuf TypeScript types

### Features

✅ **Microservices Architecture** - Scalable service-oriented design  
✅ **gRPC Communication** - High-performance inter-service communication  
✅ **REST API Gateway** - HTTP interface with Swagger documentation  
✅ **Prisma ORM** - Type-safe database operations  
✅ **Winston Logging** - Structured logging with rotation  
✅ **TypeScript** - Full type safety across the stack  
✅ **Yarn Workspaces** - Efficient monorepo dependency management  
✅ **Protocol Buffers** - Efficient serialization and type generation  
✅ **Validation** - Request validation with class-validator  
✅ **Exception Handling** - Global error handling and filtering  
✅ **CORS Support** - Cross-origin resource sharing configuration  
✅ **Security** - Helmet security headers  

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run linting and tests: `yarn lint && yarn test`
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

[MIT License](LICENSE)

## 🔗 Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [gRPC Node.js Guide](https://grpc.io/docs/languages/node/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [Winston Logging](https://github.com/winstonjs/winston)
