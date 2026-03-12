import type { PrismaClient } from '@repo/database';

interface SocialLinksInput {
  instagram?: string | null;
  facebook?: string | null;
  email?: string | null;
}

export const socialService = {
  get: async (db: PrismaClient) => {
    const social = await db.socialLinks.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    return {
      instagram: social?.instagram || null,
      facebook: social?.facebook || null,
      email: social?.email || null,
      updatedAt: social?.updatedAt || null,
    };
  },

  update: async (db: PrismaClient, data: SocialLinksInput) => {
    const existing = await db.socialLinks.findFirst();

    if (existing) {
      return db.socialLinks.update({
        where: { id: existing.id },
        data,
      });
    }

    return db.socialLinks.create({
      data,
    });
  },
};

export default socialService;
