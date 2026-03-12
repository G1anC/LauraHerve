import { SignJWT, jwtVerify } from 'jose';
import { type SessionUser } from '@repo/auth-shared';
import { CryptoService } from '@repo/crypto';

export interface AuthConfig {
  jwtSecret: string;
  issuer?: string;
  audience?: string;
  tokenExpiration?: string;
}

export class AuthManager {
  private readonly secret: Uint8Array;
  private readonly crypto: CryptoService;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly tokenExpiration: string;

  constructor(config: AuthConfig) {
    this.secret = new TextEncoder().encode(config.jwtSecret);

    this.crypto = new CryptoService({ ENCRYPTION_KEY: config.jwtSecret });

    this.issuer = config.issuer ?? 'laura-herve-portfolio';
    this.audience = config.audience ?? 'laura-herve-client';
    this.tokenExpiration = config.tokenExpiration ?? '7d';
  }

  async createToken(user: SessionUser): Promise<string> {
    return await new SignJWT({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.tokenExpiration)
      .sign(this.secret);
  }

  async verifyToken(token: string): Promise<SessionUser | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return {
        id: payload.id as string,
        email: payload.email as string,
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        role: payload.role as any,
      };
    } catch (error) {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return await this.crypto.hash.heavy(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await this.crypto.verify.heavy(hash, password);
  }

  encryptData(text: string): string {
    return this.crypto.encrypt(text);
  }

  decryptData(data: string): string {
    return this.crypto.decrypt(data);
  }
}

export type { SessionUser } from '@repo/auth-shared';
