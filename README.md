# 🎓 Student Attachment Management System

> A comprehensive web-based platform that streamlines industrial attachment placements for students, companies, and educational institutions.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Problem Statement

Traditional attachment placement processes are often manual, disorganized, and inefficient. Students struggle to find opportunities, companies have difficulty reaching qualified candidates, and administrators lack visibility into the entire process.

## 🚀 Solution Overview

Our system provides a centralized platform where:
- **👨‍🎓 Students** can discover and apply for attachment opportunities
- **🏢 Companies** can post positions and manage applications  
- **🛡️ Administrators** can oversee the entire placement process

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Student, Company, Admin)
- Password encryption with bcrypt
- Protected API endpoints

### 👥 User Management
- User registration and profile management
- Email validation and duplicate prevention
- Role-specific dashboards and permissions

### 📋 Opportunity Management
- Company opportunity posting
- Student application system
- Application status tracking
- Admin approval workflows

### 📊 Analytics & Reporting
- Placement statistics and metrics
- Application tracking and history
- System usage analytics

## 🏗️ Technical Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 12+
- **Authentication**: JWT + bcrypt
- **Environment**: dotenv configuration

### Database Schema
```sql
users (id, name, email, password, role, created_at)
├── students (user_id, registration_number, course, year)
├── companies (user_id, company_name, industry, location)
└── applications (student_id, opportunity_id, status)
```

### API Endpoints
```
Authentication:
POST   /auth/register     - User registration
POST   /auth/login        - User authentication
GET    /auth/profile      - Get user profile
PUT    /auth/profile      - Update profile

System:
GET    /                  - API information
GET    /health           - Health check
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ installed
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codebycartoon/student-attachment-management-system.git
   cd student-attachment-management-system
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb student_attachment_db
   
   # Initialize tables
   npm run init-db
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Test the API**
   ```bash
   curl http://localhost:5000
   ```

## 📡 API Documentation

### Authentication Flow
```javascript
// Register new user
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securepassword",
  "role": "student"
}

// Login
POST /auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}

// Access protected routes
GET /auth/profile
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "message": "Operation successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🗂️ Project Structure

```
student-attachment-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API route definitions
│   │   ├── scripts/         # Database initialization
│   │   └── app.js          # Express application entry point
│   ├── package.json
│   └── .env                # Environment variables
├── docs/                   # Documentation
├── README.md
└── .gitignore
```

## 🧪 Testing

### Manual API Testing
```bash
# Test registration
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"student"}'

# Test login  
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### PowerShell Testing (Windows)
See `backend/test-api.md` for comprehensive PowerShell test commands.

## 🚧 Development Status

- [x] **Phase 1**: Authentication & User Management ✅
- [x] **Phase 1**: Database Schema & Models ✅  
- [x] **Phase 1**: API Foundation & Security ✅
- [ ] **Phase 2**: Opportunity Management System
- [ ] **Phase 2**: Application Workflow
- [ ] **Phase 3**: Admin Dashboard
- [ ] **Phase 4**: Frontend Interface
- [ ] **Phase 5**: Production Deployment

## 🎯 Success Metrics

- Reduce placement time by 60%
- Increase student-company matching accuracy
- Provide real-time placement tracking
- Generate comprehensive placement reports

## 🤝 Contributing

This is an educational project. Contributions and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**codebycartoon**
- GitHub: [@codebycartoon](https://github.com/codebycartoon)

## 🙏 Acknowledgments

- Built as part of industrial attachment requirements
- Inspired by real-world placement challenges
- Designed with modern web development best practices

---

**⭐ If this project helped you, please give it a star!**