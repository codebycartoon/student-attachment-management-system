# Student-Company Matching Platform

A comprehensive JWT-based authentication system for a student-company matching platform. Built with Node.js, TypeScript, Express, PostgreSQL, and Prisma.

## 🎯 Current Status: Authentication System Complete

✅ **JWT Authentication System**
- Secure user registration and login
- Role-based access control (Student, Company, Admin)
- JWT access tokens (15min) + refresh tokens (7 days)
- Password hashing with bcrypt (12 salt rounds)
- Session management with database storage
- Rate limiting for security

✅ **Role-Based Authorization**
- Student, Company, and Admin roles
- Protected routes with middleware
- Role-specific dashboard endpoints
- Proper 403/401 error handling

✅ **Database Integration**
- PostgreSQL with Prisma ORM
- User, Student, Company, Admin tables
- Session tracking and management
- Automatic profile creation on registration

## 🏗️ Technology Stack

- **Backend**: Node.js 20+, TypeScript, Express.js
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Security**: bcrypt, rate limiting, input validation
- **Development**: nodemon, ts-node, ESLint, Prettier

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/codebycartoon/student-company-matching-platform.git
cd student-company-matching-platform
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile (protected)

### Dashboards (Role-based)
- `GET /api/dashboard/student` - Student dashboard (Student only)
- `GET /api/dashboard/company` - Company dashboard (Company only)
- `GET /api/dashboard/admin` - Admin dashboard (Admin only)

### Health Check
- `GET /health` - Server health status

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🗄️ Database Schema

The system includes the following main tables:
- `users` - Core user accounts with authentication
- `students` - Student profiles and information
- `companies` - Company profiles and information
- `admins` - Admin accounts and permissions
- `user_sessions` - JWT session management

## 🔒 Security Features

- **Password Security**: bcrypt hashing with 12 salt rounds
- **JWT Tokens**: Short-lived access tokens with refresh token rotation
- **Rate Limiting**: 5 requests per 15 minutes for auth endpoints
- **Input Validation**: Strong password requirements and email validation
- **Role-Based Access**: Proper authorization middleware
- **Session Management**: Database-stored refresh tokens with expiration

## 🧪 Testing

The authentication system has been thoroughly tested:
- User registration for all roles (Student, Company, Admin)
- Login/logout functionality
- JWT token generation and validation
- Role-based access control
- Protected route access
- Token refresh mechanism

## 📁 Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Authentication & authorization
├── routes/          # API route definitions
├── validators/      # Input validation rules
├── config/          # Configuration files
└── server.ts        # Main server file

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## 🚀 Next Steps

This authentication foundation is ready for:
- Student profile management APIs
- Company dashboard and job posting features
- Admin panel for user management
- Matching algorithm implementation
- Frontend integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with TypeScript and modern web technologies**