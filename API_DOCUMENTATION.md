# Milestone 3 - Student Data Engine API Documentation

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.
Students can only access their own data.

## Base URL
```
/api/student
```

## Student Profile Management

### Get Complete Profile
```http
GET /api/student/profile
```
**Response:**
```json
{
  "studentId": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "location": "string",
  "linkedinUrl": "string",
  "websiteUrl": "string",
  "elevatorPitch": "string",
  "user": {
    "email": "string",
    "status": "ACTIVE"
  },
  "profile": {
    "gpa": 3.8,
    "universityId": "string",
    "degreeId": "string",
    "majorId": "string",
    "university": { "name": "string" },
    "degree": { "name": "string" },
    "major": { "name": "string" }
  },
  "skills": [...],
  "experiences": [...],
  "projects": [...],
  "preferences": [...],
  "documents": [...],
  "metrics": {...}
}
```

### Update Profile
```http
PUT /api/student/profile
```
**Request Body:**
```json
{
  "basicInfo": {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "location": "string",
    "linkedinUrl": "string",
    "websiteUrl": "string",
    "elevatorPitch": "string"
  },
  "academicInfo": {
    "universityId": "string",
    "degreeId": "string",
    "majorId": "string",
    "gpa": 3.8,
    "graduationDate": "2024-05-15",
    "willingToRelocate": true,
    "remoteAllowed": true
  }
}
```

### Update Academic Profile
```http
PUT /api/student/profile/academic
```
**Request Body:**
```json
{
  "academicInfo": {
    "universityId": "string",
    "degreeId": "string",
    "majorId": "string",
    "gpa": 3.8,
    "graduationDate": "2024-05-15",
    "availabilityStartDate": "2024-06-01",
    "willingToRelocate": true,
    "remoteAllowed": true
  }
}
```

## Skills Management

### Update Skills
```http
PUT /api/student/skills
```
**Request Body:**
```json
{
  "skills": [
    {
      "skillId": "string",
      "proficiency": 4,
      "yearsOfExperience": 2
    }
  ]
}
```

### Add Single Skill
```http
POST /api/student/profile/skills
```
**Request Body:**
```json
{
  "skills": [
    {
      "skillId": "string",
      "proficiency": 4,
      "yearsOfExperience": 2
    }
  ]
}
```

### Update Specific Skill
```http
PUT /api/student/profile/skills/:skillId
```
**Request Body:**
```json
{
  "skills": [
    {
      "skillId": "string",
      "proficiency": 5,
      "yearsOfExperience": 3
    }
  ]
}
```

### Remove Skill
```http
DELETE /api/student/profile/skills/:skillId
```

## Experience & Projects

### Add Experience
```http
POST /api/student/experience
POST /api/student/profile/experiences
```
**Request Body:**
```json
{
  "jobTitle": "Software Developer Intern",
  "company": "Tech Company Inc",
  "startDate": "2023-06-01",
  "endDate": "2023-08-31",
  "employmentType": "INTERNSHIP",
  "description": "Worked on full-stack development",
  "technologies": ["skillId1", "skillId2"]
}
```

### Update Experience
```http
PUT /api/student/profile/experiences/:experienceId
```
**Request Body:**
```json
{
  "jobTitle": "Senior Software Developer Intern",
  "description": "Updated description with more responsibilities"
}
```

### Add Project
```http
POST /api/student/project
POST /api/student/profile/projects
```
**Request Body:**
```json
{
  "projectName": "Task Management App",
  "description": "A full-stack task management application",
  "projectType": "Personal",
  "startDate": "2023-05-01",
  "endDate": "2023-07-31",
  "githubUrl": "https://github.com/user/project",
  "liveUrl": "https://project-demo.vercel.app",
  "technologies": ["skillId1", "skillId2"]
}
```

## Preferences

### Update Preferences
```http
PUT /api/student/preferences
```
**Request Body:**
```json
{
  "preferences": [
    {
      "preferenceId": "string",
      "priority": 5
    }
  ]
}
```

## Document Management

### Upload Document
```http
POST /api/student/documents
```
**Form Data:**
- `document`: File (PDF, DOC, DOCX, TXT)
- `documentType`: "CV" | "TRANSCRIPT" | "COVER_LETTER" | "PORTFOLIO" | "CERTIFICATE"

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "documentId": "string",
      "fileName": "string",
      "documentType": "CV",
      "fileSize": 1024,
      "parseStatus": "PENDING",
      "uploadedAt": "2024-01-09T10:00:00Z"
    }
  }
}
```

### Upload CV
```http
POST /api/student/documents/cv
```
**Form Data:**
- `cv`: File (PDF, DOC, DOCX, TXT)

### Upload Transcript
```http
POST /api/student/documents/transcript
```
**Form Data:**
- `transcript`: File (PDF, DOC, DOCX, TXT)

### Get Documents
```http
GET /api/student/documents
```
**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "documentId": "string",
        "documentType": "CV",
        "fileName": "resume.pdf",
        "fileSize": 1024,
        "parseStatus": "COMPLETED",
        "uploadedAt": "2024-01-09T10:00:00Z",
        "parsedAt": "2024-01-09T10:01:00Z"
      }
    ]
  }
}
```

### Delete Document
```http
DELETE /api/student/documents/:documentId
```

### Get Parse Status
```http
GET /api/student/documents/:documentId/status
```
**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "string",
    "parseStatus": "COMPLETED",
    "parseError": null,
    "parsedAt": "2024-01-09T10:01:00Z"
  }
}
```

## Metrics & Analytics

### Get Metrics
```http
GET /api/student/metrics
```
**Response:**
```json
{
  "skillScore": 0.8,
  "academicScore": 0.85,
  "experienceScore": 0.7,
  "preferenceScore": 0.9,
  "hireabilityScore": 0.81,
  "lastComputed": "2024-01-09T10:00:00Z",
  "computeVersion": "1.0"
}
```

### Recompute Metrics
```http
POST /api/student/metrics/compute
```
**Response:**
```json
{
  "skillScore": 0.8,
  "academicScore": 0.85,
  "experienceScore": 0.7,
  "preferenceScore": 0.9,
  "hireabilityScore": 0.81,
  "lastComputed": "2024-01-09T10:00:00Z",
  "computeVersion": "1.0"
}
```

### Get Profile Completion
```http
GET /api/student/completion
```
**Response:**
```json
{
  "success": true,
  "data": {
    "percentage": 75,
    "completedSections": ["basicInfo", "academicInfo", "skills"],
    "missingFields": ["experience", "projects", "preferences", "documents"]
  }
}
```

## Dashboard

### Get Dashboard Overview
```http
GET /api/student/dashboard
```
**Response:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "url",
    "location": "San Francisco, CA"
  },
  "metrics": {
    "hireabilityScore": 0.81,
    "skillScore": 0.8,
    "academicScore": 0.85,
    "experienceScore": 0.7,
    "preferenceScore": 0.9,
    "lastComputed": "2024-01-09T10:00:00Z"
  },
  "applications": {
    "total": 5,
    "submitted": 2,
    "inReview": 2,
    "accepted": 1,
    "rejected": 0
  },
  "topOpportunities": [...],
  "upcomingInterviews": [...],
  "recentActivity": [...]
}
```

### Get Match Readiness
```http
GET /api/student/match-readiness
```
**Response:**
```json
{
  "overallScore": 0.81,
  "skillAnalysis": {
    "currentSkills": 5,
    "averageProficiency": 4.2,
    "score": 0.8
  },
  "academicAnalysis": {
    "gpa": 3.8,
    "coursesCompleted": 12,
    "score": 0.85
  },
  "experienceAnalysis": {
    "workExperience": 2,
    "projects": 3,
    "score": 0.7
  },
  "recommendations": [
    {
      "type": "skills",
      "title": "Add Cloud Technologies",
      "description": "Consider adding AWS or Azure skills",
      "priority": "high"
    }
  ],
  "skillGaps": [
    {
      "skill": "AWS",
      "importance": 8,
      "currentLevel": 0,
      "recommendedLevel": 3
    }
  ]
}
```

## Applications

### Get Applications
```http
GET /api/student/applications
```
**Response:**
```json
[
  {
    "applicationId": "string",
    "status": "SUBMITTED",
    "appliedAt": "2024-01-09T10:00:00Z",
    "matchScore": 0.85,
    "opportunity": {
      "title": "Frontend Developer Intern",
      "company": {
        "companyName": "Tech Corp",
        "logoPath": "url"
      }
    }
  }
]
```

### Apply to Opportunity
```http
POST /api/student/applications
```
**Request Body:**
```json
{
  "opportunityId": "string",
  "coverLetter": "I am very interested in this position..."
}
```

### Withdraw Application
```http
PATCH /api/student/applications/:applicationId/withdraw
```

### Get Opportunity Matches
```http
GET /api/student/opportunities/matches
```
**Response:**
```json
[
  {
    "opportunity": {...},
    "matchScore": 0.85,
    "skillMatch": 0.9,
    "academicFit": 0.8,
    "experienceMatch": 0.7,
    "preferenceFit": 0.9
  }
]
```

## Settings

### Get Account Settings
```http
GET /api/student/settings
```
**Response:**
```json
{
  "email": "student@example.com",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z",
  "notificationPreferences": {
    "emailNotifications": true,
    "applicationUpdates": true,
    "opportunityMatches": true,
    "interviewReminders": true
  },
  "privacySettings": {
    "profileVisibility": "public",
    "showEmail": false,
    "showPhone": false
  }
}
```

### Update Notification Preferences
```http
PUT /api/student/settings/notifications
```
**Request Body:**
```json
{
  "emailNotifications": true,
  "applicationUpdates": true,
  "opportunityMatches": false,
  "interviewReminders": true
}
```

### Change Password
```http
PUT /api/student/settings/password
```
**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limits

- **Profile operations**: 50 requests per 15 minutes
- **Dashboard operations**: 100 requests per 15 minutes
- **Document operations**: 10 requests per 15 minutes
- **Settings operations**: 20 requests per 15 minutes