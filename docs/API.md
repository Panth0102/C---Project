# API Reference

Base URL (local): `http://localhost:8000`  
Base URL (production): set via `VITE_API_BASE_URL` / `FRONTEND_URL`

Interactive Swagger UI: `GET /docs`  
ReDoc: `GET /redoc`  
OpenAPI JSON: `GET /openapi.json`

---

## Root & Health

### `GET /`
Returns a welcome message and environment info.

**Response 200**
```json
{
  "message": "Welcome to FullStack API",
  "version": "1.0.0",
  "environment": "development",
  "docs": "/docs"
}
```

### `GET /health`
Used by Render (and load balancers) to confirm the service is alive.

**Response 200**
```json
{ "status": "healthy", "version": "1.0.0" }
```

---

## Items — `/api/v1/items`

All datetime fields are ISO-8601 UTC strings.

### Item object
```json
{
  "id": 1,
  "title": "My item",
  "description": "Optional description",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### `GET /api/v1/items/`
Returns a list of all items.

**Query parameters**

| Name  | Type    | Default | Description              |
|-------|---------|---------|--------------------------|
| skip  | integer | 0       | Records to skip          |
| limit | integer | 100     | Maximum records returned |

**Response 200** — array of Item objects.

---

### `POST /api/v1/items/`
Creates a new item.

**Request body**
```json
{
  "title": "Required string (1–255 chars)",
  "description": "Optional string",
  "is_active": true
}
```

**Response 201** — the created Item object.  
**Response 422** — validation error (missing title, etc.).

---

### `GET /api/v1/items/{id}`
Returns a single item.

**Response 200** — Item object.  
**Response 404** — item not found.

---

### `PUT /api/v1/items/{id}`
Updates an item. All fields are optional (partial update).

**Request body**
```json
{
  "title": "New title",
  "description": "New description",
  "is_active": false
}
```

**Response 200** — updated Item object.  
**Response 404** — item not found.

---

### `DELETE /api/v1/items/{id}`
Deletes an item and returns the deleted record.

**Response 200** — deleted Item object.  
**Response 404** — item not found.

---

## Error format

FastAPI returns errors in this shape:

```json
{ "detail": "Human-readable message" }
```

Validation errors (422) return an array:
```json
{
  "detail": [
    { "loc": ["body", "title"], "msg": "Field required", "type": "missing" }
  ]
}
```
