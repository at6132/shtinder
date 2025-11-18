import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countUsers() {
  try {
    const totalUsers = await prisma.user.count();
    const completedOnboarding = await prisma.user.count({
      where: { onboardingComplete: true },
    });
    const notCompletedOnboarding = await prisma.user.count({
      where: { onboardingComplete: false },
    });
    const adminUsers = await prisma.user.count({
      where: { isAdmin: true },
    });
    const usersWithPhotos = await prisma.user.count({
      where: {
        photos: {
          some: {},
        },
      },
    });

    console.log('\n📊 User Statistics:');
    console.log('===================');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Completed Onboarding: ${completedOnboarding}`);
    console.log(`Not Completed Onboarding: ${notCompletedOnboarding}`);
    console.log(`Admin Users: ${adminUsers}`);
    console.log(`Users with Photos: ${usersWithPhotos}`);
    console.log(`Users without Photos: ${totalUsers - usersWithPhotos}`);
    console.log('===================\n');

    // Get breakdown by gender
    const maleUsers = await prisma.user.count({
      where: { gender: 'male' },
    });
    const femaleUsers = await prisma.user.count({
      where: { gender: 'female' },
    });

    console.log('👥 Gender Breakdown:');
    console.log(`Male: ${maleUsers}`);
    console.log(`Female: ${femaleUsers}`);
    console.log('===================\n');
  } catch (error) {
    console.error('Error counting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countUsers();

