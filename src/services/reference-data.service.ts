/**
 * Reference Data Service
 * Manages skills, universities, degrees, majors, and preferences
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReferenceDataService {
  /**
   * Get all skills with categories
   */
  async getAllSkills() {
    return await prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Get skills by category
   */
  async getSkillsByCategory(category: string) {
    return await prisma.skill.findMany({
      where: { category },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Search skills by name
   */
  async searchSkills(query: string) {
    return await prisma.skill.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { name: 'asc' },
      take: 20
    });
  }

  /**
   * Get all universities
   */
  async getAllUniversities() {
    return await prisma.university.findMany({
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Search universities by name
   */
  async searchUniversities(query: string) {
    return await prisma.university.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { name: 'asc' },
      take: 20
    });
  }

  /**
   * Get all degrees
   */
  async getAllDegrees() {
    return await prisma.degree.findMany({
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Get all majors
   */
  async getAllMajors() {
    return await prisma.major.findMany({
      orderBy: [
        { field: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Get majors by field
   */
  async getMajorsByField(field: string) {
    return await prisma.major.findMany({
      where: { field },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get all preferences
   */
  async getAllPreferences() {
    return await prisma.preference.findMany({
      orderBy: [
        { type: 'asc' },
        { value: 'asc' }
      ]
    });
  }

  /**
   * Get preferences by type
   */
  async getPreferencesByType(type: string) {
    return await prisma.preference.findMany({
      where: { type: type as any },
      orderBy: { value: 'asc' }
    });
  }

  /**
   * Get all courses
   */
  async getAllCourses() {
    return await prisma.course.findMany({
      orderBy: { courseName: 'asc' }
    });
  }

  /**
   * Search courses by name or code
   */
  async searchCourses(query: string) {
    return await prisma.course.findMany({
      where: {
        OR: [
          {
            courseName: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            courseCode: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: { courseName: 'asc' },
      take: 20
    });
  }

  /**
   * Create new skill (admin only)
   */
  async createSkill(data: {
    name: string;
    category: string;
    description?: string;
  }) {
    return await prisma.skill.create({
      data
    });
  }

  /**
   * Create new university (admin only)
   */
  async createUniversity(data: {
    name: string;
    location?: string;
    website?: string;
  }) {
    return await prisma.university.create({
      data
    });
  }

  /**
   * Create new degree (admin only)
   */
  async createDegree(data: {
    name: string;
    level: string;
  }) {
    return await prisma.degree.create({
      data
    });
  }

  /**
   * Create new major (admin only)
   */
  async createMajor(data: {
    name: string;
    field: string;
  }) {
    return await prisma.major.create({
      data
    });
  }

  /**
   * Create new preference (admin only)
   */
  async createPreference(data: {
    type: string;
    value: string;
    description?: string;
  }) {
    return await prisma.preference.create({
      data: {
        type: data.type as any,
        value: data.value,
        description: data.description || null
      }
    });
  }

  /**
   * Create new course (admin only)
   */
  async createCourse(data: {
    courseCode: string;
    courseName: string;
    credits?: number;
    description?: string;
  }) {
    return await prisma.course.create({
      data
    });
  }

  /**
   * Get skill categories
   */
  async getSkillCategories() {
    const categories = await prisma.skill.findMany({
      select: {
        category: true
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc'
      }
    });

    return categories.map(c => c.category);
  }

  /**
   * Get degree levels
   */
  async getDegreeLevels() {
    const levels = await prisma.degree.findMany({
      select: {
        level: true
      },
      distinct: ['level'],
      orderBy: {
        level: 'asc'
      }
    });

    return levels.map(l => l.level);
  }

  /**
   * Get major fields
   */
  async getMajorFields() {
    const fields = await prisma.major.findMany({
      select: {
        field: true
      },
      distinct: ['field'],
      orderBy: {
        field: 'asc'
      }
    });

    return fields.map(f => f.field);
  }

  /**
   * Get preference types
   */
  async getPreferenceTypes() {
    return [
      'INDUSTRY',
      'LOCATION',
      'JOB_TYPE',
      'COMPANY_SIZE',
      'WORK_ENVIRONMENT'
    ];
  }

  /**
   * Seed initial reference data
   */
  async seedReferenceData() {
    // Seed skills
    const skillsData = [
      // Programming Languages
      { name: 'JavaScript', category: 'Programming Languages' },
      { name: 'TypeScript', category: 'Programming Languages' },
      { name: 'Python', category: 'Programming Languages' },
      { name: 'Java', category: 'Programming Languages' },
      { name: 'C++', category: 'Programming Languages' },
      { name: 'C#', category: 'Programming Languages' },
      { name: 'PHP', category: 'Programming Languages' },
      { name: 'Ruby', category: 'Programming Languages' },
      { name: 'Go', category: 'Programming Languages' },
      { name: 'Rust', category: 'Programming Languages' },

      // Web Technologies
      { name: 'React', category: 'Web Technologies' },
      { name: 'Vue.js', category: 'Web Technologies' },
      { name: 'Angular', category: 'Web Technologies' },
      { name: 'Node.js', category: 'Web Technologies' },
      { name: 'Express.js', category: 'Web Technologies' },
      { name: 'HTML5', category: 'Web Technologies' },
      { name: 'CSS3', category: 'Web Technologies' },
      { name: 'Sass/SCSS', category: 'Web Technologies' },
      { name: 'Tailwind CSS', category: 'Web Technologies' },
      { name: 'Bootstrap', category: 'Web Technologies' },

      // Databases
      { name: 'PostgreSQL', category: 'Databases' },
      { name: 'MySQL', category: 'Databases' },
      { name: 'MongoDB', category: 'Databases' },
      { name: 'Redis', category: 'Databases' },
      { name: 'SQLite', category: 'Databases' },
      { name: 'Oracle', category: 'Databases' },

      // Cloud & DevOps
      { name: 'AWS', category: 'Cloud & DevOps' },
      { name: 'Azure', category: 'Cloud & DevOps' },
      { name: 'Google Cloud', category: 'Cloud & DevOps' },
      { name: 'Docker', category: 'Cloud & DevOps' },
      { name: 'Kubernetes', category: 'Cloud & DevOps' },
      { name: 'Jenkins', category: 'Cloud & DevOps' },
      { name: 'GitHub Actions', category: 'Cloud & DevOps' },

      // Soft Skills
      { name: 'Communication', category: 'Soft Skills' },
      { name: 'Leadership', category: 'Soft Skills' },
      { name: 'Problem Solving', category: 'Soft Skills' },
      { name: 'Teamwork', category: 'Soft Skills' },
      { name: 'Time Management', category: 'Soft Skills' },
      { name: 'Critical Thinking', category: 'Soft Skills' }
    ];

    // Seed preferences
    const preferencesData = [
      // Industries
      { type: 'INDUSTRY', value: 'Technology' },
      { type: 'INDUSTRY', value: 'Finance' },
      { type: 'INDUSTRY', value: 'Healthcare' },
      { type: 'INDUSTRY', value: 'Education' },
      { type: 'INDUSTRY', value: 'E-commerce' },
      { type: 'INDUSTRY', value: 'Gaming' },
      { type: 'INDUSTRY', value: 'Media & Entertainment' },

      // Locations
      { type: 'LOCATION', value: 'Remote' },
      { type: 'LOCATION', value: 'Nairobi, Kenya' },
      { type: 'LOCATION', value: 'Mombasa, Kenya' },
      { type: 'LOCATION', value: 'Kisumu, Kenya' },
      { type: 'LOCATION', value: 'International' },

      // Job Types
      { type: 'JOB_TYPE', value: 'Full-time' },
      { type: 'JOB_TYPE', value: 'Part-time' },
      { type: 'JOB_TYPE', value: 'Internship' },
      { type: 'JOB_TYPE', value: 'Contract' },
      { type: 'JOB_TYPE', value: 'Freelance' },

      // Company Size
      { type: 'COMPANY_SIZE', value: 'Startup (1-50)' },
      { type: 'COMPANY_SIZE', value: 'Medium (51-500)' },
      { type: 'COMPANY_SIZE', value: 'Large (500+)' },

      // Work Environment
      { type: 'WORK_ENVIRONMENT', value: 'Remote' },
      { type: 'WORK_ENVIRONMENT', value: 'Hybrid' },
      { type: 'WORK_ENVIRONMENT', value: 'On-site' }
    ];

    try {
      // Create skills
      for (const skill of skillsData) {
        await prisma.skill.upsert({
          where: { name: skill.name },
          update: {},
          create: skill
        });
      }

      // Create preferences
      for (const preference of preferencesData) {
        // Check if preference already exists
        const existing = await prisma.preference.findFirst({
          where: {
            type: preference.type as any,
            value: preference.value
          }
        });

        if (!existing) {
          await prisma.preference.create({
            data: {
              type: preference.type as any,
              value: preference.value
            }
          });
        }
      }

      console.log('✅ Reference data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding reference data:', error);
      throw error;
    }
  }
}

export const referenceDataService = new ReferenceDataService();