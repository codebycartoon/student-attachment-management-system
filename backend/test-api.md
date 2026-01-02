# 🧪 API Testing Guide

## Base URL
```
http://localhost:5000
```

## 🔐 Authentication Flow

### 1. Register Users
```powershell
# Register Company
$body = @{
    name = "TechCorp Solutions"
    email = "company@techcorp.com"
    password = "company123"
    role = "company"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# Register Student
$body = @{
    name = "John Doe"
    email = "student@university.edu"
    password = "student123"
    role = "student"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### 2. Login and Get Tokens
```powershell
# Company Login
$body = @{
    email = "company@techcorp.com"
    password = "company123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$companyToken = ($response.Content | ConvertFrom-Json).token

# Student Login
$body = @{
    email = "student@university.edu"
    password = "student123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$studentToken = ($response.Content | ConvertFrom-Json).token
```

## 🏢 Company Workflow

### 1. Create Opportunity
```powershell
$headers = @{ "Authorization" = "Bearer $companyToken" }
$body = @{
    title = "Software Development Internship"
    description = "Join our team as a software development intern. Work on real projects using React, Node.js, and PostgreSQL."
    requirements = "Computer Science student, knowledge of JavaScript, HTML, CSS. Familiarity with React is a plus."
    slots = 3
    deadline = "2026-06-30"
    location = "Nairobi, Kenya"
    duration_months = 6
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/opportunities" -Method POST -Body $body -ContentType "application/json" -Headers $headers -UseBasicParsing
```

### 2. View Company Opportunities
```powershell
$headers = @{ "Authorization" = "Bearer $companyToken" }
Invoke-WebRequest -Uri "http://localhost:5000/opportunities/company/my" -Headers $headers -UseBasicParsing
```

### 3. View Applications for Opportunity
```powershell
$headers = @{ "Authorization" = "Bearer $companyToken" }
Invoke-WebRequest -Uri "http://localhost:5000/applications/opportunity/1" -Headers $headers -UseBasicParsing
```

### 4. Update Application Status
```powershell
$headers = @{ "Authorization" = "Bearer $companyToken" }
$body = @{ status = "accepted" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/applications/1/opportunity/1/status" -Method PATCH -Body $body -ContentType "application/json" -Headers $headers -UseBasicParsing
```

## 👨‍🎓 Student Workflow

### 1. Browse Active Opportunities
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/opportunities/active" -UseBasicParsing
```

### 2. Search Opportunities
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/opportunities/search?q=software&industry=technology" -UseBasicParsing
```

### 3. Apply for Opportunity
```powershell
$headers = @{ "Authorization" = "Bearer $studentToken" }
$body = @{
    opportunity_id = 1
    cover_letter = "Dear TechCorp Solutions, I am very interested in the Software Development Internship position. As a third-year Computer Science student, I have solid knowledge of JavaScript, HTML, and CSS, and I have been learning React through personal projects. I am eager to apply my skills in a real-world environment and contribute to your team while gaining valuable industry experience."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/applications" -Method POST -Body $body -ContentType "application/json" -Headers $headers -UseBasicParsing
```

### 4. View My Applications
```powershell
$headers = @{ "Authorization" = "Bearer $studentToken" }
Invoke-WebRequest -Uri "http://localhost:5000/applications/my" -Headers $headers -UseBasicParsing
```

## 🔍 System Endpoints

### Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

### API Information
```powershell
Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing
```

## 📊 Response Examples

### Successful Opportunity Creation
```json
{
  "message": "Opportunity created successfully",
  "opportunity": {
    "id": 1,
    "company_id": 1,
    "title": "Software Development Internship",
    "description": "Join our team as a software development intern...",
    "slots": 3,
    "deadline": "2026-06-30T07:00:00.000Z",
    "location": "Nairobi, Kenya",
    "duration_months": 6,
    "is_active": true,
    "created_at": "2026-01-02T13:17:49.302Z"
  }
}
```

### Successful Application Submission
```json
{
  "message": "Application submitted successfully",
  "application": {
    "id": 1,
    "student_id": 1,
    "opportunity_id": 1,
    "status": "pending",
    "cover_letter": "Dear TechCorp Solutions...",
    "applied_at": "2026-01-02T13:19:56.330Z"
  }
}
```

## 🚀 Quick Setup Commands

```bash
# Database setup
npm run create-db
npm run init-db
npm run seed-data

# Start development server
npm run dev
```

## 📝 Test Accounts (After Seeding)

- **Company**: `company@techcorp.com` / `company123`
- **Student**: `student@university.edu` / `student123`
- **Admin**: `admin@system.com` / `admin123`

## 🔒 Security Notes

- All protected routes require `Authorization: Bearer <token>` header
- JWT tokens expire in 7 days by default
- Passwords must be at least 6 characters
- Email format is validated
- Role-based access control enforced on all endpoints