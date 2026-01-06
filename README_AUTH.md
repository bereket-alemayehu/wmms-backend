# WMMS Backend - Authentication & Authorization

Enterprise-grade authentication and authorization system for the Wi-Fi Maintenance Management System.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your JWT secrets
   ```

3. **Start server:**
   ```bash
   pnpm run dev
   ```

## 🔐 Key Features

- ✅ ServiceNumber-based authentication
- ✅ BCrypt password hashing
- ✅ JWT access & refresh tokens
- ✅ Role-based access control (Customer, Technician, Supervisor, Manager)
- ✅ Account lockout after failed attempts
- ✅ Rate limiting on auth endpoints
- ✅ Secure HTTP-only cookies

## 📖 API Documentation

See [walkthrough.md](./.gemini/antigravity/brain/a567aa5d-a834-4b17-b662-b863ea4a9fa9/walkthrough.md) for complete API documentation and examples.

### Authentication Endpoints

- `POST /api/v1/auth/signup` - Customer registration
- `POST /api/v1/auth/login` - Login (all roles)
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/update-password` - Change password

### Protected Resources

All resource endpoints (`/users`, `/offices`, `/outages`, `/refunds`) now require authentication and enforce role-based permissions.

## 🔑 Environment Variables

Required in `.env`:

```bash
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
```

## 📝 Service Number Format

- Customers: `WMMS-CUST-100234`
- Technicians: `WMMS-TECH-033`
- Supervisors: `WMMS-SUP-012`
- Managers: `WMMS-MAN-001`

## 🧪 Testing

```bash
# Build
pnpm run build

# Run tests (if implemented)
pnpm test

# Start development server
pnpm run dev
```

## 📚 Documentation

- [Implementation Plan](./. gemini/antigravity/brain/a567aa5d-a834-4b17-b662-b863ea4a9fa9/implementation_plan.md)
- [Walkthrough Guide](./.gemini/antigravity/brain/a567aa5d-a834-4b17-b662-b863ea4a9fa9/walkthrough.md)

## 🛡️ Security

- Passwords hashed with BCrypt (cost: 12)
- JWT tokens with expiration
- Account lockout after 5 failed attempts
- Rate limiting on sensitive endpoints
- HTTPS-only cookies in production
- CSRF protection with SameSite cookies

---

Built with Express.js, TypeScript, MongoDB, and JWT
