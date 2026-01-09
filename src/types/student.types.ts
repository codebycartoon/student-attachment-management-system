/**
 * Student Profile Types
 * TypeScript definitions for student data structures
 */

export interface StudentProfileData {
  studentId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  elevatorPitch?: string;
  profilePicture?: string;
}

export interface StudentAcademicData {
  universityId?: string;
  degreeId?: string;
  majorId?: string;
  gpa?: number;
  graduationDate?: Date;
  availabilityStartDate?: Date;
  attachmentDuration?: number;
  willingToRelocate?: boolean;
  remoteAllowed?: boolean;
}

export interface ProfileUpdateData {
  basicInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    elevatorPitch?: string;
  };
  academicInfo?: StudentAcademicData;
}

export interface StudentSkillData {
  skillId: string;
  proficiency: number; // 1-5 scale
  yearsOfExperience?: number;
  verified?: boolean;
}

export interface StudentPreferenceData {
  preferenceId: string;
  priority: number; // 1-5 scale
}

export interface ExperienceData {
  jobTitle: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  role?: string;
  employmentType: 'INTERNSHIP' | 'PART_TIME' | 'FULL_TIME' | 'CONTRACT' | 'FREELANCE';
  description?: string;
  technologies: string[]; // skill IDs
}

export interface ProjectData {
  projectName: string;
  description?: string;
  projectType?: string;
  startDate?: Date;
  endDate?: Date;
  githubUrl?: string;
  liveUrl?: string;
  technologies: string[]; // skill IDs
}

export interface StudentMetricsData {
  studentMetricsId: string;
  studentId: string;
  skillScore: number;
  academicScore: number;
  experienceScore: number;
  preferenceScore: number;
  hireabilityScore: number;
  lastComputed: Date;
  computeVersion: string;
  metadata?: any;
}

export interface DocumentUploadData {
  documentType: 'CV' | 'TRANSCRIPT' | 'COVER_LETTER' | 'PORTFOLIO' | 'CERTIFICATE';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export interface ProfileCompletionData {
  percentage: number;
  missingFields: string[];
  completedSections: string[];
}

export interface SkillGapAnalysis {
  studentId: string;
  currentSkills: Array<{
    skillId: string;
    skillName: string;
    proficiency: number;
    category: string;
  }>;
  recommendedSkills: Array<{
    skillId: string;
    skillName: string;
    category: string;
    demandScore: number;
    reason: string;
  }>;
  improvementAreas: Array<{
    area: string;
    currentScore: number;
    targetScore: number;
    recommendations: string[];
  }>;
}

export interface HireabilityRecommendations {
  studentId: string;
  currentScore: number;
  targetScore: number;
  recommendations: Array<{
    category: 'skills' | 'academic' | 'experience' | 'preferences';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number; // Expected score improvement
    effort: 'low' | 'medium' | 'high';
  }>;
}

// API Request/Response types
export interface CreateStudentProfileRequest {
  basicInfo: StudentProfileData;
  academicInfo?: StudentAcademicData;
}

export interface UpdateSkillsRequest {
  skills: StudentSkillData[];
}

export interface UpdatePreferencesRequest {
  preferences: StudentPreferenceData[];
}

export interface AddExperienceRequest extends ExperienceData {}

export interface AddProjectRequest extends ProjectData {}

export interface StudentProfileResponse {
  success: boolean;
  data: {
    student: any; // Full student profile with relations
    metrics: StudentMetricsData;
    completion: ProfileCompletionData;
  };
  message?: string;
}

export interface StudentMetricsResponse {
  success: boolean;
  data: {
    metrics: StudentMetricsData;
    breakdown: {
      skillScore: { value: number; details: string };
      academicScore: { value: number; details: string };
      experienceScore: { value: number; details: string };
      preferenceScore: { value: number; details: string };
    };
  };
}

export interface SkillGapResponse {
  success: boolean;
  data: SkillGapAnalysis;
}

export interface RecommendationsResponse {
  success: boolean;
  data: HireabilityRecommendations;
}