@echo off
echo ========================================
echo Student Attachment Management System
echo GitHub Setup Script
echo ========================================
echo.

echo Step 1: Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo Please install Git first:
    echo 1. Go to: https://git-scm.com/download/windows
    echo 2. Download and install Git for Windows
    echo 3. Restart this script after installation
    echo.
    pause
    exit /b 1
)

echo ✅ Git is installed!
echo.

echo Step 2: Initializing Git repository...
git init

echo Step 3: Adding all files...
git add .

echo Step 4: Creating initial commit...
git commit -m "Initial commit: Professional Student Attachment Management System

- Complete authentication system with JWT and bcrypt
- PostgreSQL database schema and models  
- RESTful API with proper error handling
- Role-based authorization (student, company, admin)
- Professional project structure and documentation
- Ready for production deployment"

echo Step 5: Connecting to GitHub...
git remote add origin https://github.com/codebycartoon/student-attachment-management-system.git

echo Step 6: Setting main branch...
git branch -M main

echo Step 7: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo ✅ SUCCESS! Your project is now on GitHub!
echo ========================================
echo.
echo Visit: https://github.com/codebycartoon/student-attachment-management-system
echo.
pause