import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { logger } from '../config/logger';

// ============================================================================
// TRANSCRIPT PARSER UTILITY
// ============================================================================

interface TranscriptData {
  text: string;
  extractedData?: {
    gpa?: number;
    cumulativeGPA?: number;
    majorGPA?: number;
    courses?: Array<{
      courseCode: string;
      courseName: string;
      credits: number;
      grade: string;
      semester: string;
      year: number;
    }>;
    institution?: string;
    degree?: string;
    major?: string;
    graduationDate?: string;
    academicStanding?: string;
  };
}

class TranscriptParser {
  /**
   * Parse transcript file and extract academic data
   */
  async parseTranscript(filePath: string): Promise<TranscriptData> {
    try {
      logger.info('Starting transcript parsing', { filePath });

      const fileExtension = path.extname(filePath).toLowerCase();
      let text = '';

      switch (fileExtension) {
        case '.pdf':
          text = await this.parsePDF(filePath);
          break;
        case '.doc':
        case '.docx':
          text = await this.parseWord(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      // Extract structured academic data from text
      const extractedData = this.extractAcademicData(text);

      logger.info('Transcript parsing completed', { 
        filePath, 
        textLength: text.length,
        hasExtractedData: !!extractedData,
        gpa: extractedData?.gpa,
        courseCount: extractedData?.courses?.length || 0,
      });

      return {
        text,
        extractedData,
      };
    } catch (error) {
      logger.error('Error parsing transcript:', { filePath, error });
      throw error;
    }
  }

  /**
   * Parse PDF file
   */
  private async parsePDF(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch (error) {
      logger.error('Error parsing PDF:', { filePath, error });
      throw new Error('Failed to parse PDF file');
    }
  }

  /**
   * Parse Word document (DOC/DOCX)
   */
  private async parseWord(filePath: string): Promise<string> {
    try {
      // For now, we'll return a placeholder
      // In production, implement proper Word document parsing
      logger.warn('Word document parsing not fully implemented', { filePath });
      return 'Word document parsing not yet implemented. Please upload a PDF version.';
    } catch (error) {
      logger.error('Error parsing Word document:', { filePath, error });
      throw new Error('Failed to parse Word document');
    }
  }

  /**
   * Extract structured academic data from transcript text
   */
  private extractAcademicData(text: string): TranscriptData['extractedData'] {
    try {
      const extractedData: TranscriptData['extractedData'] = {};

      // Extract basic information
      extractedData.institution = this.extractInstitution(text);
      extractedData.degree = this.extractDegree(text);
      extractedData.major = this.extractMajor(text);
      extractedData.graduationDate = this.extractGraduationDate(text);
      extractedData.academicStanding = this.extractAcademicStanding(text);

      // Extract GPA information
      const gpaData = this.extractGPA(text);
      extractedData.gpa = gpaData.cumulative;
      extractedData.cumulativeGPA = gpaData.cumulative;
      extractedData.majorGPA = gpaData.major;

      // Extract course information
      extractedData.courses = this.extractCourses(text);

      return extractedData;
    } catch (error) {
      logger.error('Error extracting academic data from transcript:', error);
      return undefined;
    }
  }

  /**
   * Extract institution name
   */
  private extractInstitution(text: string): string | undefined {
    const lines = text.split('\n').slice(0, 10); // Check first 10 lines
    
    const universityPatterns = [
      /university of ([a-z\s]+)/i,
      /([a-z\s]+) university/i,
      /([a-z\s]+) college/i,
      /([a-z\s]+) institute/i,
    ];

    for (const line of lines) {
      for (const pattern of universityPatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[0].trim();
        }
      }
    }

    return undefined;
  }

  /**
   * Extract degree information
   */
  private extractDegree(text: string): string | undefined {
    const degreePatterns = [
      /bachelor of ([a-z\s]+)/i,
      /master of ([a-z\s]+)/i,
      /doctor of ([a-z\s]+)/i,
      /b\.?s\.?\s+in\s+([a-z\s]+)/i,
      /m\.?s\.?\s+in\s+([a-z\s]+)/i,
      /b\.?a\.?\s+in\s+([a-z\s]+)/i,
      /m\.?a\.?\s+in\s+([a-z\s]+)/i,
      /ph\.?d\.?\s+in\s+([a-z\s]+)/i,
    ];

    for (const pattern of degreePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract major/field of study
   */
  private extractMajor(text: string): string | undefined {
    const majorPatterns = [
      /major:\s*([a-z\s]+)/i,
      /field of study:\s*([a-z\s]+)/i,
      /program:\s*([a-z\s]+)/i,
      /concentration:\s*([a-z\s]+)/i,
    ];

    for (const pattern of majorPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Try to extract from degree string
    const degree = this.extractDegree(text);
    if (degree) {
      const degreeMatch = degree.match(/in\s+([a-z\s]+)/i);
      if (degreeMatch) {
        return degreeMatch[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract graduation date
   */
  private extractGraduationDate(text: string): string | undefined {
    const datePatterns = [
      /graduation date:\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
      /graduated:\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
      /degree conferred:\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
      /completion date:\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract academic standing
   */
  private extractAcademicStanding(text: string): string | undefined {
    const standingPatterns = [
      /academic standing:\s*([a-z\s]+)/i,
      /standing:\s*([a-z\s]+)/i,
      /honors:\s*([a-z\s]+)/i,
      /(magna cum laude|summa cum laude|cum laude)/i,
      /(dean's list|honor roll|academic probation|good standing)/i,
    ];

    for (const pattern of standingPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] ? match[1].trim() : match[0].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract GPA information
   */
  private extractGPA(text: string): { cumulative?: number; major?: number } {
    const gpaData: { cumulative?: number; major?: number } = {};

    // Cumulative GPA patterns
    const cumulativePatterns = [
      /cumulative gpa:\s*(\d+\.?\d*)/i,
      /overall gpa:\s*(\d+\.?\d*)/i,
      /gpa:\s*(\d+\.?\d*)/i,
      /grade point average:\s*(\d+\.?\d*)/i,
    ];

    for (const pattern of cumulativePatterns) {
      const match = text.match(pattern);
      if (match) {
        const gpa = parseFloat(match[1]);
        if (gpa >= 0 && gpa <= 4.0) {
          gpaData.cumulative = gpa;
          break;
        }
      }
    }

    // Major GPA patterns
    const majorPatterns = [
      /major gpa:\s*(\d+\.?\d*)/i,
      /program gpa:\s*(\d+\.?\d*)/i,
      /concentration gpa:\s*(\d+\.?\d*)/i,
    ];

    for (const pattern of majorPatterns) {
      const match = text.match(pattern);
      if (match) {
        const gpa = parseFloat(match[1]);
        if (gpa >= 0 && gpa <= 4.0) {
          gpaData.major = gpa;
          break;
        }
      }
    }

    return gpaData;
  }

  /**
   * Extract course information
   */
  private extractCourses(text: string): TranscriptData['extractedData']['courses'] {
    const courses: TranscriptData['extractedData']['courses'] = [];
    const lines = text.split('\n');

    // Look for course patterns
    for (const line of lines) {
      const course = this.parseCourseFromLine(line);
      if (course) {
        courses.push(course);
      }
    }

    return courses;
  }

  /**
   * Parse course information from a single line
   */
  private parseCourseFromLine(line: string): TranscriptData['extractedData']['courses'][0] | null {
    // Common transcript course line patterns:
    // "CS101 Introduction to Computer Science 3.0 A Fall 2023"
    // "MATH201 Calculus I 4 B+ Spring 2024"
    // "ENG100 English Composition 3 A- 2023 Fall"

    const coursePatterns = [
      // Pattern: COURSE_CODE COURSE_NAME CREDITS GRADE SEMESTER YEAR
      /^([A-Z]{2,4}\d{3,4})\s+(.+?)\s+(\d+\.?\d*)\s+([A-F][+-]?|[A-F])\s+(fall|spring|summer|winter)\s+(\d{4})/i,
      // Pattern: COURSE_CODE COURSE_NAME CREDITS GRADE YEAR SEMESTER
      /^([A-Z]{2,4}\d{3,4})\s+(.+?)\s+(\d+\.?\d*)\s+([A-F][+-]?|[A-F])\s+(\d{4})\s+(fall|spring|summer|winter)/i,
      // Pattern: COURSE_CODE COURSE_NAME GRADE CREDITS SEMESTER YEAR
      /^([A-Z]{2,4}\d{3,4})\s+(.+?)\s+([A-F][+-]?|[A-F])\s+(\d+\.?\d*)\s+(fall|spring|summer|winter)\s+(\d{4})/i,
    ];

    for (const pattern of coursePatterns) {
      const match = line.trim().match(pattern);
      if (match) {
        const [, courseCode, courseName, credits, grade, semester, year] = match;
        
        return {
          courseCode: courseCode.trim(),
          courseName: courseName.trim(),
          credits: parseFloat(credits),
          grade: grade.trim(),
          semester: semester.trim(),
          year: parseInt(year),
        };
      }
    }

    // Try simpler pattern for courses without all information
    const simplePattern = /^([A-Z]{2,4}\d{3,4})\s+(.+?)\s+([A-F][+-]?|[A-F])/i;
    const simpleMatch = line.trim().match(simplePattern);
    
    if (simpleMatch) {
      const [, courseCode, courseName, grade] = simpleMatch;
      
      return {
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        credits: 3, // Default credits
        grade: grade.trim(),
        semester: 'Unknown',
        year: new Date().getFullYear(), // Default to current year
      };
    }

    return null;
  }

  /**
   * Calculate GPA from courses if not explicitly provided
   */
  private calculateGPAFromCourses(courses: TranscriptData['extractedData']['courses']): number | undefined {
    if (!courses || courses.length === 0) return undefined;

    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
      const points = gradePoints[course.grade];
      if (points !== undefined) {
        totalPoints += points * course.credits;
        totalCredits += course.credits;
      }
    }

    return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : undefined;
  }
}

export const transcriptParser = new TranscriptParser();