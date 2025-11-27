   git clone <repository-url>
   cd property-management-system
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and optional API keys
   ```

3. **Run the application**:
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

Visit `http://localhost:3000` to access the application.

## Installation

Follow these steps for a complete setup:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd property-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration. See the [Environment Variables](#environment-variables) section below.

### 4. Database Setup
Choose your database:

**For PostgreSQL (Recommended for Production)**:
```bash
# Install PostgreSQL locally or use a cloud service
# Update DATABASE_URL in .env with your PostgreSQL connection string
```

**For SQLite (Development)**:
```bash
# SQLite is used by default in .env.example
# No additional setup required
```

### 5. Database Migration
```bash
npm run db:migrate
```

### 6. Seed Database
```bash
npm run db:seed
```

### 7. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Setup

### PostgreSQL Setup
1. Install PostgreSQL on your system or use a cloud service (AWS RDS, Google Cloud SQL, etc.)
2. Create a database for the application
3. Update `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/property_management"
   ```

### SQLite Setup (Development)
SQLite is configured by default for development:
```
DATABASE_URL="file:./dev.db"
```

No additional setup is required. The database file will be created automatically.

### Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Random secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Application URL (e.g., `http://localhost:3000` for development)

### Optional (for full functionality)
- `ANTHROPIC_API_KEY`: API key for AI features
- `STRIPE_SECRET_KEY`: Stripe secret key for payments
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `SENDGRID_API_KEY`: SendGrid API key for email
- `TWILIO_ACCOUNT_SID`: Twilio account SID for SMS
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `AWS_ACCESS_KEY_ID`: AWS access key for S3 storage
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_S3_BUCKET`: S3 bucket name
- `REDIS_URL`: Redis connection URL for caching

### Feature Flags
- `ENABLE_AI_FEATURES`: Enable/disable AI features (default: true)
- `ENABLE_BLOCKCHAIN`: Enable/disable blockchain features (default: false)
- `ENABLE_INTEGRATIONS`: Enable/disable third-party integrations (default: true)

See `.env.example` for all available options and detailed comments.

## Running the Application

### Development
```bash
npm run dev
```
Starts the development server with hot reloading at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```
Builds the application for production and starts the server.

### Other Commands
```bash
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript type checking
npm run test          # Run tests
npm run db:studio     # Open Prisma Studio
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Docker Deployment
```bash
# Build Docker image
docker build -t property-management .

# Run with environment variables
docker run -p 3000:3000 --env-file .env property-management