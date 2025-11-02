# Contributing Guide

## Getting Started

### Prerequisites

- **Node.js 18+**
- **npm** or **yarn**
- **Git**
- **PostgreSQL 14+** (for local development)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/property-management-crm.git
   cd property-management-crm
   ```

2. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed  # Optional: seed with sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: New features (`feature/user-authentication`)
- **bugfix/**: Bug fixes (`bugfix/payment-validation`)
- **hotfix/**: Critical production fixes (`hotfix/security-patch`)

### Commit Guidelines

Follow [Conventional Commits](https://conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add OAuth2 authentication
fix(payments): resolve Stripe webhook validation
docs(api): update tenant endpoint documentation
test(units): add unit creation tests
```

### Code Style

#### Formatting

```bash
# Format all code
npm run format

# Check formatting
npm run format:check
```

#### Linting

```bash
# Lint all code
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Type Checking

```bash
# Check TypeScript types
npm run type-check
```

### Testing

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

**Testing Requirements:**
- Minimum **80% test coverage** for new code
- Unit tests for utilities and services
- Integration tests for API routes
- Component tests for UI components
- E2E tests for critical user flows

## Pull Request Process

### 1. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 2. Make Changes

- Follow the coding standards
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 4. Push to GitHub

```bash
git push origin feature/amazing-feature
```

### 5. Create Pull Request

- **Title**: Clear, concise description
- **Description**: Explain what and why (not how)
- **Template**: Use the provided PR template
- **Labels**: Add appropriate labels
- **Assignees**: Assign to relevant team members
- **Reviewers**: Request review from maintainers

### 6. Code Review

- Address all review comments
- Make requested changes
- Ensure CI checks pass
- Get approval from at least one maintainer

### 7. Merge

- Squash and merge to keep clean history
- Delete the feature branch
- Update related issues/tasks

## API Development

### Adding New Endpoints

1. **Create API route** in `app/api/`
2. **Add validation schemas** in `lib/validation/`
3. **Implement middleware** for auth, validation, rate limiting
4. **Add error handling** with proper error types
5. **Write tests** for the new endpoint
6. **Update API documentation**

### Database Changes

1. **Update Prisma schema** in `prisma/schema.prisma`
2. **Generate migration**: `npx prisma migrate dev --name "description"`
3. **Update TypeScript types** if needed
4. **Test changes** thoroughly

## Component Development

### Creating New Components

1. **Create component** in appropriate directory
2. **Use TypeScript** for type safety
3. **Follow accessibility** guidelines (WCAG 2.1 AA)
4. **Add proper styling** with Tailwind CSS
5. **Write component tests**
6. **Add to component library** if reusable

### UI Guidelines

- **shadcn/ui** components as base
- **Consistent spacing** and typography
- **Accessible color contrast**
- **Responsive design** for all screen sizes
- **Loading states** and error handling
- **Keyboard navigation** support

## Quality Assurance

### Code Quality Gates

- **ESLint**: No linting errors or warnings
- **Prettier**: Code properly formatted
- **TypeScript**: No type errors
- **Tests**: All tests passing with minimum coverage
- **Build**: Application builds successfully

### Performance Requirements

- **Lighthouse Score**: 90+ in all categories
- **Core Web Vitals**: All metrics in "Good" range
- **Bundle Size**: Keep JavaScript under 200KB gzipped
- **Image Optimization**: All images properly optimized
- **Database Queries**: No N+1 queries, proper indexing

### Security Requirements

- **No hardcoded secrets** in code
- **Input validation** on all user inputs
- **SQL injection prevention** with parameterized queries
- **XSS protection** with input sanitization
- **CSRF protection** for state-changing operations
- **Rate limiting** on API endpoints

## Documentation

### When to Update Documentation

- **New features**: API endpoints, UI components, configuration
- **Changed behavior**: Breaking changes, new requirements
- **Bug fixes**: If user-facing behavior changed
- **Configuration changes**: New environment variables, setup steps

### Documentation Structure

- **README.md**: Project overview and quick start
- **API_DOCUMENTATION.md**: Complete API reference
- **ARCHITECTURE.md**: System architecture and design decisions
- **DEPLOYMENT.md**: Deployment and configuration guide
- **SECURITY.md**: Security measures and compliance
- **CONTRIBUTING.md**: Development guidelines (this file)

## Issue Reporting

### Bug Reports

**Required Information:**
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

### Feature Requests

**Required Information:**
- **Description**: Clear description of the feature
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional Context**: Mockups, examples, etc.

## Community Guidelines

### Code of Conduct

- **Respectful communication** in all interactions
- **Constructive feedback** on contributions
- **Inclusive language** and behavior
- **No harassment** or discrimination
- **Professional conduct** in all communications

### Getting Help

1. **Check existing documentation** first
2. **Search GitHub issues** for similar problems
3. **Ask in GitHub Discussions** for questions
4. **Create GitHub issue** for bugs or feature requests
5. **Join our Discord** for real-time help

## Recognition

### Contributing Recognition

- **Contributors** listed in README
- **Code contributions** acknowledged in release notes
- **Bug reports** and **feature requests** valued
- **Documentation improvements** appreciated

### Hall of Fame

Contributors with significant impact on the project will be recognized in our Hall of Fame section.

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the original project.

---

**Thank you for contributing to Property Management CRM!** 🚀

Your contributions help make property management more efficient and accessible for everyone.