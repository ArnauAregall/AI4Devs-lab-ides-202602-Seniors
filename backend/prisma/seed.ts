import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Seed script only runs in development environment. Skipping.');
    return;
  }

  console.log('Seeding database with sample data...');

  const hashedPassword = await bcrypt.hash('recruiter123', 12);
  await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: {
      email: 'recruiter@example.com',
      hashedPassword,
      role: 'recruiter',
    },
  });
  console.log('Seeded user: recruiter@example.com (password: recruiter123)');


  const candidate = await prisma.candidate.create({
    data: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '+34600123456',
      address: '1 Passeig de Gràcia, Barcelona',
      source: 'LinkedIn',
      notes: 'Strong full-stack engineering background. Available immediately.',
      createdBy: 'seed-script',
      educations: {
        create: [
          {
            degree: 'BSc Computer Science',
            institution: 'Universitat Politècnica de Catalunya',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-30'),
          },
        ],
      },
      workExperiences: {
        create: [
          {
            company: 'Acme Corp',
            title: 'Senior Software Engineer',
            startDate: new Date('2019-09-01'),
            endDate: null,
            description: 'Led development of the core product API serving 1M+ users.',
          },
        ],
      },
    },
    include: {
      educations: true,
      workExperiences: true,
    },
  });

  const cv = await prisma.candidateCv.create({
    data: {
      candidateId: candidate.id,
      storageKey: 'cvs/seed-alice-johnson-cv.pdf',
      filename: 'alice-johnson-cv.pdf',
      contentType: 'application/pdf',
      sizeBytes: BigInt(204800),
      isActive: true,
    },
  });

  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { currentCvId: cv.id },
  });

  console.log(`Seeded candidate: ${candidate.firstName} ${candidate.lastName} (id: ${candidate.id})`);
  console.log(`Seeded CV: ${cv.filename} (id: ${cv.id})`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
