import { prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing data (optional, but good for clean seed)
  // Be careful if this is run on a non-dev DB, but we only do this in development!
  
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ Seeding is intended for development environments only!');
    return;
  }

  // Define synthetic users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@thikana.local' },
    update: {},
    create: {
      email: 'admin@thikana.local',
      name: 'System Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      uniqueCode: 'TK-ADMIN',
    },
  });

  const landlord1 = await prisma.user.upsert({
    where: { email: 'landlord1@thikana.local' },
    update: {},
    create: {
      email: 'landlord1@thikana.local',
      name: 'Rahim Landlord',
      passwordHash: userPassword,
      role: 'LANDLORD',
      status: 'ACTIVE',
      uniqueCode: 'TK-LLORD1',
      landlordProfile: {
        create: {
          phone: '01711000001',
          verificationStatus: 'VERIFIED',
        }
      }
    },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: 'landlord2@thikana.local' },
    update: {},
    create: {
      email: 'landlord2@thikana.local',
      name: 'Karim Landlord',
      passwordHash: userPassword,
      role: 'LANDLORD',
      status: 'ACTIVE',
      uniqueCode: 'TK-LLORD2',
      landlordProfile: {
        create: {
          phone: '01711000002',
          verificationStatus: 'PENDING',
        }
      }
    },
  });

  const tenant1 = await prisma.user.upsert({
    where: { email: 'tenant1@thikana.local' },
    update: {},
    create: {
      email: 'tenant1@thikana.local',
      name: 'Safa Tenant',
      passwordHash: userPassword,
      role: 'TENANT',
      status: 'ACTIVE',
      uniqueCode: 'TK-TENAN1',
      tenantProfile: {
        create: {
          phone: '01711000003',
          occupancyType: 'FAMILY'
        }
      }
    },
  });

  const tenant2 = await prisma.user.upsert({
    where: { email: 'tenant2@thikana.local' },
    update: {},
    create: {
      email: 'tenant2@thikana.local',
      name: 'Mitu Tenant',
      passwordHash: userPassword,
      role: 'TENANT',
      status: 'ACTIVE',
      uniqueCode: 'TK-TENAN2',
      tenantProfile: {
        create: {
          phone: '01711000004',
          occupancyType: 'BACHELOR'
        }
      }
    },
  });

  // Create Properties for landlord 1
  const property1 = await prisma.property.create({
    data: {
      ownerId: landlord1.id,
      title: 'Luxury 3BHK in Gulshan',
      description: 'A beautiful luxury apartment...',
      propertyType: 'APARTMENT',
      status: 'PUBLISHED',
      address: 'Road 11, Gulshan',
      city: 'Dhaka',
      area: 'Gulshan',
      rent: 50000,
      bedrooms: 3,
      bathrooms: 3,
      availableFrom: new Date(),
      furnishingStatus: 'SEMI_FURNISHED',
    }
  });

  // Create Properties for landlord 2
  const property2 = await prisma.property.create({
    data: {
      ownerId: landlord2.id,
      title: 'Cozy Room in Banani',
      description: 'A great room for bachelor...',
      propertyType: 'ROOM',
      status: 'PENDING_REVIEW',
      address: 'Block C, Banani',
      city: 'Dhaka',
      area: 'Banani',
      rent: 15000,
      bedrooms: 1,
      bathrooms: 1,
      availableFrom: new Date(),
      furnishingStatus: 'FURNISHED',
    }
  });

  console.log('✅ Seeding complete!');
  console.log('Demo Credentials:');
  console.log('Admin: admin@thikana.local / Admin@123');
  console.log('Landlord: landlord1@thikana.local / User@123');
  console.log('Tenant: tenant1@thikana.local / User@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
