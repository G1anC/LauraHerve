import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'argon2';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateSecurePassword(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

async function main() {
  const adminEmail = 'admin@lauraherve.com';
  const rawPassword = generateSecurePassword(16);
  const firstName = 'Laura';
  const lastName = 'Herve';

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let userId: string;

  if (existingUser) {
    console.log('\n⚠️  Admin user already exists - skipping user creation\n');
    userId = existingUser.id;
  } else {
    const hashedPassword = await hash(rawPassword);

    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName,
        lastName,
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: true,
      },
    });

    userId = user.id;

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                   ║');
    console.log('║          🎨 ADMIN CREDENTIALS CREATED SUCCESSFULLY! 🎨            ║');
    console.log('║                                                                   ║');
    console.log('║  ⚠️  IMPORTANT: SAVE THESE CREDENTIALS IMMEDIATELY! ⚠️             ║');
    console.log('║                                                                   ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    console.log('║                                                                   ║');
    console.log(`║  📧 Email:    ${adminEmail.padEnd(47)} ║`);
    console.log(`║  🔑 Password: ${rawPassword.padEnd(47)} ║`);
    console.log(`║  🆔 User ID:  ${userId.padEnd(47)} ║`);
    console.log('║                                                                   ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    console.log('║                                                                   ║');
    console.log('║  💾 THIS PASSWORD WILL NOT BE SHOWN AGAIN!                        ║');
    console.log('║  📝 Copy it to a secure location NOW!                             ║');
    console.log('║                                                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log('\n');
  }

  const existingAbout = await prisma.aboutSection.findFirst();

  if (!existingAbout) {
    await prisma.aboutSection.create({
      data: {
        content: `Laura Hervé est une artiste française contemporaine basée à Paris.

Son travail explore les thèmes de la mémoire, de l'identité et de la transformation à travers différents médiums incluant la peinture, la sculpture et les installations multimédias.

Diplômée de l'École Nationale Supérieure des Beaux-Arts de Paris, Laura a exposé ses œuvres dans plusieurs galeries et musées en France et à l'étranger. Son approche artistique unique combine des techniques traditionnelles avec des éléments contemporains, créant des pièces qui invitent à la réflexion et à l'introspection.

Ses œuvres font partie de collections privées et publiques en Europe et aux États-Unis.`,
      },
    });
    console.log('✅ About section seeded successfully\n');
  } else {
    console.log('ℹ️  About section already exists - skipping\n');
  }

  const existingSocial = await prisma.socialLinks.findFirst();

  if (!existingSocial) {
    await prisma.socialLinks.create({
      data: {
        email: 'contact@lauraherve.com',
        instagram: null,
        facebook: null,
      },
    });
    console.log('✅ Social links seeded successfully\n');
  } else {
    console.log('ℹ️  Social links already exist - skipping\n');
  }

  console.log('🎉 Database seeding completed!\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Error during seeding:\n', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
