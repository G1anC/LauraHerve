import type { PrismaClient } from '@repo/database';

export const aboutService = {
  get: async (db: PrismaClient) => {
    const about = await db.aboutSection.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    return {
      content: about?.content || '',
      updatedAt: about?.updatedAt || null,
    };
  },

  update: async (db: PrismaClient, content: string) => {
    const existing = await db.aboutSection.findFirst();

    if (existing) {
      return db.aboutSection.update({
        where: { id: existing.id },
        data: { content },
      });
    }

    return db.aboutSection.create({
      data: { content },
    });
  },
};

export default aboutService;
