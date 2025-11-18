import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const maleNames = [
  'James', 'John', 'Robert', 'Michael', 'William',
  'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald',
  'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth',
];

const femaleNames = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth',
  'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra',
  'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
];

const interests = [
  'Travel', 'Music', 'Sports', 'Reading', 'Cooking',
  'Photography', 'Movies', 'Gaming', 'Art', 'Dancing',
  'Hiking', 'Yoga', 'Fitness', 'Technology', 'Fashion',
];

const bios = [
  'Love traveling and exploring new places!',
  'Music enthusiast and coffee lover.',
  'Fitness fanatic and outdoor adventurer.',
  'Bookworm and movie buff.',
  'Foodie who loves trying new restaurants.',
  'Photographer capturing life\'s moments.',
  'Tech geek and startup enthusiast.',
  'Yoga instructor and wellness advocate.',
  'Artist and creative soul.',
  'Sports fan and team player.',
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.block.deleteMany();
  await prisma.report.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const defaultPreferences = {
    ageRange: { min: 14, max: 99 },
    gender: 'both',
    maxDistanceKm: 100,
    interestsPriority: false,
    showMyAge: true,
    showMyDistance: true,
  };

  // Create 3 admin accounts
  console.log('Creating admin accounts...');
  const admins = [];
  for (let i = 0; i < 3; i++) {
    const admin = await prisma.user.create({
      data: {
        email: `admin${i + 1}@shtinder.com`,
        password: hashedPassword,
        name: `Admin ${i + 1}`,
        age: 30 + i,
        gender: i % 2 === 0 ? 'male' : 'female',
        bio: `Admin account ${i + 1}`,
        interests: ['Admin', 'Management'],
        preferences: defaultPreferences,
        isAdmin: true,
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      },
    });
    admins.push(admin);

    // Add photo for admin
    await prisma.photo.create({
      data: {
        url: `https://i.pravatar.cc/400?img=${i + 1}`,
        userId: admin.id,
      },
    });
  }

  // Create 20 male users
  console.log('Creating male users...');
  const maleUsers = [];
  for (let i = 0; i < 20; i++) {
    const age = 22 + Math.floor(Math.random() * 15);
    const userInterests = interests
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3));
    const height = 165 + Math.floor(Math.random() * 30);

    const user = await prisma.user.create({
      data: {
        email: `male${i + 1}@shtinder.com`,
        password: hashedPassword,
        name: maleNames[i],
        age,
        gender: 'male',
        bio: bios[i % bios.length],
        height,
        interests: userInterests,
        preferences: defaultPreferences,
        latitude: 40.7128 + (Math.random() - 0.5) * 0.2,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.2,
      },
    });
    maleUsers.push(user);

    // Add 2-4 photos for each user
    const photoCount = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < photoCount; j++) {
      await prisma.photo.create({
        data: {
          url: `https://i.pravatar.cc/400?img=${50 + i * 3 + j}`,
          userId: user.id,
        },
      });
    }
  }

  // Create 20 female users
  console.log('Creating female users...');
  const femaleUsers = [];
  for (let i = 0; i < 20; i++) {
    const age = 22 + Math.floor(Math.random() * 15);
    const userInterests = interests
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3));
    const height = 150 + Math.floor(Math.random() * 25);

    const user = await prisma.user.create({
      data: {
        email: `female${i + 1}@shtinder.com`,
        password: hashedPassword,
        name: femaleNames[i],
        age,
        gender: 'female',
        bio: bios[i % bios.length],
        height,
        interests: userInterests,
        preferences: defaultPreferences,
        latitude: 40.7128 + (Math.random() - 0.5) * 0.2,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.2,
      },
    });
    femaleUsers.push(user);

    // Add 2-4 photos for each user
    const photoCount = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < photoCount; j++) {
      await prisma.photo.create({
        data: {
          url: `https://i.pravatar.cc/400?img=${100 + i * 3 + j}`,
          userId: user.id,
        },
      });
    }
  }

  // Create some swipes and matches
  console.log('Creating swipes and matches...');
  const allUsers = [...maleUsers, ...femaleUsers];
  
  // Create some swipes
  for (let i = 0; i < 50; i++) {
    const swiper = allUsers[Math.floor(Math.random() * allUsers.length)];
    let target = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    // Make sure swiper and target are different
    while (swiper.id === target.id) {
      target = allUsers[Math.floor(Math.random() * allUsers.length)];
    }

    // Check if already swiped
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: swiper.id,
          targetId: target.id,
        },
      },
    });

    if (!existingSwipe) {
      const directions = ['like', 'dislike', 'superlike'];
      const direction = directions[Math.floor(Math.random() * directions.length)];

      await prisma.swipe.create({
        data: {
          swiperId: swiper.id,
          targetId: target.id,
          direction,
        },
      });

      // If both users liked each other, create a match
      if (direction === 'like' || direction === 'superlike') {
        const reverseSwipe = await prisma.swipe.findUnique({
          where: {
            swiperId_targetId: {
              swiperId: target.id,
              targetId: swiper.id,
            },
          },
        });

        if (reverseSwipe && (reverseSwipe.direction === 'like' || reverseSwipe.direction === 'superlike')) {
          const user1Id = swiper.id < target.id ? swiper.id : target.id;
          const user2Id = swiper.id < target.id ? target.id : swiper.id;

          const existingMatch = await prisma.match.findFirst({
            where: {
              OR: [
                { user1Id, user2Id },
                { user1Id: user2Id, user2Id: user1Id },
              ],
            },
          });

          if (!existingMatch) {
            await prisma.match.create({
              data: {
                user1Id,
                user2Id,
              },
            });
          }
        }
      }
    }
  }

  console.log('✅ Seeding completed!');
  console.log(`Created ${admins.length} admin accounts`);
  console.log(`Created ${maleUsers.length} male users`);
  console.log(`Created ${femaleUsers.length} female users`);
  console.log('\nAdmin login credentials:');
  console.log('Email: admin1@shtinder.com');
  console.log('Email: admin2@shtinder.com');
  console.log('Email: admin3@shtinder.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

