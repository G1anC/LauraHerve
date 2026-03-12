# 🚂 Railway Deployment Guide - Laura Herve Portfolio

This guide explains how to deploy the Laura Herve portfolio to Railway with Prisma migrations.

## 📋 Prerequisites

- Railway account ([railway.app](https://railway.app))
- Railway CLI installed (`npm i -g @railway/cli`)
- Project linked to Railway (`railway link`)

## 🏗️ Architecture

The monorepo is configured for Railway deployment with:

- **Backend**: Hono + tRPC server (Bun runtime)
- **Database**: PostgreSQL with Prisma ORM
- **Migrations**: Automated via `prisma migrate deploy`
- **Connection Pooling**: Optimized for production (10 connections max)

## 🚀 Deployment Configuration

### Railway.toml

The project includes a `railway.toml` configuration:

```toml
[build]
builder = "nixpacks"
buildCommand = "bun install && cd packages/database && bun run db:generate"

[deploy]
startCommand = "/bin/sh -c 'cd packages/database && bun run db:migrate:deploy && cd ../../apps/backend && bun run start'"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### Build Process

1. **Install dependencies**: `bun install`
2. **Generate Prisma Client**: Runs `prisma generate` in build step
3. **Build backend**: Compiles TypeScript to optimized Bun bundle

### Start Process

1. **Run migrations**: `prisma migrate deploy` applies pending migrations
2. **Start server**: Launches the backend server

## 🔧 Environment Variables

Configure these in Railway dashboard:

### Required Variables

```bash
# Database (Auto-configured by Railway Postgres)
DATABASE_URL=postgresql://...

# Authentication
ENCRYPTION_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# MinIO S3 Storage
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ROOT_USER=your-minio-user
MINIO_ROOT_PASSWORD=your-minio-password
MINIO_BUCKET_NAME=your-bucket-name

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# CORS
TRUSTED_ORIGINS=https://your-frontend-domain.com,https://your-backoffice-domain.com

# Node Environment
NODE_ENV=production
```

### Optional Variables

```bash
# Port (Railway auto-configures this)
PORT=3001
```

## 📦 Database Setup

### 1. Provision PostgreSQL

```bash
railway add --database postgresql
```

Railway automatically:
- Creates a PostgreSQL instance
- Sets the `DATABASE_URL` environment variable
- Configures SSL connections

### 2. Initial Migration

On first deployment, migrations run automatically via the start command.

### 3. Seed Database (Optional)

To create the admin user, run seed manually:

```bash
railway run bun run db:seed
```

This creates:
- Admin user (`admin@lauraherve.com` with random password)
- About section with French bio
- Social links configuration

**⚠️ Save the admin credentials shown in the console!**

## 🔄 Migration Workflow

### Development

```bash
# Create a new migration
cd packages/database
bun run db:migrate:dev --name add_new_feature

# Push changes without creating migration (dev only)
bun run db:push
```

### Production

Migrations are **automatically applied** on Railway deployment:

1. Push code to GitHub
2. Railway detects changes
3. Runs `prisma generate` during build
4. Runs `prisma migrate deploy` during startup
5. Starts the application

**Never run `prisma migrate dev` in production!**

## 🛠️ Manual Deployment

### Deploy from CLI

```bash
# Deploy current branch
railway up

# Watch deployment logs
railway logs

# Check deployment status
railway status
```

### Rollback

```bash
# List recent deployments
railway deployments

# Rollback to specific deployment
railway rollback <deployment-id>
```

## 📊 Monitoring

### View Logs

```bash
# Follow logs in real-time
railway logs --follow

# View specific service logs
railway logs --service backend

# Use rdll for better log viewing (if installed)
rdll
```

### Database Access

```bash
# Open database shell
railway connect postgresql

# View database in GUI
cd packages/database && bun run db:studio
```

## 🐛 Troubleshooting

### Migration Fails

If migrations fail on deployment:

```bash
# Check migration status
railway run cd packages/database && bun run prisma migrate status

# Reset database (DESTRUCTIVE - development only!)
railway run cd packages/database && bun run prisma migrate reset

# Apply migrations manually
railway run cd packages/database && bun run db:migrate:deploy
```

### Connection Pool Exhausted

The Prisma client is configured with:
- **Production**: 10 max connections
- **Development**: 5 max connections

If you see connection errors:

1. Check active connections in Railway dashboard
2. Adjust `max` in `packages/database/src/index.ts`
3. Consider using Prisma Accelerate for serverless deployments

### Build Fails

Common issues:

1. **Missing dependencies**: Ensure all workspace packages are in `package.json`
2. **TypeScript errors**: Run `bun run typecheck` locally first
3. **Prisma schema errors**: Validate with `bun run db:generate`

## 🔒 Security Best Practices

### Production Checklist

- ✅ Set `NODE_ENV=production`
- ✅ Use strong `ENCRYPTION_SECRET` (32+ characters)
- ✅ Enable SSL for database (`sslmode=require` in `DATABASE_URL`)
- ✅ Restrict `TRUSTED_ORIGINS` to your actual domains
- ✅ Rotate secrets regularly
- ✅ Enable Railway's private networking
- ✅ Use Railway's secret management (not .env files)

### Connection String Security

Railway automatically configures SSL for PostgreSQL. If using a custom database:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## 📈 Performance Optimization

### Database Indexing

Check `packages/database/prisma/schema/` for index definitions:

```prisma
model User {
  email String @unique
  @@index([emailVerified])
}
```

### Query Optimization

- Production mode disables query logging (configured in `packages/database/src/index.ts`)
- Connection pooling configured for Railway's infrastructure
- Idle timeout: 30 seconds
- Connection timeout: 10 seconds

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Railway CLI
        run: npm i -g @railway/cli
      - name: Deploy
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Prisma Railway Deployment Guide](https://www.prisma.io/docs/orm/prisma-client/deployment/traditional/deploy-to-railway)
- [Bun on Railway](https://railway.app/template/bun)
- [Prisma Migrate Production Guide](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)

## 🆘 Support

- Check Railway logs: `railway logs`
- Review Prisma migrations: `prisma migrate status`
- Database issues: `railway connect postgresql`
- Community help: [Railway Discord](https://discord.gg/railway)

---

**Built with ❤️ for Laura Herve's Artist Portfolio**
