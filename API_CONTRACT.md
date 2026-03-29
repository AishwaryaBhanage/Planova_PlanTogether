# Planova API Contract

**Base URL:** `http://localhost:5000/api`

---

## Auth Endpoints

### POST /auth/register
**Request:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string (min 8 chars)"
}
```
**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "duoEnabled": false,
    "isActive": true,
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  },
  "accessToken": "JWT string",
  "refreshToken": "JWT string"
}
```
**Errors:** `400` validation, `409` email exists

---

### POST /auth/login
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response (200):** Same shape as register response
**Errors:** `401` invalid credentials

---

### POST /auth/refresh-token
**Request:**
```json
{
  "refreshToken": "string"
}
```
**Response (200):**
```json
{
  "accessToken": "JWT string"
}
```

---

### GET /auth/profile
**Headers:** `Authorization: Bearer <accessToken>`
**Response (200):** User object (same as in register, no password)
**Errors:** `401` unauthorized

---

## Error Format (all endpoints)
```json
{
  "message": "string",
  "errors": [{ "field": "string", "message": "string" }]
}
```

---

## Auth Notes
- Store `accessToken` and `refreshToken` in frontend
- Send `Authorization: Bearer <token>` on all protected routes
- When `accessToken` expires (1h), call `/auth/refresh-token`
- Duo 2FA will be added later as a step between login and token issuance
