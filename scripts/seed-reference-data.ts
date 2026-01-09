/**
 * Seed Reference Data Script
 * Populates the database with initial skills, preferences, and other reference data
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { referenceDataService } from '../src/services/reference-data.service';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function seedReferenceData() {
  try {
    console.log('🌱 Starting reference data seeding...');

    // Seed basic reference data
    await referenceDataService.seedReferenceData();

    // Seed some sample universities
    const universities = [
      { name: 'University of Nairobi', location: 'Nairobi, Kenya', website: 'https://www.uonbi.ac.ke' },
      { name: 'Kenyatta University', location: 'Nairobi, Kenya', website: 'https://www.ku.ac.ke' },
      { name: 'Strathmore University', location: 'Nairobi, Kenya', website: 'https://www.strathmore.edu' },
      { name: 'Jomo Kenyatta University of Agriculture and Technology', location: 'Juja, Kenya', website: 'https://www.jkuat.ac.ke' },
      { name: 'Moi University', location: 'Eldoret, Kenya', website: 'https://www.mu.ac.ke' },
      { name: 'Technical University of Kenya', location: 'Nairobi, Kenya', website: 'https://www.tukenya.ac.ke' },
      { name: 'Maseno University', location: 'Maseno, Kenya', website: 'https://www.maseno.ac.ke' },
      { name: 'Egerton University', location: 'Njoro, Kenya', website: 'https://www.egerton.ac.ke' }
    ];

    for (const university of universities) {
      await prisma.university.upsert({
        where: { name: university.name },
        update: {},
        create: university
      });
    }

    // Seed degrees
    const degrees = [
      { name: 'Bachelor of Science in Computer Science', level: 'Bachelor' },
      { name: 'Bachelor of Science in Information Technology', level: 'Bachelor' },
      { name: 'Bachelor of Science in Software Engineering', level: 'Bachelor' },
      { name: 'Bachelor of Science in Computer Engineering', level: 'Bachelor' },
      { name: 'Bachelor of Science in Data Science', level: 'Bachelor' },
      { name: 'Bachelor of Business Administration', level: 'Bachelor' },
      { name: 'Bachelor of Commerce', level: 'Bachelor' },
      { name: 'Bachelor of Arts', level: 'Bachelor' },
      { name: 'Master of Science in Computer Science', level: 'Master' },
      { name: 'Master of Business Administration', level: 'Master' },
      { name: 'Master of Science in Data Science', level: 'Master' },
      { name: 'Doctor of Philosophy', level: 'PhD' }
    ];

    for (const degree of degrees) {
      await prisma.degree.upsert({
        where: { name: degree.name },
        update: {},
        create: degree
      });
    }

    // Seed majors
    const majors = [
      { name: 'Computer Science', field: 'Engineering' },
      { name: 'Information Technology', field: 'Engineering' },
      { name: 'Software Engineering', field: 'Engineering' },
      { name: 'Computer Engineering', field: 'Engineering' },
      { name: 'Data Science', field: 'Engineering' },
      { name: 'Electrical Engineering', field: 'Engineering' },
      { name: 'Mechanical Engineering', field: 'Engineering' },
      { name: 'Civil Engineering', field: 'Engineering' },
      { name: 'Business Administration', field: 'Business' },
      { name: 'Finance', field: 'Business' },
      { name: 'Marketing', field: 'Business' },
      { name: 'Accounting', field: 'Business' },
      { name: 'Economics', field: 'Business' },
      { name: 'Mathematics', field: 'Science' },
      { name: 'Physics', field: 'Science' },
      { name: 'Chemistry', field: 'Science' },
      { name: 'Biology', field: 'Science' },
      { name: 'Psychology', field: 'Social Sciences' },
      { name: 'Sociology', field: 'Social Sciences' },
      { name: 'Political Science', field: 'Social Sciences' }
    ];

    for (const major of majors) {
      await prisma.major.upsert({
        where: { name: major.name },
        update: {},
        create: major
      });
    }

    // Seed some sample courses
    const courses = [
      { courseCode: 'CS101', courseName: 'Introduction to Computer Science', credits: 3 },
      { courseCode: 'CS201', courseName: 'Data Structures and Algorithms', credits: 4 },
      { courseCode: 'CS301', courseName: 'Database Systems', credits: 3 },
      { courseCode: 'CS401', courseName: 'Software Engineering', credits: 4 },
      { courseCode: 'CS501', courseName: 'Machine Learning', credits: 3 },
      { courseCode: 'MATH101', courseName: 'Calculus I', credits: 4 },
      { courseCode: 'MATH201', courseName: 'Linear Algebra', credits: 3 },
      { courseCode: 'STAT101', courseName: 'Statistics', credits: 3 },
      { courseCode: 'BUS101', courseName: 'Introduction to Business', credits: 3 },
      { courseCode: 'ENG101', courseName: 'Technical Writing', credits: 2 }
    ];

    for (const course of courses) {
      await prisma.course.upsert({
        where: { courseCode: course.courseCode },
        update: {},
        create: course
      });
    }

    console.log('✅ Reference data seeded successfully!');
    console.log(`📊 Seeded:`);
    console.log(`   - ${universities.length} universities`);
    console.log(`   - ${degrees.length} degrees`);
    console.log(`   - ${majors.length} majors`);
    console.log(`   - ${courses.length} courses`);
    console.log(`   - Skills and preferences (see service for details)`);

  } catch (error) {
    console.error('❌ Error seeding reference data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedReferenceData()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedReferenceData };