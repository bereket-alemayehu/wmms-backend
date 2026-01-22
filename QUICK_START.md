# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Seed Your Database

Run the seeder to create all necessary test data:

```bash
cd wmms-backend
pnpm run seed
```

**This creates:**
- ✅ 4 Offices (Bole, Kazanchis, Megenagna, Piassa)
- ✅ 5 Customers
- ✅ 4 Technicians  
- ✅ 2 Supervisors
- ✅ 1 Manager

**Default Password:** `Password123` (for all users)

---

### Step 2: Start Your Server

```bash
pnpm run dev
```

Server will start on `http://localhost:3001` (or your configured PORT)

---

### Step 3: Test the API

#### Option A: Swagger UI (Recommended)
1. Open browser: `http://localhost:3001/api-docs`
2. Click "Authorize" button
3. Login first to get token:
   - `POST /api/v1/auth/login`
   - Body: `{ "serviceNumber": "WMMS-CUST-100001", "password": "Password123" }`
4. Copy the `accessToken` from response
5. Click "Authorize" in Swagger UI
6. Enter: `Bearer <your-token>`
7. Test endpoints!

#### Option B: Postman/HTTP Client
- Use the examples from `TESTING_GUIDE.md`

---

## 📋 Quick Reference

### User Credentials

| Role | Service Number | Password |
|------|---------------|----------|
| Customer | `WMMS-CUST-100001` | `Password123` |
| Technician | `WMMS-TECH-000001` | `Password123` |
| Supervisor | `WMMS-SUP-000001` | `Password123` |
| Manager | `WMMS-MAN-000001` | `Password123` |

### Available Commands

```bash
# Seed everything
pnpm run seed

# Seed offices only
pnpm run seed:offices

# Seed users only  
pnpm run seed:users

# Start dev server
pnpm run dev

# Build for production
pnpm run build
```

---

## 📚 Documentation

- **`SEEDING_GUIDE.md`** - Complete guide on database seeding
- **`TESTING_GUIDE.md`** - Complete API testing guide with all endpoints
- **Swagger UI** - Interactive API documentation at `/api-docs`

---

## 🎯 Test Scenarios

### 1. Create a Ticket (as Customer)
```bash
POST /api/v1/tickets
Authorization: Bearer <customer-token>
Body: {
  "customerId": "<customer-id>",
  "officeId": "<office-id>",
  "category": "No Connection",
  "description": "Internet is down"
}
```

### 2. Assign Ticket (as Supervisor)
```bash
PATCH /api/v1/tickets/:id/assign
Authorization: Bearer <supervisor-token>
Body: {
  "technicianId": "<technician-id>"
}
```

### 3. Update Status (as Technician)
```bash
PATCH /api/v1/tickets/:id/status
Authorization: Bearer <technician-token>
Body: {
  "status": "In Progress"
}
```

### 4. Create Outage (as Technician)
```bash
POST /api/v1/outages
Authorization: Bearer <technician-token>
Body: {
  "officeId": "<office-id>",
  "title": "Fiber Cut",
  "message": "Major outage affecting area",
  "affectedAreas": ["Bole", "Kazanchis"]
}
```

---

## ⚠️ Troubleshooting

**Database empty?**
→ Run `pnpm run seed`

**Can't login?**
→ Check service number format: `WMMS-CUST-100001` (uppercase)
→ Password: `Password123`

**No offices?**
→ Run `pnpm run seed:offices` first

**Port already in use?**
→ Change PORT in `.env` file

---

## 🎉 You're Ready!

Now you can test all ticket and outage endpoints. See `TESTING_GUIDE.md` for complete documentation.



