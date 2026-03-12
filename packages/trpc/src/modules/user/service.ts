import { TRPCError } from '@trpc/server';
import { type PrismaClient } from '@repo/database';
import { type AuthManager } from '@repo/auth';

export const userService = {
  getProfile: async (db: PrismaClient, userId: string) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  },

  updateProfile: async (
    db: PrismaClient,
    userId: string,
    data: { firstName?: string; lastName?: string }
  ) => {
    try {
      return await db.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile',
      });
    }
  },

  changePassword: async (
    db: PrismaClient,
    auth: AuthManager,
    userId: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const isValid = await auth.verifyPassword(currentPassword, user.password);

    if (!isValid) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await auth.hashPassword(newPassword);

    return await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },
};

export default userService;
