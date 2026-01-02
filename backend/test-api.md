# API Testing Guide

## Base URL
```
http://localhost:5000
```

## Authentication Endpoints

### 1. Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**PowerShell Test:**
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
    role = "student"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### 2. Login User
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**PowerShell Test:**
```powershell
$body = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### 3. Get Profile (Protected)
```bash
GET /auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**PowerShell Test:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE"
}

Invoke-WebRequest -Uri "http://localhost:5000/auth/profile" -Headers $headers -UseBasicParsing
```

### 4. Update Profile (Protected)
```bash
PUT /auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

## System Endpoints

### Health Check
```bash
GET /health
```

**PowerShell Test:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

### API Info
```bash
GET /
```

**PowerShell Test:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing
```

## Response Examples

### Successful Registration
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Successful Login
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response
```json
{
  "message": "User with this email already exists"
}
```

## Valid Roles
- `student`
- `company`
- `admin`

## Notes
- JWT tokens expire in 7 days by default
- Passwords must be at least 6 characters
- Email format is validated
- All protected routes require `Authorization: Bearer <token>` header