# Setup Instructions

## Prerequisites Installation

### 1. Install Git (if not already installed)
Download and install Git from: https://git-scm.com/download/windows

### 2. Install PostgreSQL (if not already installed)
Download and install PostgreSQL from: https://www.postgresql.org/download/windows/

## Project Setup

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Student Attachment Management System setup"
```

### 2. Create GitHub Repository
1. Go to GitHub.com and create a new repository named `student-attachment-management-system`
2. Don't initialize with README (we already have one)
3. Copy the repository URL

### 3. Connect to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/student-attachment-management-system.git
git branch -M main
git push -u origin main
```

### 4. Database Setup
1. Open PostgreSQL command line (psql)
2. Create database:
```sql
CREATE DATABASE student_attachment_db;
```
3. Update `.env` file with your PostgreSQL credentials

### 5. Test the Application
```bash
cd backend
npm run dev
```

Visit: http://localhost:5000

## Next Steps
- Set up authentication system
- Create user registration/login
- Build opportunity management
- Develop application system

## Project Structure Created
```
student-attachment-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── app.js
│   ├── package.json
│   └── .env
├── README.md
├── .gitignore
└── setup.md
```