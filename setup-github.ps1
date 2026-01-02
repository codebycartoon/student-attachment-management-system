Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Student Attachment Management System" -ForegroundColor Cyan
Write-Host "GitHub Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://git-scm.com/download/windows" -ForegroundColor White
    Write-Host "2. Download and install Git for Windows" -ForegroundColor White
    Write-Host "3. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow
git init

Write-Host "Step 3: Adding all files..." -ForegroundColor Yellow
git add .

Write-Host "Step 4: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Professional Student Attachment Management System

- Complete authentication system with JWT and bcrypt
- PostgreSQL database schema and models  
- RESTful API with proper error handling
- Role-based authorization (student, company, admin)
- Professional project structure and documentation
- Ready for production deployment"

Write-Host "Step 5: Connecting to GitHub..." -ForegroundColor Yellow
git remote add origin https://github.com/codebycartoon/student-attachment-management-system.git

Write-Host "Step 6: Setting main branch..." -ForegroundColor Yellow
git branch -M main

Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! Your project is now on GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Visit: https://github.com/codebycartoon/student-attachment-management-system" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Push failed. You might need to authenticate with GitHub." -ForegroundColor Red
    Write-Host "Try running these commands manually:" -ForegroundColor Yellow
    Write-Host "git config --global user.name 'Your Name'" -ForegroundColor White
    Write-Host "git config --global user.email 'your.email@example.com'" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"