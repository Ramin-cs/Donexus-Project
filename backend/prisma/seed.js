import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        title: 'Acme Corp'
      }
    }),
    prisma.company.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        title: 'Globex Inc'
      }
    }),
    prisma.company.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        title: 'TechStart Solutions'
      }
    })
  ]);

  console.log('✅ Companies created:', companies.length);

  // Hash password for users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create users
  const users = await Promise.all([
    // Admin users
    prisma.person.upsert({
      where: { emailAddress: 'admin@acme.com' },
      update: {},
      create: {
        fullName: 'Admin User',
        emailAddress: 'admin@acme.com',
        passwordHash,
        userType: 'ADMIN',
        companyId: 1
      }
    }),
    prisma.person.upsert({
      where: { emailAddress: 'admin@globex.com' },
      update: {},
      create: {
        fullName: 'Globex Admin',
        emailAddress: 'admin@globex.com',
        passwordHash,
        userType: 'ADMIN',
        companyId: 2
      }
    }),

    // Support users
    prisma.person.upsert({
      where: { emailAddress: 'support@acme.com' },
      update: {},
      create: {
        fullName: 'Alice Support',
        emailAddress: 'support@acme.com',
        passwordHash,
        userType: 'SUPPORT',
        companyId: 1
      }
    }),
    prisma.person.upsert({
      where: { emailAddress: 'support@globex.com' },
      update: {},
      create: {
        fullName: 'Bob Support',
        emailAddress: 'support@globex.com',
        passwordHash,
        userType: 'SUPPORT',
        companyId: 2
      }
    }),

    // Normal users
    prisma.person.upsert({
      where: { emailAddress: 'user1@acme.com' },
      update: {},
      create: {
        fullName: 'John Doe',
        emailAddress: 'user1@acme.com',
        passwordHash,
        userType: 'NORMAL',
        companyId: 1
      }
    }),
    prisma.person.upsert({
      where: { emailAddress: 'user2@acme.com' },
      update: {},
      create: {
        fullName: 'Jane Smith',
        emailAddress: 'user2@acme.com',
        passwordHash,
        userType: 'NORMAL',
        companyId: 1
      }
    }),
    prisma.person.upsert({
      where: { emailAddress: 'user1@globex.com' },
      update: {},
      create: {
        fullName: 'Mike Johnson',
        emailAddress: 'user1@globex.com',
        passwordHash,
        userType: 'NORMAL',
        companyId: 2
      }
    }),
    prisma.person.upsert({
      where: { emailAddress: 'user1@techstart.com' },
      update: {},
      create: {
        fullName: 'Sarah Wilson',
        emailAddress: 'user1@techstart.com',
        passwordHash,
        userType: 'NORMAL',
        companyId: 3
      }
    })
  ]);

  console.log('✅ Users created:', users.length);

  // Get user IDs for creating tickets
  const user1 = await prisma.person.findUnique({ where: { emailAddress: 'user1@acme.com' } });
  const user2 = await prisma.person.findUnique({ where: { emailAddress: 'user2@acme.com' } });
  const user3 = await prisma.person.findUnique({ where: { emailAddress: 'user1@globex.com' } });
  const user4 = await prisma.person.findUnique({ where: { emailAddress: 'user1@techstart.com' } });

  // Create tickets
  const tickets = await Promise.all([
    prisma.issue.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        subject: 'Broken printer on 3rd floor',
        details: 'The printer in the marketing department is jammed and showing error code E-04. Need immediate assistance.',
        state: 'open',
        personId: user1.id,
        companyId: 1
      }
    }),
    prisma.issue.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        subject: 'VPN connection issues',
        details: 'Cannot connect to company VPN since this morning. Getting authentication error.',
        state: 'open',
        personId: user2.id,
        companyId: 1
      }
    }),
    prisma.issue.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        subject: 'Website down - 500 error',
        details: 'Our main landing page is returning 500 internal server error. Customers cannot access the site.',
        state: 'pending',
        personId: user3.id,
        companyId: 2
      }
    }),
    prisma.issue.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        subject: 'Request for new laptop',
        details: 'Need a new MacBook Pro M3 for the new developer joining next week.',
        state: 'open',
        personId: user1.id,
        companyId: 1
      }
    }),
    prisma.issue.upsert({
      where: { id: 5 },
      update: {},
      create: {
        id: 5,
        subject: 'Email spam issue',
        details: 'Receiving excessive spam emails. Need help configuring better spam filters.',
        state: 'resolved',
        personId: user2.id,
        companyId: 1
      }
    }),
    prisma.issue.upsert({
      where: { id: 6 },
      update: {},
      create: {
        id: 6,
        subject: 'Software license renewal',
        details: 'Adobe Creative Suite licenses expire next month. Need to renew for 10 users.',
        state: 'open',
        personId: user3.id,
        companyId: 2
      }
    }),
    prisma.issue.upsert({
      where: { id: 7 },
      update: {},
      create: {
        id: 7,
        subject: 'New office setup',
        details: 'Setting up new office space. Need help with network configuration and equipment setup.',
        state: 'pending',
        personId: user4.id,
        companyId: 3
      }
    }),
    prisma.issue.upsert({
      where: { id: 8 },
      update: {},
      create: {
        id: 8,
        subject: 'Password reset request',
        details: 'Forgot my password and cannot access my account. Need immediate reset.',
        state: 'closed',
        personId: user1.id,
        companyId: 1
      }
    })
  ]);

  console.log('✅ Tickets created:', tickets.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@acme.com / password123');
  console.log('Support: support@acme.com / password123');
  console.log('User: user1@acme.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });