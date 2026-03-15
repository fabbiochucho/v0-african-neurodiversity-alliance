# ANDA Platform API Documentation

## Overview
Complete API reference for the ANDA NeuroCare platform. All endpoints require authentication unless noted otherwise.

## Authentication
All API endpoints require a valid Supabase JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
https://api.anda-platform.vercel.app/api
```

---

## IEP Management

### Create IEP
**Endpoint:** `POST /iep/create`

**Authentication:** Required

**Request Body:**
```json
{
  "learner_id": "uuid",
  "title": "string (required, max 200 chars)",
  "description": "string (optional)",
  "adaptive_goals": [
    {
      "text": "string",
      "domain": "communication|academic|social|motor|sensory|behavioral"
    }
  ],
  "custom_goals": [
    {
      "text": "string",
      "domain": "string (optional)"
    }
  ],
  "ai_summary": "string (optional)"
}
```

**Validation Rules:**
- `learner_id`: Must be valid UUID and belong to authenticated user
- `title`: Required, 1-200 characters
- `adaptive_goals` + `custom_goals`: Minimum 1, maximum 50 total
- Each goal: 1-500 characters

**Response (201 Created):**
```json
{
  "id": "uuid",
  "learner_id": "uuid",
  "created_by": "uuid",
  "title": "string",
  "description": "string",
  "status": "draft",
  "adaptive_goals": [],
  "custom_goals": [],
  "created_at": "2026-03-15T10:30:00Z",
  "updated_at": "2026-03-15T10:30:00Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` - Invalid input data
- `401 UNAUTHORIZED` - Missing/invalid authentication
- `403 LEARNER_NOT_FOUND` - Learner doesn't exist or access denied
- `500 DATABASE_ERROR` - Server error

**Example cURL:**
```bash
curl -X POST https://api.anda-platform.vercel.app/api/iep/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "learner_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Jane Doe - 2026 IEP",
    "description": "Annual IEP review",
    "adaptive_goals": [
      {"text": "Improve verbal communication", "domain": "communication"}
    ]
  }'
```

---

### Get IEP
**Endpoint:** `GET /iep/[id]`

**Parameters:**
- `id` (path): IEP UUID

**Response (200 OK):**
```json
{
  "id": "uuid",
  "learner_id": "uuid",
  "created_by": "uuid",
  "title": "string",
  "description": "string",
  "status": "draft|active|completed|archived",
  "adaptive_goals": [],
  "custom_goals": [],
  "ai_summary": "string",
  "created_at": "2026-03-15T10:30:00Z",
  "updated_at": "2026-03-15T10:30:00Z"
}
```

---

### Update IEP
**Endpoint:** `PUT /iep/[id]`

**Request Body:** (all fields optional)
```json
{
  "title": "string",
  "description": "string",
  "status": "draft|active|completed|archived",
  "adaptive_goals": [],
  "custom_goals": []
}
```

**Response (200 OK):** Updated IEP object

---

### Delete IEP
**Endpoint:** `DELETE /iep/[id]`

**Response (204 No Content)**

---

## Progress Tracking

### Log Progress
**Endpoint:** `POST /progress/log`

**Request Body:**
```json
{
  "goal_id": "uuid",
  "rating": 1|2|3|4|5,
  "notes": "string (optional, max 500 chars)"
}
```

**Validation Rules:**
- `goal_id`: Must be valid UUID
- `rating`: Required, must be 1-5 (1=needs improvement, 5=excellent)
- `notes`: Optional but cannot exceed 500 characters

**Response (201 Created):**
```json
{
  "id": "uuid",
  "goal_id": "uuid",
  "logged_by": "uuid",
  "rating": 3,
  "notes": "Good progress this week",
  "logged_date": "2026-03-15",
  "created_at": "2026-03-15T10:30:00Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` - Invalid rating or input
- `404 GOAL_NOT_FOUND` - Goal doesn't exist
- `403 ACCESS_DENIED` - User doesn't have access to this goal

---

### Get Goal Progress
**Endpoint:** `GET /progress/goal/[goalId]`

**Query Parameters:**
- `startDate` (optional): ISO date string (YYYY-MM-DD)
- `endDate` (optional): ISO date string (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "goal_id": "uuid",
  "goal_text": "string",
  "domain": "string",
  "total_entries": 10,
  "average_rating": 3.5,
  "trend": "improving|stable|declining",
  "entries": [
    {
      "id": "uuid",
      "rating": 4,
      "notes": "string",
      "logged_date": "2026-03-15"
    }
  ]
}
```

---

### Get Learner Progress Summary
**Endpoint:** `GET /progress/learner/[learnerId]`

**Response (200 OK):**
```json
{
  "learner_id": "uuid",
  "learner_name": "string",
  "total_goals": 12,
  "completed_goals": 3,
  "in_progress_goals": 9,
  "average_progress": 3.2,
  "domain_breakdown": {
    "communication": 3.5,
    "academic": 2.8,
    "social": 3.0,
    "motor": 3.1,
    "sensory": 2.9,
    "behavioral": 3.4
  },
  "recent_entries": []
}
```

---

## Reports

### Generate Report
**Endpoint:** `POST /reports/generate`

**Request Body:**
```json
{
  "learner_id": "uuid",
  "report_type": "monthly|quarterly|annual",
  "include_charts": true
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "learner_id": "uuid",
  "report_type": "monthly",
  "report_period": "2026-03",
  "content": "HTML report content",
  "pdf_url": "https://cdn.anda-platform.vercel.app/reports/xxx.pdf",
  "created_at": "2026-03-15T10:30:00Z"
}
```

---

### Send Report via Email
**Endpoint:** `POST /reports/send-email`

**Request Body:**
```json
{
  "report_id": "uuid",
  "recipient_email": "email@example.com",
  "message": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Report sent successfully",
  "sent_at": "2026-03-15T10:30:00Z"
}
```

---

## Payments

### Initialize Payment
**Endpoint:** `POST /payments/flutterwave/initialize`

**Request Body:**
```json
{
  "tier": "premium|pro|institutional",
  "duration_months": 1|3|12,
  "email": "user@example.com",
  "full_name": "string"
}
```

**Validation:**
- `tier`: Must be valid subscription tier
- `duration_months`: 1, 3, or 12
- `email`: Valid email format
- `full_name`: 2-100 characters

**Response (200 OK):**
```json
{
  "authorization_url": "https://checkout.flutterwave.com/pay/xxx",
  "transaction_id": "string",
  "amount": 50000,
  "currency": "NGN"
}
```

---

### Verify Payment
**Endpoint:** `GET /payments/flutterwave/verify?transaction_id=xxx`

**Response (200 OK):**
```json
{
  "success": true,
  "subscription_id": "uuid",
  "tier": "premium",
  "renewal_date": "2026-04-15",
  "status": "active"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable description",
  "details": {}
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Missing/invalid authentication
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `DATABASE_ERROR` - Server error
- `INVALID_JSON` - Malformed JSON

---

## Rate Limiting

All endpoints are rate limited to prevent abuse:
- Authenticated users: 100 requests per minute
- Per-endpoint: 30 requests per minute for create/update/delete
- Authentication endpoint: 5 attempts per minute

Headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1684927200
```

---

## Webhook Events (Coming Soon)

Subscribe to webhook events for real-time updates:
- `iep.created` - New IEP created
- `progress.logged` - New progress entry
- `report.generated` - Report ready
- `subscription.activated` - Subscription activated
- `subscription.expired` - Subscription expired

---

## Testing Your Integration

Use Postman collection: [Download](./ANDA_API.postman_collection.json)

Or use the test endpoints at `/test/*` during development.
