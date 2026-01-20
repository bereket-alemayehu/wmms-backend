# Database Seeding Guide

This guide explains how to seed your database with initial data for testing.

## What Gets Seeded

### 1. Offices (4 branches)
- **Bole Branch** - Addis Ababa
- **Kazanchis Branch** - Addis Ababa
- **Megenagna Branch** - Addis Ababa
- **Piassa Branch** - Addis Ababa

### 2. Users (12 total)

#### Customers (5 users)
- Abebe Kebede - `WMMS-CUST-100001`
- Tigist Haile - `WMMS-CUST-100002`
- Dawit Gebru - `WMMS-CUST-100003`
- Meron Tadesse - `WMMS-CUST-100004`
- Solomon Alemu - `WMMS-CUST-100005`

#### Technicians (4 users)
- Tech User One - `WMMS-TECH-000001` (Bole Branch)
- Tech User Two - `WMMS-TECH-000002` (Bole Branch)
- Tech User Three - `WMMS-TECH-000003` (Kazanchis Branch)
- Tech User Four - `WMMS-TECH-000004` (Megenagna Branch)

#### Supervisors (2 users)
- Supervisor One - `WMMS-SUP-000001` (Bole Branch)
- Supervisor Two - `WMMS-SUP-000002` (Kazanchis Branch)

#### Managers (1 user)
- Manager One - `WMMS-MAN-000001` (Bole Branch)

## Default Credentials

**Password for ALL users:** `Password123`

**Login Format:**
```json
{
  "serviceNumber": "WMMS-CUST-100001",
  "password": "Password123"
}
```

## How to Run Seeders

### Option 1: Seed Everything (Recommended)
```bash
pnpm run seed
```
or
```bash
npm run seed
```

This will:
1. Seed offices first
2. Then seed users (which depend on offices)

### Option 2: Seed Individually

**Seed offices only:**
```bash
pnpm run seed:offices
```

**Seed users only:**
```bash
pnpm run seed:users
```

**Note:** Users require offices to exist, so always seed offices first if running individually.

## Prerequisites

1. **MongoDB running** - Make sure your MongoDB database is running
2. **Environment variables** - Ensure `.env` file has:
   ```
   DATABASE=mongodb://localhost:27017/wmms
   ```
   (or your MongoDB connection string)

3. **Dependencies installed:**
   ```bash
   pnpm install
   ```

## What Happens When You Seed

### Offices Seeder
- ✅ Clears existing offices
- ✅ Creates 4 office branches
- ✅ Logs office IDs for reference

### Users Seeder
- ⚠️ **Does NOT clear existing users** (to prevent data loss)
- ✅ Checks for existing users by serviceNumber
- ✅ Only creates users that don't already exist
- ✅ Assigns staff users to offices
- ✅ Sets all users as `isRegistrationComplete: true`
- ✅ Logs all created user credentials

## Service Number Formats

| Role | Format | Example |
|------|--------|---------|
| Customer | `WMMS-CUST-XXXXXX` | `WMMS-CUST-100001` |
| Technician | `WMMS-TECH-XXXXXX` | `WMMS-TECH-000001` |
| Supervisor | `WMMS-SUP-XXXXXX` | `WMMS-SUP-000001` |
| Manager | `WMMS-MAN-XXXXXX` | `WMMS-MAN-000001` |

## Testing After Seeding

### 1. Login as Customer
```bash
POST /api/v1/auth/login
{
  "serviceNumber": "WMMS-CUST-100001",
  "password": "Password123"
}
```

### 2. Login as Technician
```bash
POST /api/v1/auth/login
{
  "serviceNumber": "WMMS-TECH-000001",
  "password": "Password123"
}
```

### 3. Login as Supervisor
```bash
POST /api/v1/auth/login
{
  "serviceNumber": "WMMS-SUP-000001",
  "password": "Password123"
}
```

### 4. Login as Manager
```bash
POST /api/v1/auth/login
{
  "serviceNumber": "WMMS-MAN-000001",
  "password": "Password123"
}
```

## Creating Additional Users

### Via API (Manager Only)

**Endpoint:** `POST /api/v1/users`

**Request Body:**
```json
{
  "fullName": "New User",
  "phoneNumber": "+251911111111",
  "email": "newuser@example.com",
  "serviceNumber": "WMMS-CUST-100006",
  "role": "customer",
  "password": "Password123",
  "passwordConfirm": "Password123"
}
```

**For Staff Users (Technician/Supervisor/Manager):**
```json
{
  "fullName": "New Technician",
  "phoneNumber": "+251922222222",
  "email": "tech@example.com",
  "serviceNumber": "WMMS-TECH-000005",
  "role": "technician",
  "officeId": "507f1f77bcf86cd799439012",
  "password": "Password123",
  "passwordConfirm": "Password123"
}
```

### Via Seeder (Modify seeder file)

Edit `src/seeders/user.seeder.ts` and add users to the appropriate arrays (customers, technicians, supervisors, or managers).

## Troubleshooting

### Error: "No offices found"
**Solution:** Run `pnpm run seed:offices` first, then `pnpm run seed:users`

### Error: "Service number already exists"
**Solution:** The user already exists. The seeder skips existing users automatically.

### Error: "MongoDB connection error"
**Solution:** 
1. Check MongoDB is running
2. Verify DATABASE connection string in `.env`
3. Check network connectivity

### Users not created
**Solution:** Check console output - seeder logs which users were created and which were skipped.

## Resetting Database

⚠️ **Warning:** This will delete ALL data!

```bash
# Connect to MongoDB shell
mongosh

# Select database
use wmms

# Delete all collections
db.users.deleteMany({})
db.offices.deleteMany({})
db.tickets.deleteMany({})
db.outages.deleteMany({})
db.refunds.deleteMany({})

# Exit
exit
```

Then run seeders again:
```bash
pnpm run seed
```

## Next Steps

After seeding:
1. ✅ Test login with different user roles
2. ✅ Create tickets as customers
3. ✅ Assign tickets as supervisors
4. ✅ Update ticket status as technicians
5. ✅ Create outages as technicians/supervisors
6. ✅ Test all endpoints from TESTING_GUIDE.md

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm run seed` | Seed everything (offices + users) |
| `pnpm run seed:offices` | Seed offices only |
| `pnpm run seed:users` | Seed users only |

**Default Password:** `Password123` (for all users)



