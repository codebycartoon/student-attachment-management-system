import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { logger } from '../config/logger';

// ============================================================================
// CV PARSER UTILITY
// ============================================================================

interface CVData {
  text: string;
  extractedData?: {
    skills?: string[];
    experience?: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      year: string;
    }>;
    contact?: {
      email?: string;
      phone?: string;
      linkedin?: string;
      website?: string;
    };
  };
}

class CVParser {
  /**
   * Parse CV file and extract text and structured data
   */
  async parseCV(filePath: string): Promise<CVData> {
    try {
      logger.info('Starting CV parsing', { filePath });

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

      // Extract structured data from text
      const extractedData = this.extractStructuredData(text);

      logger.info('CV parsing completed', { 
        filePath, 
        textLength: text.length,
        hasExtractedData: !!extractedData,
      });

      return {
        text,
        extractedData,
      };
    } catch (error) {
      logger.error('Error parsing CV:', { filePath, error });
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
   * Note: This is a simplified implementation. In production, you'd use libraries like mammoth.js
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
   * Extract structured data from CV text using pattern matching
   */
  private extractStructuredData(text: string): CVData['extractedData'] {
    try {
      const extractedData: CVData['extractedData'] = {};

      // Extract contact information
      extractedData.contact = this.extractContactInfo(text);

      // Extract skills
      extractedData.skills = this.extractSkills(text);

      // Extract experience
      extractedData.experience = this.extractExperience(text);

      // Extract education
      extractedData.education = this.extractEducation(text);

      return extractedData;
    } catch (error) {
      logger.error('Error extracting structured data from CV:', error);
      return undefined;
    }
  }

  /**
   * Extract contact information
   */
  private extractContactInfo(text: string): CVData['extractedData']['contact'] {
    const contact: CVData['extractedData']['contact'] = {};

    // Email pattern
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }

    // Phone pattern (various formats)
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) {
      contact.phone = phoneMatch[0];
    }

    // LinkedIn pattern
    const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([A-Za-z0-9-]+)/i);
    if (linkedinMatch) {
      contact.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    }

    // Website/portfolio pattern
    const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9-]+\.(?:com|org|net|io|dev|me))/i);
    if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('email')) {
      contact.website = websiteMatch[0].startsWith('http') ? websiteMatch[0] : `https://${websiteMatch[0]}`;
    }

    return contact;
  }

  /**
   * Extract skills from CV text
   */
  private extractSkills(text: string): string[] {
    const skills: string[] = [];
    const skillsSection = this.extractSection(text, ['skills', 'technical skills', 'technologies', 'competencies']);

    if (skillsSection) {
      // Common technical skills to look for
      const commonSkills = [
        // Programming Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS',
        
        // Frameworks & Libraries
        'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
        'jQuery', 'Bootstrap', 'Tailwind', 'Next.js', 'Nuxt.js',
        
        // Databases
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
        
        // Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub',
        'GitLab', 'CI/CD', 'Terraform', 'Ansible',
        
        // Tools & Technologies
        'Linux', 'Windows', 'macOS', 'Figma', 'Adobe', 'Photoshop', 'Illustrator',
        'Jira', 'Confluence', 'Slack', 'Trello',
      ];

      // Look for skills in the text (case-insensitive)
      const textLower = skillsSection.toLowerCase();
      for (const skill of commonSkills) {
        if (textLower.includes(skill.toLowerCase())) {
          skills.push(skill);
        }
      }

      // Remove duplicates
      return [...new Set(skills)];
    }

    return skills;
  }

  /**
   * Extract work experience
   */
  private extractExperience(text: string): CVData['extractedData']['experience'] {
    const experience: CVData['extractedData']['experience'] = [];
    const experienceSection = this.extractSection(text, ['experience', 'work experience', 'employment', 'career']);

    if (experienceSection) {
      // This is a simplified extraction - in production, you'd use more sophisticated NLP
      const lines = experienceSection.split('\n').filter(line => line.trim());
      
      let currentExperience: any = null;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Look for job titles and companies (simplified pattern)
        if (this.looksLikeJobTitle(trimmedLine)) {
          if (currentExperience) {
            experience.push(currentExperience);
          }
          
          const parts = trimmedLine.split(/\s+at\s+|\s+@\s+|\s+-\s+/i);
          currentExperience = {
            position: parts[0]?.trim() || '',
            company: parts[1]?.trim() || '',
            duration: '',
            description: '',
          };
        } else if (currentExperience && this.looksLikeDuration(trimmedLine)) {
          currentExperience.duration = trimmedLine;
        } else if (currentExperience && trimmedLine.length > 20) {
          currentExperience.description += (currentExperience.description ? ' ' : '') + trimmedLine;
        }
      }
      
      if (currentExperience) {
        experience.push(currentExperience);
      }
    }

    return experience;
  }

  /**
   * Extract education information
   */
  private extractEducation(text: string): CVData['extractedData']['education'] {
    const education: CVData['extractedData']['education'] = [];
    const educationSection = this.extractSection(text, ['education', 'academic background', 'qualifications']);

    if (educationSection) {
      const lines = educationSection.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Look for degree patterns
        if (this.looksLikeDegree(trimmedLine)) {
          const yearMatch = trimmedLine.match(/\b(19|20)\d{2}\b/);
          const year = yearMatch ? yearMatch[0] : '';
          
          education.push({
            degree: trimmedLine,
            institution: '', // Would need more sophisticated parsing
            year,
          });
        }
      }
    }

    return education;
  }

  /**
   * Extract a specific section from CV text
   */
  private extractSection(text: string, sectionNames: string[]): string | null {
    const lines = text.split('\n');
    let sectionStart = -1;
    let sectionEnd = -1;

    // Find section start
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (sectionNames.some(name => line.includes(name))) {
        sectionStart = i + 1;
        break;
      }
    }

    if (sectionStart === -1) return null;

    // Find section end (next major section or end of document)
    const majorSections = ['experience', 'education', 'skills', 'projects', 'certifications', 'awards'];
    for (let i = sectionStart; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (majorSections.some(section => line.startsWith(section)) && i > sectionStart + 2) {
        sectionEnd = i;
        break;
      }
    }

    if (sectionEnd === -1) sectionEnd = lines.length;

    return lines.slice(sectionStart, sectionEnd).join('\n');
  }

  /**
   * Check if a line looks like a job title
   */
  private looksLikeJobTitle(line: string): boolean {
    const jobTitlePatterns = [
      /\b(developer|engineer|analyst|manager|director|coordinator|specialist|consultant|intern)\b/i,
      /\b(software|web|mobile|data|system|network|security|product|project)\b/i,
    ];

    return jobTitlePatterns.some(pattern => pattern.test(line)) && line.length < 100;
  }

  /**
   * Check if a line looks like a duration
   */
  private looksLikeDuration(line: string): boolean {
    const durationPatterns = [
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /\b(19|20)\d{2}\b/,
      /\b(present|current|now)\b/i,
    ];

    return durationPatterns.some(pattern => pattern.test(line)) && line.length < 50;
  }

  /**
   * Check if a line looks like a degree
   */
  private looksLikeDegree(line: string): boolean {
    const degreePatterns = [
      /\b(bachelor|master|phd|doctorate|diploma|certificate)\b/i,
      /\b(b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|ph\.?d\.?)\b/i,
      /\b(computer science|engineering|business|mathematics|physics|chemistry)\b/i,
    ];

    return degreePatterns.some(pattern => pattern.test(line));
  }
}

export const cvParser = new CVParser();