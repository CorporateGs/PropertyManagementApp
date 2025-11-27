model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?  // Single name field
  // ... other fields
}
```

**After:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String?  // New field
  lastName  String?  // New field
  name      String?  // Kept for backward compatibility (optional)
  // ... other fields
}
```

**Migration Strategy:**
- Added `firstName` and `lastName` fields
- Kept `name` field for backward compatibility during transition
- Existing data will be migrated using the provided SQL script

### 2. Tenant Model Changes

**Before:**
```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String   // Single name field
  // ... other fields
}
```

**After:**
```prisma
model Tenant {
  id        String   @id @default(cuid())
  firstName String   // Required field
  lastName  String   // Required field
  // ... other fields
}
```

**Migration Strategy:**
- Replaced `name` field with `firstName` and `lastName` fields
- Both fields are required (non-nullable)
- Existing tenant data must be migrated

## Migration Steps

### Prerequisites

1. **Backup your database** before proceeding:
   ```bash
   # For SQLite
   cp database.db database_backup.db
   
   # For PostgreSQL
   pg_dump property_management > backup.sql
   ```

2. **Stop the application** to prevent data inconsistencies during migration

3. **Install dependencies** if not already installed:
   ```bash
   npm install
   ```

### Step 1: Update Prisma Schema

Apply the schema changes to `prisma/schema.prisma`:

```diff
model User {
  id        String   @id @default(cuid())
  email     String   @unique
+ firstName String?
+ lastName  String?
  name      String?  // Keep for backward compatibility
  // ... rest of model
}

model Tenant {
  id        String   @id @default(cuid())
- name      String
+ firstName String
+ lastName  String
  // ... rest of model
}
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Run Database Migration

```bash
npx prisma migrate dev --name add-firstname-lastname-fields
```

### Step 4: Migrate Existing Data

Run the following SQL script to split existing name fields:

```sql
-- Migrate User data
UPDATE "User" 
SET "firstName" = SUBSTRING_INDEX(name, ' ', 1),
    "lastName" = SUBSTRING_INDEX(name, ' ', -1)
WHERE "firstName" IS NULL AND name IS NOT NULL;

-- Migrate Tenant data
UPDATE "Tenant"
SET "firstName" = SUBSTRING_INDEX(name, ' ', 1),
    "lastName" = SUBSTRING_INDEX(name, ' ', -1)
WHERE "firstName" IS NULL AND name IS NOT NULL;
```

**Note:** If using PostgreSQL, replace `SUBSTRING_INDEX` with appropriate PostgreSQL string functions:

```sql
-- PostgreSQL version
UPDATE "User" 
SET "firstName" = SPLIT_PART(name, ' ', 1),
    "lastName" = SPLIT_PART(name, ' ', 2)
WHERE "firstName" IS NULL AND name IS NOT NULL;

UPDATE "Tenant"
SET "firstName" = SPLIT_PART(name, ' ', 1),
    "lastName" = SPLIT_PART(name, ' ', 2)
WHERE "firstName" IS NULL AND name IS NOT NULL;
```

### Step 5: Update Application Code

1. **Update seed scripts** (`scripts/seed.ts`, `scripts/seed-tenants.ts`, `app/api/seed-tenants/route.ts`):
   - Replace `name: "..."` with `firstName: "...", lastName: "..."`

2. **Update API routes** that create users/tenants:
   - Ensure they use `firstName`/`lastName` instead of `name`

3. **Update frontend components**:
   - Replace references to `user.name` with `user.firstName + ' ' + user.lastName`
   - Update form inputs to separate first/last name fields

4. **Update authentication** (`lib/auth.ts`):
   - Remove `as any` type assertions for `firstName`/`lastName`

### Step 6: Test the Migration

Run the testing checklist below to ensure everything works correctly.

### Step 7: Clean Up (Optional)

After confirming everything works, you can remove the deprecated `name` field:

```diff
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String?
  lastName  String?
- name      String?  // Remove after migration
  // ... rest of model
}
```

Then run another migration:
```bash
npx prisma migrate dev --name remove-deprecated-name-field
```

## Rollback Instructions

If you need to rollback the migration:

### Step 1: Restore Database Backup

```bash
# For SQLite
cp database_backup.db database.db

# For PostgreSQL
psql property_management < backup.sql
```

### Step 2: Revert Schema Changes

Revert `prisma/schema.prisma` to the previous version:

```diff
model User {
  id        String   @id @default(cuid())
  email     String   @unique
- firstName String?
- lastName  String?
  name      String?
  // ... rest of model
}

model Tenant {
  id        String   @id @default(cuid())
+ name      String
- firstName String
- lastName  String
  // ... rest of model
}
```

### Step 3: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 4: Revert Application Code

Revert all the application code changes made in Step 5 above.

## Breaking Changes

### API Response Format Changes

**User API responses** now include:
```json
{
  "id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

Instead of:
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Tenant API responses** now include:
```json
{
  "id": "tenant_id",
  "firstName": "Jane",
  "lastName": "Smith"
}