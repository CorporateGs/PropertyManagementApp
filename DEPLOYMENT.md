# Deployment Guide

## Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+**
- **Redis 7+** (optional, for caching)
- **Vercel Account** (recommended) or other hosting platform

## Environment Setup

### 1. Environment Variables

Copy the example environment file and configure your values:

```bash
cd app
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# Authentication
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="https://your-domain.com"

# AI Services
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Payment Processing
STRIPE_SECRET_KEY="sk_live_your-stripe-secret"
STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable"

# Communication
SMTP_HOST="smtp.gmail.com"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npm run db:seed
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- GitHub repository connected to Vercel

#### Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from your `.env` file

5. **Configure Database**
   - Use Vercel Postgres or external PostgreSQL
   - Update `DATABASE_URL` in environment variables

#### Automatic Deployments

Vercel will automatically deploy when you push to the `main` branch:

```bash
git push origin main
```

### Option 2: Docker Deployment

#### Production Docker Setup

1. **Build the image**
   ```bash
   docker build -f Dockerfile -t property-crm .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Or run standalone**
   ```bash
   docker run -d \
     --name property-crm \
     -p 3000:3000 \
     -e DATABASE_URL="your-database-url" \
     -e NEXTAUTH_SECRET="your-secret" \
     -e ANTHROPIC_API_KEY="your-api-key" \
     property-crm
   ```

### Option 3: Self-Hosted

#### Server Requirements
- **Node.js 18+**
- **PostgreSQL 14+**
- **Redis 7+** (recommended)
- **Nginx** (recommended for reverse proxy)

#### Deployment Steps

1. **Build the application**
   ```bash
   cd app
   npm run build
   ```

2. **Set up process manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "property-crm" -- run start:prod
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx (optional)**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

4. **Set up SSL with Certbot**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Database Migrations

### Production Migrations

**Never run `prisma migrate dev` in production!**

```bash
# Generate new migration (on development machine)
npx prisma migrate dev --name "add-user-preferences"

# Apply to production database
npx prisma migrate deploy
```

### Backup Strategy

```bash
# Create database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

## Monitoring Setup

### Health Checks

The application includes a health check endpoint:

```bash
curl https://your-domain.com/api/health
```

### Error Monitoring

1. **Set up Sentry** (recommended)
   ```env
   SENTRY_DSN="your-sentry-dsn"
   ```

2. **Configure error tracking**
   - Errors are automatically captured and sent to Sentry
   - Performance monitoring is included
   - Release tracking for debugging

### Performance Monitoring

1. **Core Web Vitals** are automatically tracked
2. **Database query performance** is logged
3. **API response times** are monitored
4. **External service calls** are tracked

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare

1. **Add your domain** to Cloudflare
2. **Enable SSL/TLS Encryption** (set to "Flexible" or "Full")
3. **Configure SSL settings**:
   - Minimum TLS Version: TLS 1.2
   - Automatic HTTPS Rewrites: On
   - Always Use HTTPS: On

## Security Hardening

### Production Security Checklist

- [ ] **Environment variables** are set correctly
- [ ] **Database credentials** are secure and not exposed
- [ ] **HTTPS** is enforced (no HTTP redirects)
- [ ] **Security headers** are properly configured
- [ ] **API keys** are stored securely
- [ ] **Database backups** are automated
- [ ] **Error monitoring** is set up
- [ ] **Rate limiting** is configured appropriately
- [ ] **CORS** is configured for your domain only
- [ ] **Session timeout** is set to reasonable duration

### Security Headers

The application automatically sets security headers:

- `Content-Security-Policy`: Prevents XSS attacks
- `X-Frame-Options: DENY`: Prevents clickjacking
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: Restricts browser features

## Performance Optimization

### Image Optimization

Images are automatically optimized using Next.js Image component:

```jsx
import Image from 'next/image';

<Image
  src="/images/property.jpg"
  alt="Property"
  width={800}
  height={600}
  priority
/>
```

### Database Optimization

1. **Connection Pooling**: Use PgBouncer for connection pooling
2. **Query Optimization**: Monitor slow queries with `logQuery` in logger
3. **Indexing**: Ensure proper indexes on frequently queried columns
4. **Caching**: Use Redis for frequently accessed data

### CDN Configuration

For global performance, configure CDN:

1. **Vercel**: Automatic global CDN included
2. **Cloudflare**: Add your domain to Cloudflare
3. **AWS CloudFront**: Use with S3 for file storage

## Backup Strategy

### Database Backups

```bash
# Automated daily backup
pg_dump $DATABASE_URL > /backup/daily_$(date +%Y%m%d).sql

# Weekly full backup
pg_dump -Fc $DATABASE_URL > /backup/weekly_$(date +%Y%m%d).sql
```

### File Storage Backups

```bash
# Backup uploaded files
aws s3 sync s3://your-bucket /backup/files/
```

### Configuration Backups

```bash
# Backup environment and configuration files
cp .env /backup/.env.$(date +%Y%m%d)
cp docker-compose.yml /backup/
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Test database connection
npx prisma db ping

# Check database logs
tail -f /var/log/postgresql/postgresql.log
```

#### Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Performance Issues

```bash
# Check database query performance
npm run db:studio

# Monitor API performance
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.com/api/health"
```

### Debug Mode

Enable debug logging in production:

```env
DEBUG="property-management:*"
NODE_ENV="production"
```

### Log Analysis

```bash
# View application logs
pm2 logs property-crm

# Filter error logs
pm2 logs property-crm --lines 100 --err
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use AWS ALB, Google Load Balancer, or similar
2. **Database**: Use connection pooling with PgBouncer
3. **Redis**: Use Redis Cluster for session storage
4. **File Storage**: Use CDN for global file distribution

### Vertical Scaling

1. **Server Resources**: Increase CPU/RAM as needed
2. **Database**: Optimize queries and add indexes
3. **Caching**: Implement Redis caching for frequently accessed data

## Rollback Procedures

### Application Rollback

```bash
# Deploy previous version
vercel rollback --prod

# Or redeploy specific commit
git checkout previous-commit
npm run build
vercel --prod
```

### Database Rollback

```bash
# Check available migrations
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back "migration-name"
```

## Support

For deployment issues:

- **Documentation**: Check this deployment guide
- **Community**: GitHub Discussions
- **Issues**: GitHub Issues for bugs
- **Email**: support@propertymanagement.com

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize database queries
- **Annually**: Security audit and penetration testing

### Update Procedures

1. **Test updates** in staging environment first
2. **Backup database** before major updates
3. **Update dependencies** gradually
4. **Monitor performance** after updates
5. **Rollback plan** ready for critical issues

---

**Remember**: Always test deployments in a staging environment before production!