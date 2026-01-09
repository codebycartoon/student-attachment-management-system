import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPhase3Data() {
  console.log('🌱 Starting Phase 3 seed data...');

  try {
    // Seed Skills
    console.log('📚 Seeding skills...');
    const skills = [
      // Programming Languages
      { name: 'JavaScript', category: 'Programming', description: 'Popular web programming language' },
      { name: 'TypeScript', category: 'Programming', description: 'Typed superset of JavaScript' },
      { name: 'Python', category: 'Programming', description: 'Versatile programming language' },
      { name: 'Java', category: 'Programming', description: 'Enterprise programming language' },
      { name: 'C++', category: 'Programming', description: 'System programming language' },
      { name: 'C#', category: 'Programming', description: 'Microsoft .NET language' },
      { name: 'Go', category: 'Programming', description: 'Google systems language' },
      { name: 'Rust', category: 'Programming', description: 'Memory-safe systems language' },
      { name: 'PHP', category: 'Programming', description: 'Web development language' },
      { name: 'Ruby', category: 'Programming', description: 'Dynamic programming language' },

      // Frameworks & Libraries
      { name: 'React', category: 'Framework', description: 'JavaScript UI library' },
      { name: 'Angular', category: 'Framework', description: 'TypeScript web framework' },
      { name: 'Vue.js', category: 'Framework', description: 'Progressive JavaScript framework' },
      { name: 'Node.js', category: 'Framework', description: 'JavaScript runtime environment' },
      { name: 'Express.js', category: 'Framework', description: 'Node.js web framework' },
      { name: 'Django', category: 'Framework', description: 'Python web framework' },
      { name: 'Flask', category: 'Framework', description: 'Lightweight Python framework' },
      { name: 'Spring Boot', category: 'Framework', description: 'Java application framework' },
      { name: 'Laravel', category: 'Framework', description: 'PHP web framework' },
      { name: 'Next.js', category: 'Framework', description: 'React production framework' },

      // Databases
      { name: 'MySQL', category: 'Database', description: 'Popular relational database' },
      { name: 'PostgreSQL', category: 'Database', description: 'Advanced relational database' },
      { name: 'MongoDB', category: 'Database', description: 'NoSQL document database' },
      { name: 'Redis', category: 'Database', description: 'In-memory data store' },
      { name: 'SQLite', category: 'Database', description: 'Lightweight SQL database' },
      { name: 'Oracle', category: 'Database', description: 'Enterprise database system' },

      // Cloud & DevOps
      { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services' },
      { name: 'Azure', category: 'Cloud', description: 'Microsoft cloud platform' },
      { name: 'Google Cloud', category: 'Cloud', description: 'Google cloud platform' },
      { name: 'Docker', category: 'DevOps', description: 'Containerization platform' },
      { name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration' },
      { name: 'Jenkins', category: 'DevOps', description: 'CI/CD automation server' },
      { name: 'Git', category: 'DevOps', description: 'Version control system' },
      { name: 'GitHub', category: 'DevOps', description: 'Git hosting platform' },
      { name: 'GitLab', category: 'DevOps', description: 'DevOps platform' },

      // Design & Tools
      { name: 'Figma', category: 'Design', description: 'UI/UX design tool' },
      { name: 'Adobe Photoshop', category: 'Design', description: 'Image editing software' },
      { name: 'Adobe Illustrator', category: 'Design', description: 'Vector graphics editor' },
      { name: 'Sketch', category: 'Design', description: 'Digital design toolkit' },

      // Business & Soft Skills
      { name: 'Project Management', category: 'Business', description: 'Managing projects and teams' },
      { name: 'Agile', category: 'Business', description: 'Agile development methodology' },
      { name: 'Scrum', category: 'Business', description: 'Scrum framework' },
      { name: 'Communication', category: 'Communication', description: 'Effective communication skills' },
      { name: 'Leadership', category: 'Communication', description: 'Team leadership abilities' },
      { name: 'Problem Solving', category: 'Communication', description: 'Analytical problem solving' },
    ];

    for (const skill of skills) {
      await prisma.skill.upsert({
        where: { name: skill.name },
        update: {},
        create: skill,
      });
    }

    // Seed Universities
    console.log('🏫 Seeding universities...');
    const universities = [
      { name: 'University of Toronto', location: 'Toronto, ON', website: 'https://www.utoronto.ca' },
      { name: 'University of Waterloo', location: 'Waterloo, ON', website: 'https://uwaterloo.ca' },
      { name: 'McGill University', location: 'Montreal, QC', website: 'https://www.mcgill.ca' },
      { name: 'University of British Columbia', location: 'Vancouver, BC', website: 'https://www.ubc.ca' },
      { name: 'McMaster University', location: 'Hamilton, ON', website: 'https://www.mcmaster.ca' },
      { name: 'Queen\'s University', location: 'Kingston, ON', website: 'https://www.queensu.ca' },
      { name: 'University of Alberta', location: 'Edmonton, AB', website: 'https://www.ualberta.ca' },
      { name: 'Simon Fraser University', location: 'Burnaby, BC', website: 'https://www.sfu.ca' },
      { name: 'York University', location: 'Toronto, ON', website: 'https://www.yorku.ca' },
      { name: 'Carleton University', location: 'Ottawa, ON', website: 'https://carleton.ca' },
    ];

    for (const university of universities) {
      await prisma.university.upsert({
        where: { name: university.name },
        update: {},
        create: university,
      });
    }

    // Seed Degrees
    console.log('🎓 Seeding degrees...');
    const degrees = [
      { name: 'Bachelor of Science', level: 'Bachelor' },
      { name: 'Bachelor of Arts', level: 'Bachelor' },
      { name: 'Bachelor of Engineering', level: 'Bachelor' },
      { name: 'Bachelor of Computer Science', level: 'Bachelor' },
      { name: 'Bachelor of Business Administration', level: 'Bachelor' },
      { name: 'Master of Science', level: 'Master' },
      { name: 'Master of Arts', level: 'Master' },
      { name: 'Master of Engineering', level: 'Master' },
      { name: 'Master of Computer Science', level: 'Master' },
      { name: 'Master of Business Administration', level: 'Master' },
      { name: 'Doctor of Philosophy', level: 'PhD' },
      { name: 'Associate Degree', level: 'Associate' },
    ];

    for (const degree of degrees) {
      await prisma.degree.upsert({
        where: { name: degree.name },
        update: {},
        create: degree,
      });
    }

    // Seed Majors
    console.log('📖 Seeding majors...');
    const majors = [
      { name: 'Computer Science', field: 'Engineering' },
      { name: 'Software Engineering', field: 'Engineering' },
      { name: 'Computer Engineering', field: 'Engineering' },
      { name: 'Electrical Engineering', field: 'Engineering' },
      { name: 'Mechanical Engineering', field: 'Engineering' },
      { name: 'Civil Engineering', field: 'Engineering' },
      { name: 'Information Technology', field: 'Engineering' },
      { name: 'Data Science', field: 'Engineering' },
      { name: 'Mathematics', field: 'Science' },
      { name: 'Statistics', field: 'Science' },
      { name: 'Physics', field: 'Science' },
      { name: 'Chemistry', field: 'Science' },
      { name: 'Biology', field: 'Science' },
      { name: 'Business Administration', field: 'Business' },
      { name: 'Marketing', field: 'Business' },
      { name: 'Finance', field: 'Business' },
      { name: 'Accounting', field: 'Business' },
      { name: 'Economics', field: 'Business' },
      { name: 'Psychology', field: 'Arts' },
      { name: 'English', field: 'Arts' },
      { name: 'History', field: 'Arts' },
      { name: 'Philosophy', field: 'Arts' },
    ];

    for (const major of majors) {
      await prisma.major.upsert({
        where: { name: major.name },
        update: {},
        create: major,
      });
    }

    // Seed Courses
    console.log('📚 Seeding courses...');
    const courses = [
      { courseCode: 'CS101', courseName: 'Introduction to Computer Science', credits: 3, description: 'Basic programming concepts' },
      { courseCode: 'CS201', courseName: 'Data Structures and Algorithms', credits: 3, description: 'Fundamental data structures' },
      { courseCode: 'CS301', courseName: 'Database Systems', credits: 3, description: 'Database design and management' },
      { courseCode: 'CS401', courseName: 'Software Engineering', credits: 3, description: 'Software development lifecycle' },
      { courseCode: 'MATH101', courseName: 'Calculus I', credits: 4, description: 'Differential calculus' },
      { courseCode: 'MATH201', courseName: 'Calculus II', credits: 4, description: 'Integral calculus' },
      { courseCode: 'MATH301', courseName: 'Linear Algebra', credits: 3, description: 'Vectors and matrices' },
      { courseCode: 'STAT101', courseName: 'Introduction to Statistics', credits: 3, description: 'Basic statistical concepts' },
      { courseCode: 'PHYS101', courseName: 'Physics I', credits: 4, description: 'Mechanics and thermodynamics' },
      { courseCode: 'ENG101', courseName: 'English Composition', credits: 3, description: 'Academic writing skills' },
      { courseCode: 'BUS101', courseName: 'Introduction to Business', credits: 3, description: 'Business fundamentals' },
      { courseCode: 'ECON101', courseName: 'Microeconomics', credits: 3, description: 'Individual economic behavior' },
    ];

    for (const course of courses) {
      await prisma.course.upsert({
        where: { courseCode: course.courseCode },
        update: {},
        create: course,
      });
    }

    // Seed Preferences
    console.log('⚙️ Seeding preferences...');
    const preferences = [
      // Industries
      { type: 'INDUSTRY', value: 'Technology', description: 'Software and technology companies' },
      { type: 'INDUSTRY', value: 'Finance', description: 'Banking and financial services' },
      { type: 'INDUSTRY', value: 'Healthcare', description: 'Medical and healthcare organizations' },
      { type: 'INDUSTRY', value: 'Education', description: 'Educational institutions' },
      { type: 'INDUSTRY', value: 'Consulting', description: 'Management and technical consulting' },
      { type: 'INDUSTRY', value: 'Government', description: 'Public sector organizations' },
      { type: 'INDUSTRY', value: 'Non-Profit', description: 'Non-profit organizations' },
      { type: 'INDUSTRY', value: 'Retail', description: 'Retail and e-commerce' },
      { type: 'INDUSTRY', value: 'Manufacturing', description: 'Manufacturing and industrial' },

      // Locations
      { type: 'LOCATION', value: 'Toronto', description: 'Toronto, Ontario' },
      { type: 'LOCATION', value: 'Vancouver', description: 'Vancouver, British Columbia' },
      { type: 'LOCATION', value: 'Montreal', description: 'Montreal, Quebec' },
      { type: 'LOCATION', value: 'Calgary', description: 'Calgary, Alberta' },
      { type: 'LOCATION', value: 'Ottawa', description: 'Ottawa, Ontario' },
      { type: 'LOCATION', value: 'Waterloo', description: 'Waterloo, Ontario' },
      { type: 'LOCATION', value: 'Remote', description: 'Remote work anywhere' },
      { type: 'LOCATION', value: 'Hybrid', description: 'Hybrid work arrangement' },

      // Job Types
      { type: 'JOB_TYPE', value: 'Full-time', description: 'Full-time employment' },
      { type: 'JOB_TYPE', value: 'Part-time', description: 'Part-time employment' },
      { type: 'JOB_TYPE', value: 'Internship', description: 'Internship opportunities' },
      { type: 'JOB_TYPE', value: 'Co-op', description: 'Co-operative education' },
      { type: 'JOB_TYPE', value: 'Contract', description: 'Contract work' },
      { type: 'JOB_TYPE', value: 'Freelance', description: 'Freelance projects' },

      // Company Size
      { type: 'COMPANY_SIZE', value: 'Startup', description: '1-50 employees' },
      { type: 'COMPANY_SIZE', value: 'Small', description: '51-200 employees' },
      { type: 'COMPANY_SIZE', value: 'Medium', description: '201-1000 employees' },
      { type: 'COMPANY_SIZE', value: 'Large', description: '1000+ employees' },
      { type: 'COMPANY_SIZE', value: 'Enterprise', description: '10000+ employees' },

      // Work Environment
      { type: 'WORK_ENVIRONMENT', value: 'Office', description: 'Traditional office environment' },
      { type: 'WORK_ENVIRONMENT', value: 'Remote', description: 'Fully remote work' },
      { type: 'WORK_ENVIRONMENT', value: 'Hybrid', description: 'Mix of office and remote' },
      { type: 'WORK_ENVIRONMENT', value: 'Flexible', description: 'Flexible work arrangements' },
    ];

    for (const preference of preferences) {
      await prisma.preference.upsert({
        where: { 
          type_value: {
            type: preference.type,
            value: preference.value,
          }
        },
        update: {},
        create: preference,
      });
    }

    console.log('✅ Phase 3 seed data completed successfully!');
    console.log(`
📊 Seeded:
- ${skills.length} skills
- ${universities.length} universities  
- ${degrees.length} degrees
- ${majors.length} majors
- ${courses.length} courses
- ${preferences.length} preferences
    `);

  } catch (error) {
    console.error('❌ Error seeding Phase 3 data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedPhase3Data()
    .then(() => {
      console.log('🎉 Phase 3 seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Phase 3 seeding failed:', error);
      process.exit(1);
    });
}

export default seedPhase3Data;