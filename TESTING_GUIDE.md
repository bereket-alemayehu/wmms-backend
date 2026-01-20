# Ticket & Outage API Testing Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Authentication Setup](#authentication-setup)
3. [Testing Tools](#testing-tools)
4. [Ticket Endpoints](#ticket-endpoints)
5. [Outage Endpoints](#outage-endpoints)
6. [Testing Scenarios](#testing-scenarios)

---

## Prerequisites

### 1. Environment Setup

- ✅ Server running on `http://localhost:3001` (or your configured PORT)
- ✅ MongoDB database connected
- ✅ Environment variables configured (`.env` file)

### 2. Required Data in Database

Before testing, ensure you have:

**Users with different roles:**

- At least 1 **Customer** user
- At least 1 **Technician** user
- At least 1 **Supervisor** user
- At least 1 **Manager** user

**Office:**

- At least 1 Office record (for linking tickets/outages)

**🚀 Quick Setup: Use Database Seeders**

If your database is empty, run the seeders to create all necessary data:

```bash
cd wmms-backend
pnpm run seed
```

This will create:

- ✅ 4 Offices (Bole, Kazanchis, Megenagna, Piassa branches)
- ✅ 5 Customers
- ✅ 4 Technicians
- ✅ 2 Supervisors
- ✅ 1 Manager

**Default password for all users:** `Password123`

See `SEEDING_GUIDE.md` for detailed information about seeded data and how to create additional users.

### 3. User Roles & Permissions

| Role           | Ticket Permissions                                          | Outage Permissions               |
| -------------- | ----------------------------------------------------------- | -------------------------------- |
| **Customer**   | Create, View own tickets, Request refund, Submit feedback   | View all outages                 |
| **Technician** | View assigned tickets, Update status, View all tickets      | Create, View all outages         |
| **Supervisor** | All technician permissions + Assign tickets, Update tickets | Create, View, Update outages     |
| **Manager**    | All permissions + Delete tickets                            | All permissions + Delete outages |

---

## Authentication Setup

### Step 1: Login to Get JWT Token

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "serviceNumber": "WMMS-CUST-100234",
  "password": "YourPassword123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Logged in successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "serviceNumber": "WMMS-CUST-100234",
      "role": "customer"
    }
  }
}
```

**Save the `accessToken`** - you'll need it for all subsequent requests.

### Step 2: Use Token in Requests

Add to request headers:

```
Authorization: Bearer <your-access-token>
```

---

## Testing Tools

### Option 1: Swagger UI (Recommended)

1. Start your server: `pnpm run dev`
2. Open browser: `http://localhost:3001/api-docs`
3. Click "Authorize" button
4. Enter: `Bearer <your-token>`
5. Click "Authorize"
6. Test endpoints directly in Swagger UI

### Option 2: Postman

- Import the endpoints
- Set Authorization header: `Bearer <token>`
- Test each endpoint

### Option 3: cURL / HTTP Client

- Include header: `-H "Authorization: Bearer <token>"`

---

## Ticket Endpoints

### 1. Create Ticket (Customer)

**Endpoint:** `POST /api/v1/tickets`

**Required Role:** Customer (or any authenticated user)

**Request Body:**

```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "officeId": "507f1f77bcf86cd799439012",
  "category": "No Connection",
  "description": "Internet connection has been down for 2 days"
}
```

**Valid Categories:**

- `"Speed Issue"`
- `"No Connection"`
- `"Hardware Fault"`
- `"Other"`

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439013",
      "customerId": "507f1f77bcf86cd799439011",
      "officeId": "507f1f77bcf86cd799439012",
      "category": "No Connection",
      "description": "Internet connection has been down for 2 days",
      "status": "Pending",
      "refundEligible": false,
      "refundRequested": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Save the ticket `_id`** for subsequent tests.

---

### 2. Get All Tickets

**Endpoint:** `GET /api/v1/tickets`

**Required Role:** Supervisor, Manager, or Technician

**Query Parameters (Optional):**

- `status`: Filter by status (Pending, Assigned, In Progress, Resolved, Closed)
- `category`: Filter by category
- `officeId`: Filter by office
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example:**

```
GET /api/v1/tickets?status=Pending&page=1&limit=10
```

**Response (200):**

```json
{
  "status": "success",
  "results": 10,
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "customerId": { "fullName": "John Doe", ... },
        "officeId": { "name": "Bole Office", ... },
        "category": "No Connection",
        "status": "Pending",
        ...
      }
    ]
  }
}
```

---

### 3. Get Single Ticket

**Endpoint:** `GET /api/v1/tickets/:id`

**Required Role:** Any authenticated user

**Example:**

```
GET /api/v1/tickets/507f1f77bcf86cd799439013
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439013",
      "customerId": { "fullName": "John Doe", ... },
      "officeId": { "name": "Bole Office", ... },
      "assignedTo": null,
      "category": "No Connection",
      "status": "Pending",
      ...
    }
  }
}
```

---

### 4. Get Queue Position

**Endpoint:** `GET /api/v1/tickets/:id/queue-position`

**Required Role:** Any authenticated user

**Example:**

```
GET /api/v1/tickets/507f1f77bcf86cd799439013/queue-position
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "ticketId": "507f1f77bcf86cd799439013",
    "queuePosition": 3
  }
}
```

---

### 5. Check Refund Eligibility

**Endpoint:** `GET /api/v1/tickets/:id/refund-eligibility`

**Required Role:** Any authenticated user

**Note:** Ticket must be unresolved for >7 days to be eligible.

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "ticketId": "507f1f77bcf86cd799439013",
    "refundEligible": true,
    "refundRequested": false
  }
}
```

---

### 6. Assign Ticket to Technician

**Endpoint:** `PATCH /api/v1/tickets/:id/assign`

**Required Role:** Supervisor or Manager

**Request Body:**

```json
{
  "technicianId": "507f1f77bcf86cd799439014"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "ticket": {
      "_id": "507f1f77bcf86cd799439013",
      "assignedTo": {
        "_id": "507f1f77bcf86cd799439014",
        "fullName": "Tech User",
        "phoneNumber": "+251912345678"
      },
      "status": "Assigned",
      ...
    }
  }
}
```

---

### 7. Update Ticket Status

**Endpoint:** `PATCH /api/v1/tickets/:id/status`

**Required Role:** Supervisor, Manager, or Technician

**Request Body:**

```json
{
  "status": "In Progress",
  "assignedTo": "507f1f77bcf86cd799439014"
}
```

**Valid Statuses:**

- `"Pending"`
- `"Assigned"`
- `"In Progress"`
- `"Resolved"`
- `"Closed"`

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "ticket": {
      "_id": "507f1f77bcf86cd799439013",
      "status": "In Progress",
      ...
    }
  }
}
```

---

### 8. Get Customer's Tickets

**Endpoint:** `GET /api/v1/tickets/customer/my-tickets`

**Required Role:** Customer (uses logged-in user's ID)

**Query Parameters (Optional):**

- `status`: Filter by status

**Example:**

```
GET /api/v1/tickets/customer/my-tickets?status=Pending
```

**Response (200):**

```json
{
  "status": "success",
  "results": 3,
  "data": {
    "tickets": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "category": "No Connection",
        "status": "Pending",
        "officeId": { "name": "Bole Office", ... },
        ...
      }
    ]
  }
}
```

---

### 9. Get Office Tickets

**Endpoint:** `GET /api/v1/tickets/office/:officeId/tickets`

**Required Role:** Any authenticated user

**Query Parameters (Optional):**

- `status`: Filter by status

**Example:**

```
GET /api/v1/tickets/office/507f1f77bcf86cd799439012/tickets?status=Assigned
```

**Response (200):**

```json
{
  "status": "success",
  "results": 5,
  "data": {
    "tickets": [...]
  }
}
```

---

### 10. Get Technician's Assigned Tickets

**Endpoint:** `GET /api/v1/tickets/technician/my-tickets`

**Required Role:** Technician (uses logged-in user's ID)

**Query Parameters (Optional):**

- `status`: Filter by status

**Response (200):**

```json
{
  "status": "success",
  "results": 2,
  "data": {
    "tickets": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "status": "Assigned",
        "assignedTo": { "fullName": "Tech User", ... },
        ...
      }
    ]
  }
}
```

---

### 11. Get Office Queue Statistics

**Endpoint:** `GET /api/v1/tickets/office/:officeId/statistics`

**Required Role:** Any authenticated user

**Example:**

```
GET /api/v1/tickets/office/507f1f77bcf86cd799439012/statistics
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "statistics": {
      "pending": 5,
      "assigned": 3,
      "inProgress": 2,
      "resolved": 10,
      "closed": 25,
      "total": 45
    }
  }
}
```

---

### 12. Submit Feedback

**Endpoint:** `POST /api/v1/tickets/:id/feedback`

**Required Role:** Any authenticated user

**Prerequisite:** Ticket must be in "Closed" status

**Request Body:**

```json
{
  "rating": 4,
  "feedbackComment": "Great service, issue resolved quickly"
}
```

**Rating:** Must be between 1 and 5

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "ticket": {
      "_id": "507f1f77bcf86cd799439013",
      "rating": 4,
      "feedbackComment": "Great service, issue resolved quickly",
      "status": "Closed",
      ...
    }
  }
}
```

---

### 13. Request Refund

**Endpoint:** `POST /api/v1/tickets/:id/request-refund`

**Required Role:** Any authenticated user

**Prerequisites:**

- Ticket must be `refundEligible: true` (>7 days unresolved)
- `refundRequested` must be `false`

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "ticket": {
      "_id": "507f1f77bcf86cd799439013",
      "refundEligible": true,
      "refundRequested": true,
      ...
    }
  }
}
```

**Error (400):** If ticket is not eligible or refund already requested

---

### 14. Update Ticket

**Endpoint:** `PATCH /api/v1/tickets/:id`

**Required Role:** Supervisor, Manager, or Technician

**Request Body (all fields optional):**

```json
{
  "category": "Hardware Fault",
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "data": {
      "_id": "507f1f77bcf86cd799439013",
      "category": "Hardware Fault",
      ...
    }
  }
}
```

---

### 15. Delete Ticket

**Endpoint:** `DELETE /api/v1/tickets/:id`

**Required Role:** Manager only

**Response (204):**

```json
{
  "status": "success",
  "data": null
}
```

---

## Outage Endpoints

### 1. Get All Outages

**Endpoint:** `GET /api/v1/outages`

**Required Role:** Any authenticated user

**Response (200):**

```json
{
  "status": "success",
  "results": 5,
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "officeId": { "name": "Bole Office", ... },
        "postedBy": { "fullName": "Supervisor Name", ... },
        "title": "Fiber Cut in Bole",
        "message": "Major fiber cut affecting multiple areas",
        "affectedAreas": ["Bole", "Kazanchis", "Megenagna"],
        "status": "Active",
        "estimatedResolution": "2024-01-15T18:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 2. Get Single Outage

**Endpoint:** `GET /api/v1/outages/:id`

**Required Role:** Any authenticated user

**Example:**

```
GET /api/v1/outages/507f1f77bcf86cd799439015
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Fiber Cut in Bole",
      "status": "Active",
      ...
    }
  }
}
```

---

### 3. Create Outage

**Endpoint:** `POST /api/v1/outages`

**Required Role:** Technician, Supervisor, or Manager

**Request Body:**

```json
{
  "officeId": "507f1f77bcf86cd799439012",
  "title": "Fiber Cut in Bole",
  "message": "Major fiber cut affecting multiple areas. Expected resolution in 4 hours.",
  "affectedAreas": ["Bole", "Kazanchis", "Megenagna"],
  "status": "Active",
  "estimatedResolution": "2024-01-15T18:00:00.000Z"
}
```

**Note:** `postedBy` is automatically set to the logged-in user

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439015",
      "officeId": "507f1f77bcf86cd799439012",
      "postedBy": "507f1f77bcf86cd799439016",
      "title": "Fiber Cut in Bole",
      "status": "Active",
      ...
    }
  }
}
```

---

### 4. Update Outage

**Endpoint:** `PATCH /api/v1/outages/:id`

**Required Role:** Supervisor or Manager

**Request Body (all fields optional):**

```json
{
  "status": "Resolved",
  "message": "Issue resolved. Service restored.",
  "estimatedResolution": null
}
```

**Valid Statuses:**

- `"Active"`
- `"Resolved"`

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "data": {
      "_id": "507f1f77bcf86cd799439015",
      "status": "Resolved",
      ...
    }
  }
}
```

---

### 5. Delete Outage

**Endpoint:** `DELETE /api/v1/outages/:id`

**Required Role:** Manager only

**Response (204):**

```json
{
  "status": "success",
  "data": null
}
```

---

## Testing Scenarios

### Scenario 1: Complete Ticket Lifecycle

1. **Customer creates ticket**

   - Login as Customer
   - `POST /api/v1/tickets` → Save ticket ID

2. **Check queue position**

   - `GET /api/v1/tickets/:id/queue-position`

3. **Supervisor assigns ticket**

   - Login as Supervisor
   - `PATCH /api/v1/tickets/:id/assign` with technicianId

4. **Technician updates status**

   - Login as Technician
   - `PATCH /api/v1/tickets/:id/status` → "In Progress"
   - `PATCH /api/v1/tickets/:id/status` → "Resolved"

5. **Supervisor closes ticket**

   - Login as Supervisor
   - `PATCH /api/v1/tickets/:id/status` → "Closed"

6. **Customer submits feedback**
   - Login as Customer
   - `POST /api/v1/tickets/:id/feedback`

---

### Scenario 2: Refund Request Flow

1. **Create ticket** (as Customer)
2. **Wait 7+ days** (or manually update `createdAt` in DB for testing)
3. **Check eligibility**
   - `GET /api/v1/tickets/:id/refund-eligibility`
4. **Request refund**
   - `POST /api/v1/tickets/:id/request-refund`

---

### Scenario 3: Outage Management

1. **Technician creates outage**

   - Login as Technician
   - `POST /api/v1/outages`

2. **All users view outages**

   - `GET /api/v1/outages` (any authenticated user)

3. **Supervisor updates outage**

   - Login as Supervisor
   - `PATCH /api/v1/outages/:id` → Update status to "Resolved"

4. **Manager deletes outage** (if needed)
   - Login as Manager
   - `DELETE /api/v1/outages/:id`

---

## Common Error Responses

### 401 Unauthorized

```json
{
  "status": "fail",
  "message": "You are not logged in. Please log in to access this resource"
}
```

**Solution:** Login and get a valid token

### 403 Forbidden

```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action"
}
```

**Solution:** Use a user with the required role

### 404 Not Found

```json
{
  "status": "fail",
  "message": "No document found with that ID"
}
```

**Solution:** Check the ID is correct and exists

### 400 Bad Request

```json
{
  "status": "fail",
  "message": "Validation error message"
}
```

**Solution:** Check request body matches required schema

---

## Quick Test Checklist

### Tickets

- [ ] Create ticket (Customer)
- [ ] Get all tickets (Supervisor/Manager/Technician)
- [ ] Get single ticket
- [ ] Get queue position
- [ ] Check refund eligibility
- [ ] Assign ticket (Supervisor/Manager)
- [ ] Update ticket status (Supervisor/Manager/Technician)
- [ ] Get customer's tickets
- [ ] Get office tickets
- [ ] Get technician's tickets
- [ ] Get office statistics
- [ ] Submit feedback (on closed ticket)
- [ ] Request refund (on eligible ticket)
- [ ] Update ticket
- [ ] Delete ticket (Manager)

### Outages

- [ ] Get all outages
- [ ] Get single outage
- [ ] Create outage (Technician/Supervisor/Manager)
- [ ] Update outage (Supervisor/Manager)
- [ ] Delete outage (Manager)

---

## Tips for Testing

1. **Use Swagger UI** - Easiest way to test with authentication
2. **Save IDs** - Keep track of created ticket/outage IDs
3. **Test Role Permissions** - Try accessing endpoints with different roles
4. **Test Error Cases** - Invalid IDs, missing fields, wrong status transitions
5. **Check Database** - Verify data is persisted correctly
6. **Test Edge Cases** - Empty arrays, null values, date formats

---

## Need Help?

- Check server logs for detailed error messages
- Verify MongoDB connection
- Ensure all required fields are provided
- Check user roles match endpoint requirements
- Verify JWT token is valid and not expired
