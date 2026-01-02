# 🚀 GitHub Setup Guide

## Prerequisites Installation

### 1. Install Git for Windows
1. Go to: https://git-scm.com/download/windows
2. Download and install Git
3. During installation, choose "Git from the command line and also from 3rd-party software"
4. Restart your terminal/command prompt after installation

### 2. Verify Git Installation
Open Command Prompt or PowerShell and run:
```bash
git --version
```
You should see something like: `git version 2.x.x`

## GitHub Repository Setup

### Step 1: Create Repository on GitHub
1. Go to **github.com/codebycartoon**
2. Click ➕ (top right) → **New repository**
3. Fill in:
   - **Repository name**: `student-attachment-management-system`
   - **Description**: `A web-based system for managing student industrial attachment applications, company postings, and approvals.`
   - **Visibility**: ✅ Public
   - **Initialize**: ❌ Don't check any boxes (we have files already)
4. Click **Create repository**

### Step 2: Connect Local Project to GitHub
Open Command Prompt/PowerShell in your project folder:
```bash
cd "C:\Users\carto\OneDrive\Desktop\student-attachment-management-system\student-attachment-management-system"
```

Initialize Git and add files:
```bash
git init
git add .
git commit -m "Initial commit: Professional Student Attachment Management System"
```

Connect to your GitHub repository:
```bash
git remote add origin https://github.com/codebycartoon/student-attachment-management-system.git
git branch -M main
git push -u origin main
```

### Step 3: Verify Upload
1. Go to your GitHub repository
2. You should see all your files uploaded
3. Check that the README.md displays properly

## What You'll Have on GitHub

Your repository will show:
- ✅ Professional project structure
- ✅ Complete backend API with authentication
- ✅ Database schema and configuration
- ✅ Comprehensive documentation
- ✅ Production-ready code

## Troubleshooting

### If Git push fails:
1. Make sure you're logged into GitHub
2. You might need to authenticate with GitHub:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

### If repository already exists:
```bash
git remote set-url origin https://github.com/codebycartoon/student-attachment-management-system.git
```

## Next Steps After GitHub Setup

1. **Test the API locally**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Set up PostgreSQL database**:
   - Install PostgreSQL
   - Create database: `student_attachment_db`
   - Update `.env` with your credentials
   - Run: `npm run init-db`

3. **Test API endpoints** using the commands in `test-api.md`

---

**Once you complete this setup, your GitHub will look incredibly professional!** 🚀