const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Resetting and seeding realistic gamified data...');

  // Cascade clear existing data
  await prisma.userTask.deleteMany({});
  await prisma.payoutRequest.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  // 1: Gamified Dummy Users (for Leaderboard)
  await prisma.user.createMany({
    data: [
      { email: 'grandmaster@example.com', name: 'Grandmaster Flex', password: 'hash', points: 4000, lifetimePoints: 95000, role: 'USER' },
      { email: 'sarah.top@gmail.com', name: 'Sarah T.', password: 'hash', points: 1500, lifetimePoints: 82000, role: 'USER' },
      { email: 'hustle_king@mail.com', name: 'Hustle King', password: 'hash', points: 200, lifetimePoints: 61500, role: 'USER' },
      { email: 'new.member@test.com', name: 'Newbie', password: 'hash', points: 100, lifetimePoints: 100, role: 'USER' }
    ]
  });

  const tasks = [
    {
      title: 'Sign up for DoorDash Dasher',
      description: 'Become a Dasher today! Register using our affiliate link and complete your background check.',
      rewardPoints: 2000,
      type: 'PARTNER',
      url: 'https://doordash.com/dasher/signup',
      isVipOnly: false
    },
    {
      title: 'Get 10% Cash Back on Rakuten',
      description: 'Create a free Rakuten account, make your first purchase over $25, and return here to claim your massive reward.',
      rewardPoints: 2500,
      type: 'PARTNER',
      url: 'https://www.rakuten.com',
      isVipOnly: false
    },
    {
      title: 'Test Web App: Notion AI',
      description: 'Sign up for Notion, try out their new AI text generator feature on a blank page, and rate your experience.',
      rewardPoints: 500,
      type: 'APP_TEST',
      url: 'https://notion.so',
      isVipOnly: false
    },
    {
      title: 'Diamond Tier Alpha Release Testing',
      description: 'Provide severe bug testing metrics for an upcoming AAA video game release. HIGH PAYOUT. Only available to trusted VIP rank testers.',
      rewardPoints: 15000,
      type: 'APP_TEST',
      url: 'https://example.com/vip-testing',
      isVipOnly: true // Gamified VIP restriction applied
    },
    {
      title: 'Watch Movie Trailer: Dune 2',
      description: 'Watch the entire official trailer for Dune: Part Two on YouTube to earn points instantly.',
      rewardPoints: 50,
      type: 'VIDEO',
      url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      isVipOnly: false
    }
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: t
    });
  }

  console.log('Gamification data successfully seeded! Restart your server to view Leaderboards and VIP Locks natively.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
