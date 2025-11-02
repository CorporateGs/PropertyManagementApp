# Property Management CRM

A comprehensive, AI-powered property management system built with Next.js, TypeScript, and modern web technologies. This system provides end-to-end property management solutions including tenant screening, rent optimization, maintenance tracking, financial reporting, and automated workflows.

## 🚀 Features

### Core Features
- **Tenant Management**: Complete tenant lifecycle management with AI-powered screening
- **Payment Processing**: Integrated payment processing with Stripe and automated billing
- **Maintenance Tracking**: Smart maintenance request management with predictive analytics
- **Financial Reporting**: Comprehensive financial reports and analytics
- **Building Management**: Multi-building support with unit-level tracking
- **Document Management**: Secure file upload and storage with OCR capabilities

### AI-Powered Features
- **Intelligent Tenant Screening**: AI-powered risk assessment and fraud detection
- **Rent Optimization**: Market-based rent pricing recommendations
- **Predictive Maintenance**: Equipment failure prediction and preventive scheduling
- **AI Assistant**: Conversational AI for property management queries
- **Automated Workflows**: Smart automation for repetitive tasks

### Advanced Integrations
- **Payment Processors**: Stripe, PayPal integration
- **Communication**: Email (SendGrid), SMS (Twilio) integration
- **Accounting**: QuickBooks synchronization
- **Document Signing**: DocuSign integration
- **Blockchain**: Immutable lease and transaction recording

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **React Hook Form** - Form state management
- **Zustand** - State management
- **SWR** - Data fetching and caching

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **NextAuth.js** - Authentication and authorization

### AI & Automation
- **Anthropic Claude** - AI-powered analysis and chat
- **Node-Cron** - Scheduled task automation
- **Workflow Engine** - Custom automation framework

### DevOps & Quality
- **Vitest** - Unit and integration testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization

## 📋 Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+**
- **Redis 7+** (optional, for caching)
- **Stripe Account** (for payments)
- **Anthropic API Key** (for AI features)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-org/property-management-crm.git
cd property-management-crm
```

### 2. Install dependencies
```bash
cd app
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Set up the database
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Seed the database (optional)
```bash
npm run db:seed
```

### 6. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
property-management-crm/
├── app/                          # Next.js application
│   ├── app/                      # App Router pages
│   │   ├── api/                  # API routes
│   │   ├── auth/                 # Authentication pages
│   │   ├── tenants/             # Tenant management
│   │   ├── payments/            # Payment management
│   │   ├── maintenance/         # Maintenance tracking
│   │   └── ...                  # Other feature pages
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   ├── advanced/            # Complex feature components
│   │   └── ...                  # Other components
│   ├── lib/                     # Utility libraries
│   │   ├── middleware/          # API middleware
│   │   ├── services/            # Business logic services
│   │   ├── validation/          # Input validation schemas
│   │   └── ...                  # Other utilities
│   ├── prisma/                  # Database schema and migrations
│   └── __tests__/               # Test files
├── .github/                     # GitHub workflows
├── docs/                        # Documentation
└── README.md
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required and optional environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI Services
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Payment Processing
STRIPE_SECRET_KEY="sk_test_your-stripe-secret"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable"

# Communication
SMTP_HOST="smtp.gmail.com"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
```

### Database Setup

1. **Install PostgreSQL** and create a database
2. **Update DATABASE_URL** in `.env`
3. **Generate Prisma client**: `npx prisma generate`
4. **Run migrations**: `npx prisma migrate dev`
5. **Seed data** (optional): `npm run db:seed`

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🔨 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Format code
npm run format

# Check formatting
npm run format:check
```

### Database Management

```bash
# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset

# Generate new migration
npx prisma migrate dev --name feature-name
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Configure database** (Vercel Postgres or external)
4. **Deploy** automatically on push to main

### Docker

```bash
# Build and run with Docker Compose
docker-compose up

# Build for production
docker build -f Dockerfile -t property-crm .

# Run production container
docker run -p 3000:3000 property-crm
```

### Self-Hosted

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## 📊 Monitoring

- **Health Check**: `GET /api/health`
- **Error Tracking**: Integrated with Sentry (configure SENTRY_DSN)
- **Performance Monitoring**: Built-in performance tracking
- **Database Monitoring**: Prisma query performance logging

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- **TypeScript**: All code must be typed
- **Testing**: Minimum 80% test coverage
- **Linting**: Code must pass ESLint checks
- **Formatting**: Code must be formatted with Prettier
- **Documentation**: Update README for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/property-management-crm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/property-management-crm/discussions)

## 🔄 Updates

Stay updated with the latest features and security updates:

- **Release Notes**: [CHANGELOG.md](CHANGELOG.md)
- **Security Updates**: [SECURITY.md](SECURITY.md)
- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

**Built with ❤️ for modern property management**
