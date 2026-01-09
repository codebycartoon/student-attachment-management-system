/**
 * Phase 2 Database Seeding Script
 * Seeds the database with sample data for testing Phase 2 functionality
 */

import { PrismaClient, UserRole, UserStatus, OpportunityStatus, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedPhase2Data() {
  console.log('🌱 Starting Phase 2 database seeding...');

  try {
    // ============================================================================
    // SEED REFERENCE DATA
    // ============================================================================

    console.log('📚 Seeding reference data...');

    // Universities
    const universities = await Promise.all([
      prisma.university.upsert({
        where: { name: 'University of Toronto' },
        update: {},
        create: {
          name: 'University of Toronto',
          location: 'Toronto, ON',
          website: 'https://www.utoronto.ca',
        },
      }),
      prisma.university.upsert({
        where: { name: 'University of Waterloo' },
        update: {},
        create: {
          name: 'University of Waterloo',
          location: 'Waterloo, ON',
          website: 'https://uwaterloo.ca',
        },
      }),
      prisma.university.upsert({
        where: { name: 'McGill University' },
        update: {},
        create: {
          name: 'McGill University',
          location: 'Montreal, QC',
          website: 'https://www.mcgill.ca',
        },
      }),
    ]);

    // Degrees
    const degrees = await Promise.all([
      prisma.degree.upsert({
        where: { name: 'Bachelor of Computer Science' },
        update: {},
        create: {
          name: 'Bachelor of Computer Science',
          level: 'Bachelor',
        },
      }),
      prisma.degree.upsert({
        where: { name: 'Bachelor of Engineering' },
        update: {},
        create: {
          name: 'Bachelor of Engineering',
          level: 'Bachelor',
        },
      }),
      prisma.degree.upsert({
        where: { name: 'Master of Business Administration' },
        update: {},
        create: {
          name: 'Master of Business Administration',
          level: 'Master',
        },
      }),
    ]);

    // Majors
    const majors = await Promise.all([
      prisma.major.upsert({
        where: { name: 'Computer Science' },
        update: {},
        create: {
          name: 'Computer Science',
          field: 'Engineering',
        },
      }),
      prisma.major.upsert({
        where: { name: 'Software Engineering' },
        update: {},
        create: {
          name: 'Software Engineering',
          field: 'Engineering',
        },
      }),
      prisma.major.upsert({
        where: { name: 'Business Administration' },
        update: {},
        create: {
          name: 'Business Administration',
          field: 'Business',
        },
      }),
      prisma.major.upsert({
        where: { name: 'Data Science' },
        update: {},
        create: {
          name: 'Data Science',
          field: 'Engineering',
        },
      }),
    ]);

    // Skills
    const skills = await Promise.all([
      prisma.skill.upsert({
        where: { name: 'JavaScript' },
        update: {},
        create: {
          name: 'JavaScript',
          category: 'Programming',
          description: 'JavaScript programming language',
        },
      }),
      prisma.skill.upsert({
        where: { name: 'Python' },
        update: {},
        create: {
          name: 'Python',
          category: 'Programming',
          description: 'Python programming language',
        },
      }),
      prisma.skill.upsert({
        where: { name: 'React' },
        update: {},
        create: {
          name: 'React',
          category: 'Framework',
          description: 'React JavaScript library',
        },
      }),
      prisma.skill.upsert({
        where: { name: 'Node.js' },
        update: {},
        create: {
          name: 'Node.js',
          category: 'Runtime',
          description: 'Node.js JavaScript runtime',
        },
      }),
      prisma.skill.upsert({
        where: { name: 'SQL' },
        update: {},
        create: {
          name: 'SQL',
          category: 'Database',
          description: 'Structured Query Language',
        },
      }),
      prisma.skill.upsert({
        where: { name: 'Project Management' },
        update: {},
        create: {
          name: 'Project Management',
          category: 'Business',
          description: 'Project management skills',
        },
      }),
    ]);

    // Preferences
    const preferences = await Promise.all([
      prisma.preference.upsert({
        where: { value: 'Technology' },
        update: {},
        create: {
          type: 'INDUSTRY',
          value: 'Technology',
          description: 'Technology industry preference',
        },
      }),
      prisma.preference.upsert({
        where: { value: 'Finance' },
        update: {},
        create: {
          type: 'INDUSTRY',
          value: 'Finance',
          description: 'Finance industry preference',
        },
      }),
      prisma.preference.upsert({
        where: { value: 'Remote' },
        update: {},
        create: {
          type: 'WORK_ENVIRONMENT',
          value: 'Remote',
          description: 'Remote work preference',
        },
      }),
      prisma.preference.upsert({
        where: { value: 'Toronto' },
        update: {},
        create: {
          type: 'LOCATION',
          value: 'Toronto',
          description: 'Toronto location preference',
        },
      }),
    ]);

    // Courses
    const courses = await Promise.all([
      prisma.course.upsert({
        where: { courseCode: 'CS101' },
        update: {},
        create: {
          courseCode: 'CS101',
          courseName: 'Introduction to Computer Science',
          credits: 3,
          description: 'Basic computer science concepts',
        },
      }),
      prisma.course.upsert({
        where: { courseCode: 'CS201' },
        update: {},
        create: {
          courseCode: 'CS201',
          courseName: 'Data Structures and Algorithms',
          credits: 4,
          description: 'Advanced data structures and algorithms',
        },
      }),
      prisma.course.upsert({
        where: { courseCode: 'BUS301' },
        update: {},
        create: {
          courseCode: 'BUS301',
          courseName: 'Business Strategy',
          credits: 3,
          description: 'Strategic business planning',
        },
      }),
    ]);

    console.log('✅ Reference data seeded successfully');

    // ============================================================================
    // SEED SAMPLE STUDENTS WITH EXTENDED PROFILES
    // ============================================================================

    console.log('👨‍🎓 Seeding sample students...');

    const passwordHash = await bcrypt.hash('password123', 12);

    // Student 1: Computer Science
    const student1User = await prisma.user.create({
      data: {
        email: 'alice.johnson@student.utoronto.ca',
        passwordHash,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        student: {
          create: {
            firstName: 'Alice',
            lastName: 'Johnson',
            phone: '+1-416-555-0101',
            location: 'Toronto, ON',
            linkedinUrl: 'https://linkedin.com/in/alice-johnson',
            elevatorPitch: 'Passionate computer science student with experience in full-stack development and machine learning.',
            profile: {
              create: {
                universityId: universities[0].universityId,
                degreeId: degrees[0].degreeId,
                majorId: majors[0].majorId,
                gpa: 3.8,
                graduationDate: new Date('2024-06-01'),
                availabilityStartDate: new Date('2024-05-01'),
                attachmentDuration: 4,
                willingToRelocate: true,
                remoteAllowed: true,
              },
            },
          },
        },
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Add skills for student 1
    await Promise.all([
      prisma.studentSkill.create({
        data: {
          studentId: student1User.student!.studentId,
          skillId: skills[0].skillId, // JavaScript
          proficiency: 4,
          yearsOfExperience: 2,
          verified: true,
        },
      }),
      prisma.studentSkill.create({
        data: {
          studentId: student1User.student!.studentId,
          skillId: skills[1].skillId, // Python
          proficiency: 5,
          yearsOfExperience: 3,
          verified: true,
        },
      }),
      prisma.studentSkill.create({
        data: {
          studentId: student1User.student!.studentId,
          skillId: skills[2].skillId, // React
          proficiency: 4,
          yearsOfExperience: 1.5,
          verified: false,
        },
      }),
    ]);

    // Add courses for student 1
    await Promise.all([
      prisma.studentCourse.create({
        data: {
          studentId: student1User.student!.studentId,
          courseId: courses[0].courseId,
          grade: 'A+',
          semester: 'Fall',
          year: 2022,
        },
      }),
      prisma.studentCourse.create({
        data: {
          studentId: student1User.student!.studentId,
          courseId: courses[1].courseId,
          grade: 'A',
          semester: 'Winter',
          year: 2023,
        },
      }),
    ]);

    // Add preferences for student 1
    await Promise.all([
      prisma.studentPreference.create({
        data: {
          studentId: student1User.student!.studentId,
          preferenceId: preferences[0].preferenceId, // Technology
          priority: 1,
        },
      }),
      prisma.studentPreference.create({
        data: {
          studentId: student1User.student!.studentId,
          preferenceId: preferences[3].preferenceId, // Toronto
          priority: 2,
        },
      }),
    ]);

    // Add experience for student 1
    const experience1 = await prisma.experience.create({
      data: {
        studentId: student1User.student!.studentId,
        jobTitle: 'Software Developer Intern',
        company: 'TechCorp Inc.',
        startDate: new Date('2023-05-01'),
        endDate: new Date('2023-08-31'),
        role: 'Developed web applications using React and Node.js',
        employmentType: 'INTERNSHIP',
        description: 'Built responsive web applications and RESTful APIs',
      },
    });

    await Promise.all([
      prisma.experienceTechnology.create({
        data: {
          experienceId: experience1.experienceId,
          skillId: skills[0].skillId, // JavaScript
        },
      }),
      prisma.experienceTechnology.create({
        data: {
          experienceId: experience1.experienceId,
          skillId: skills[2].skillId, // React
        },
      }),
      prisma.experienceTechnology.create({
        data: {
          experienceId: experience1.experienceId,
          skillId: skills[3].skillId, // Node.js
        },
      }),
    ]);

    // Add project for student 1
    const project1 = await prisma.project.create({
      data: {
        studentId: student1User.student!.studentId,
        projectName: 'E-commerce Platform',
        description: 'Full-stack e-commerce platform with payment integration',
        projectType: 'Personal',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-15'),
        githubUrl: 'https://github.com/alice/ecommerce-platform',
        liveUrl: 'https://alice-ecommerce.vercel.app',
      },
    });

    await Promise.all([
      prisma.projectTechnology.create({
        data: {
          projectId: project1.projectId,
          skillId: skills[0].skillId, // JavaScript
        },
      }),
      prisma.projectTechnology.create({
        data: {
          projectId: project1.projectId,
          skillId: skills[2].skillId, // React
        },
      }),
      prisma.projectTechnology.create({
        data: {
          projectId: project1.projectId,
          skillId: skills[3].skillId, // Node.js
        },
      }),
    ]);

    // Student 2: Software Engineering
    const student2User = await prisma.user.create({
      data: {
        email: 'bob.smith@student.uwaterloo.ca',
        passwordHash,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        student: {
          create: {
            firstName: 'Bob',
            lastName: 'Smith',
            phone: '+1-519-555-0102',
            location: 'Waterloo, ON',
            linkedinUrl: 'https://linkedin.com/in/bob-smith',
            elevatorPitch: 'Software engineering student specializing in backend systems and cloud architecture.',
            profile: {
              create: {
                universityId: universities[1].universityId,
                degreeId: degrees[1].degreeId,
                majorId: majors[1].majorId,
                gpa: 3.6,
                graduationDate: new Date('2024-08-01'),
                availabilityStartDate: new Date('2024-01-01'),
                attachmentDuration: 8,
                willingToRelocate: false,
                remoteAllowed: true,
              },
            },
          },
        },
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Add skills for student 2
    await Promise.all([
      prisma.studentSkill.create({
        data: {
          studentId: student2User.student!.studentId,
          skillId: skills[1].skillId, // Python
          proficiency: 5,
          yearsOfExperience: 4,
          verified: true,
        },
      }),
      prisma.studentSkill.create({
        data: {
          studentId: student2User.student!.studentId,
          skillId: skills[3].skillId, // Node.js
          proficiency: 4,
          yearsOfExperience: 2,
          verified: true,
        },
      }),
      prisma.studentSkill.create({
        data: {
          studentId: student2User.student!.studentId,
          skillId: skills[4].skillId, // SQL
          proficiency: 4,
          yearsOfExperience: 2.5,
          verified: true,
        },
      }),
    ]);

    console.log('✅ Sample students seeded successfully');

    // ============================================================================
    // SEED SAMPLE COMPANIES WITH EXTENDED PROFILES
    // ============================================================================

    console.log('🏢 Seeding sample companies...');

    // Company 1: Tech Startup
    const company1User = await prisma.user.create({
      data: {
        email: 'hr@innovatetech.com',
        passwordHash,
        role: UserRole.COMPANY,
        status: UserStatus.ACTIVE,
        company: {
          create: {
            companyName: 'InnovateTech Solutions',
            industry: 'Technology',
            location: 'Toronto, ON',
            website: 'https://innovatetech.com',
            description: 'Leading technology company specializing in AI and machine learning solutions.',
            profile: {
              create: {
                phone: '+1-416-555-0201',
                employeeCount: '51-200',
                foundedYear: 2018,
                headquarters: 'Toronto, ON',
                companyType: 'Startup',
                benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work', 'Stock Options'],
                culture: 'Fast-paced, innovative environment with focus on cutting-edge technology.',
              },
            },
          },
        },
      },
      include: {
        company: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Company 2: Enterprise
    const company2User = await prisma.user.create({
      data: {
        email: 'careers@globalcorp.com',
        passwordHash,
        role: UserRole.COMPANY,
        status: UserStatus.ACTIVE,
        company: {
          create: {
            companyName: 'Global Corp',
            industry: 'Finance',
            location: 'Montreal, QC',
            website: 'https://globalcorp.com',
            description: 'Fortune 500 financial services company with global presence.',
            profile: {
              create: {
                phone: '+1-514-555-0202',
                employeeCount: '1000+',
                foundedYear: 1995,
                headquarters: 'Montreal, QC',
                companyType: 'Enterprise',
                benefits: ['Health Insurance', 'Dental', 'Vision', 'Retirement Plan', 'Paid Time Off'],
                culture: 'Professional environment with emphasis on work-life balance and career development.',
              },
            },
          },
        },
      },
      include: {
        company: {
          include: {
            profile: true,
          },
        },
      },
    });

    console.log('✅ Sample companies seeded successfully');

    // ============================================================================
    // SEED SAMPLE OPPORTUNITIES
    // ============================================================================

    console.log('💼 Seeding sample opportunities...');

    // Opportunity 1: Software Developer Intern
    const opportunity1 = await prisma.opportunity.create({
      data: {
        companyId: company1User.company!.companyId,
        title: 'Software Developer Intern',
        description: 'Join our dynamic team to work on cutting-edge AI projects. You will be involved in developing machine learning models and building scalable web applications.',
        location: 'Toronto, ON',
        industry: 'Technology',
        jobTypes: ['INTERNSHIP'],
        gpaThreshold: 3.0,
        isTechnical: true,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-08-31'),
        applicationDeadline: new Date('2024-03-15'),
        status: OpportunityStatus.ACTIVE,
        salaryMin: 4000,
        salaryMax: 6000,
        currency: 'CAD',
        benefits: ['Mentorship', 'Learning Budget', 'Flexible Hours'],
        requirements: 'Strong programming skills in Python or JavaScript. Experience with web frameworks preferred.',
      },
    });

    // Add skills for opportunity 1
    await Promise.all([
      prisma.opportunitySkill.create({
        data: {
          opportunityId: opportunity1.opportunityId,
          skillId: skills[1].skillId, // Python
          skillWeight: 5,
          required: true,
        },
      }),
      prisma.opportunitySkill.create({
        data: {
          opportunityId: opportunity1.opportunityId,
          skillId: skills[0].skillId, // JavaScript
          skillWeight: 4,
          required: false,
        },
      }),
      prisma.opportunitySkill.create({
        data: {
          opportunityId: opportunity1.opportunityId,
          skillId: skills[2].skillId, // React
          skillWeight: 3,
          required: false,
        },
      }),
    ]);

    // Opportunity 2: Business Analyst Intern
    const opportunity2 = await prisma.opportunity.create({
      data: {
        companyId: company2User.company!.companyId,
        title: 'Business Analyst Intern',
        description: 'Support our business intelligence team in analyzing market trends and developing strategic recommendations.',
        location: 'Montreal, QC',
        industry: 'Finance',
        jobTypes: ['INTERNSHIP'],
        gpaThreshold: 3.2,
        isTechnical: false,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        applicationDeadline: new Date('2024-04-01'),
        status: OpportunityStatus.ACTIVE,
        salaryMin: 3500,
        salaryMax: 4500,
        currency: 'CAD',
        benefits: ['Health Insurance', 'Professional Development', 'Networking Events'],
        requirements: 'Strong analytical skills and business acumen. Experience with SQL and data analysis tools preferred.',
      },
    });

    // Add skills for opportunity 2
    await Promise.all([
      prisma.opportunitySkill.create({
        data: {
          opportunityId: opportunity2.opportunityId,
          skillId: skills[4].skillId, // SQL
          skillWeight: 4,
          required: false,
        },
      }),
      prisma.opportunitySkill.create({
        data: {
          opportunityId: opportunity2.opportunityId,
          skillId: skills[5].skillId, // Project Management
          skillWeight: 5,
          required: true,
        },
      }),
    ]);

    console.log('✅ Sample opportunities seeded successfully');

    // ============================================================================
    // SEED SAMPLE APPLICATIONS AND WORKFLOW
    // ============================================================================

    console.log('📝 Seeding sample applications...');

    // Application 1: Alice applies to InnovateTech
    const application1 = await prisma.application.create({
      data: {
        studentId: student1User.student!.studentId,
        opportunityId: opportunity1.opportunityId,
        status: ApplicationStatus.ACCEPTED,
        coverLetter: 'I am excited to apply for the Software Developer Intern position. My experience with Python and React makes me a great fit for this role.',
        matchScore: 85.5,
        reviewedBy: 'system', // Will be updated when admin reviews
        reviewNotes: 'Strong technical background, good GPA, relevant experience.',
      },
    });

    // Interview for application 1
    const interview1 = await prisma.interview.create({
      data: {
        applicationId: application1.applicationId,
        interviewType: 'VIDEO',
        scheduledDate: new Date('2024-02-15'),
        scheduledTime: '14:00',
        duration: 60,
        interviewer: 'John Doe',
        interviewerEmail: 'john.doe@innovatetech.com',
        meetingLink: 'https://zoom.us/j/123456789',
        status: 'COMPLETED',
        feedback: 'Excellent technical skills and communication. Strong problem-solving abilities.',
        rating: 5,
      },
    });

    // Placement for application 1
    const placement1 = await prisma.placement.create({
      data: {
        applicationId: application1.applicationId,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-08-31'),
        status: 'ACTIVE',
        salary: 5000,
        currency: 'CAD',
      },
    });

    // Application 2: Bob applies to InnovateTech
    const application2 = await prisma.application.create({
      data: {
        studentId: student2User.student!.studentId,
        opportunityId: opportunity1.opportunityId,
        status: ApplicationStatus.IN_REVIEW,
        coverLetter: 'I am interested in the Software Developer Intern position. My backend development experience would be valuable to your team.',
        matchScore: 78.2,
      },
    });

    // Application 3: Alice applies to Global Corp
    const application3 = await prisma.application.create({
      data: {
        studentId: student1User.student!.studentId,
        opportunityId: opportunity2.opportunityId,
        status: ApplicationStatus.SUBMITTED,
        coverLetter: 'I would like to apply for the Business Analyst Intern position to expand my skills in business intelligence.',
        matchScore: 65.8,
      },
    });

    console.log('✅ Sample applications seeded successfully');

    // ============================================================================
    // SEED ADMIN USER
    // ============================================================================

    console.log('👨‍💼 Seeding admin user...');

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@platform.com',
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        admin: {
          create: {
            superAdmin: true,
          },
        },
      },
    });

    console.log('✅ Admin user seeded successfully');

    // ============================================================================
    // SEED SAMPLE NOTIFICATIONS AND LOGS
    // ============================================================================

    console.log('🔔 Seeding sample notifications and logs...');

    // Notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: student1User.userId,
          type: 'APPLICATION_UPDATE',
          title: 'Application Accepted',
          message: 'Your application for Software Developer Intern has been accepted!',
          actionUrl: `/applications/${application1.applicationId}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: student1User.userId,
          type: 'INTERVIEW_SCHEDULED',
          title: 'Interview Scheduled',
          message: 'Your interview for Software Developer Intern is scheduled for Feb 15, 2024 at 2:00 PM.',
          actionUrl: `/interviews/${interview1.interviewId}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: company1User.userId,
          type: 'OPPORTUNITY_MATCH',
          title: 'New Application Received',
          message: 'You have received a new application for Software Developer Intern position.',
          actionUrl: `/applications/${application2.applicationId}`,
        },
      }),
    ]);

    // System logs
    await Promise.all([
      prisma.systemLog.create({
        data: {
          userId: adminUser.userId,
          level: 'INFO',
          action: 'CREATE_OPPORTUNITY',
          details: 'Created opportunity: Software Developer Intern',
          metadata: { opportunityId: opportunity1.opportunityId },
        },
      }),
      prisma.systemLog.create({
        data: {
          userId: adminUser.userId,
          level: 'INFO',
          action: 'APPROVE_OPPORTUNITY',
          details: 'Approved opportunity: Software Developer Intern',
          metadata: { opportunityId: opportunity1.opportunityId },
        },
      }),
      prisma.systemLog.create({
        data: {
          level: 'INFO',
          action: 'APPLICATION_SUBMITTED',
          details: 'New application submitted',
          metadata: { applicationId: application1.applicationId },
        },
      }),
    ]);

    // Queue tasks
    await Promise.all([
      prisma.queue.create({
        data: {
          taskType: 'MATCH_CALCULATION',
          status: 'COMPLETED',
          payload: { applicationId: application1.applicationId },
          priority: 1,
          processedAt: new Date(),
          completedAt: new Date(),
        },
      }),
      prisma.queue.create({
        data: {
          taskType: 'EMAIL_NOTIFICATION',
          status: 'PENDING',
          payload: { 
            userId: student2User.userId,
            type: 'application_received',
            applicationId: application2.applicationId 
          },
          priority: 2,
        },
      }),
    ]);

    console.log('✅ Sample notifications and logs seeded successfully');

    console.log('🎉 Phase 2 database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`- Universities: ${universities.length}`);
    console.log(`- Degrees: ${degrees.length}`);
    console.log(`- Majors: ${majors.length}`);
    console.log(`- Skills: ${skills.length}`);
    console.log(`- Preferences: ${preferences.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Students: 2 (with extended profiles)`);
    console.log(`- Companies: 2 (with extended profiles)`);
    console.log(`- Opportunities: 2`);
    console.log(`- Applications: 3`);
    console.log(`- Interviews: 1`);
    console.log(`- Placements: 1`);
    console.log(`- Admin users: 1`);
    console.log(`- Notifications: 3`);
    console.log(`- System logs: 3`);
    console.log(`- Queue tasks: 2`);

    console.log('\n🔑 Test credentials:');
    console.log('Student 1: alice.johnson@student.utoronto.ca / password123');
    console.log('Student 2: bob.smith@student.uwaterloo.ca / password123');
    console.log('Company 1: hr@innovatetech.com / password123');
    console.log('Company 2: careers@globalcorp.com / password123');
    console.log('Admin: admin@platform.com / password123');

  } catch (error) {
    console.error('❌ Error seeding Phase 2 data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedPhase2Data()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedPhase2Data;