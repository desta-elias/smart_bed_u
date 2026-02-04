# Bed Management System API Documentation

## Overview

The Bed Management System allows doctors and nurses to control smart hospital beds with 4 motors (HEAD, RIGHT_TILT, LEFT_TILT, LEG). All bed movements are logged in the database with full history tracking.

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
http://localhost:3000
```

---

## Bed Management Endpoints

### 1. Create a New Bed

**POST** `/beds`

Create a new bed in the system.

**Request Body:**
```json
{
  "bedNumber": "BED-101",
  "room": "ICU-1",
  "status": "AVAILABLE",
  "notes": "New bed installed"
}
```

**Response:**
```json
{
  "id": 1,
  "bedNumber": "BED-101",
  "room": "ICU-1",
  "status": "AVAILABLE",
  "notes": "New bed installed",
  "headPosition": 0,
  "rightTiltPosition": 0,
  "leftTiltPosition": 0,
  "legPosition": 0,
  "emergencyStop": false,
  "currentPatient": null,
  "createdAt": "2026-01-31T10:00:00.000Z",
  "updatedAt": "2026-01-31T10:00:00.000Z"
}
```

---

### 2. Get All Beds

**GET** `/beds`

Retrieve all beds with their current status and assigned patients.

**Response:**
```json
[
  {
    "id": 1,
    "bedNumber": "BED-101",
    "room": "ICU-1",
    "status": "OCCUPIED",
    "currentPatient": {
      "id": "uuid-here",
      "name": "John Doe",
      "condition": "Post-surgery"
    },
    "headPosition": 30,
    "rightTiltPosition": 0,
    "leftTiltPosition": 0,
    "legPosition": 15,
    "emergencyStop": false
  }
]
```

---

### 3. Get Available Beds

**GET** `/beds/available`

Get all beds that are currently available for patient assignment.

---

### 4. Get Single Bed

**GET** `/beds/:id`

Get details of a specific bed by ID.

---

### 5. Update Bed

**PATCH** `/beds/:id`

Update bed details (status, room, notes, etc.).

**Request Body:**
```json
{
  "status": "MAINTENANCE",
  "notes": "Scheduled maintenance"
}
```

---

### 6. Delete Bed

**DELETE** `/beds/:id`

Delete a bed (only if not occupied).

---

### 7. Assign Bed to Patient

**POST** `/beds/assign`

Assign a bed to a patient.

**Request Body:**
```json
{
  "patientId": "uuid-of-patient",
  "bedNumber": "BED-101"
}
```

**Response:**
```json
{
  "id": 1,
  "bedNumber": "BED-101",
  "status": "OCCUPIED",
  "currentPatient": {
    "id": "uuid-of-patient",
    "name": "John Doe"
  }
}
```

---

### 8. Unassign Bed

**POST** `/beds/:id/unassign`

Remove patient from bed and mark it as available.

---

## Bed Control Endpoints

### 9. Manual Control

**POST** `/beds/:id/manual-control`

Manually control a bed motor.

**Request Body:**
```json
{
  "motorType": "HEAD",
  "direction": "UP",
  "duration": 5,
  "notes": "Adjusting for patient comfort"
}
```

**Motor Types:**
- `HEAD` - Head section
- `RIGHT_TILT` - Right side tilt
- `LEFT_TILT` - Left side tilt
- `LEG` - Leg section

**Directions:**
- `UP` - Extend/Raise
- `DOWN` - Retract/Lower

**Duration:** 1-60 seconds

**Response:**
```json
{
  "bed": {
    "id": 1,
    "bedNumber": "BED-101",
    "headPosition": 40
  },
  "history": {
    "id": 123,
    "movementType": "MANUAL",
    "motorType": "HEAD",
    "direction": "UP",
    "duration": 5,
    "previousPosition": 30,
    "newPosition": 40,
    "timestamp": "2026-01-31T10:05:00.000Z"
  }
}
```

---

### 10. Schedule Movement

**POST** `/beds/:id/schedule-movement`

Schedule a bed movement for a specific time.

**Request Body (ISO 8601 format):**
```json
{
  "motorType": "LEG",
  "direction": "UP",
  "duration": 10,
  "scheduledFor": "2026-01-31T14:30:00.000Z",
  "notes": "Scheduled leg elevation"
}
```

**Request Body (Time-only format for today):**
```json
{
  "motorType": "LEG",
  "direction": "UP",
  "duration": 10,
  "scheduledFor": "14:30:00",
  "notes": "Scheduled leg elevation"
}
```

**Response:**
```json
{
  "id": 456,
  "bedId": 1,
  "movementType": "SCHEDULED",
  "motorType": "LEG",
  "direction": "UP",
  "duration": 10,
  "scheduledFor": "2026-01-31T14:30:00.000Z",
  "executed": false,
  "notes": "Scheduled leg elevation"
}
```

---

### 11. Emergency Stop

**POST** `/beds/:id/emergency-stop`

Immediately stop all bed movements and prevent further movements until reset.

**Response:**
```json
{
  "id": 1,
  "bedNumber": "BED-101",
  "emergencyStop": true,
  "message": "Emergency stop activated"
}
```

---

### 12. Reset Emergency Stop

**POST** `/beds/:id/reset-emergency-stop`

Reset emergency stop to allow bed movements again.

---

### 13. Get Bed History

**GET** `/beds/:id/history?limit=50`

Get movement history for a specific bed.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50)

**Response:**
```json
[
  {
    "id": 123,
    "bedId": 1,
    "movementType": "MANUAL",
    "motorType": "HEAD",
    "direction": "UP",
    "duration": 5,
    "previousPosition": 30,
    "newPosition": 40,
    "executed": true,
    "user": {
      "id": 1,
      "username": "dr_smith",
      "email": "smith@hospital.com"
    },
    "patient": {
      "id": "uuid",
      "name": "John Doe"
    },
    "timestamp": "2026-01-31T10:05:00.000Z",
    "notes": "Adjusting for patient comfort"
  }
]
```

---

### 14. Get Scheduled Movements

**GET** `/beds/scheduled-movements?bedId=1`

Get all pending scheduled movements.

**Query Parameters:**
- `bedId` (optional): Filter by specific bed

---

## Patient Integration

When creating a patient with a bed assignment, the system automatically:
1. Creates the patient record
2. Assigns the bed to the patient
3. Updates bed status to "OCCUPIED"
4. Links patient to bed in the system

**Example: Create Patient with Bed**

**POST** `/patients`

```json
{
  "name": "John Doe",
  "bed": "BED-101",
  "room": "ICU-1",
  "condition": "Post-surgery",
  "age": 45,
  "gender": "Male",
  "admitted": "2026-01-31"
}
```

---

## Movement History Tracking

Every bed movement is automatically logged with:
- **Bed ID**: Which bed was moved
- **User ID**: Who performed the action (doctor/nurse)
- **Patient ID**: Which patient was in the bed
- **Movement Type**: MANUAL, SCHEDULED, or EMERGENCY_STOP
- **Motor Details**: Which motor, direction, duration
- **Position Changes**: Previous and new positions
- **Timestamp**: When it occurred
- **Execution Status**: Whether scheduled movement was executed
- **Notes**: Additional context

This provides complete audit trail for:
- Medical record keeping
- Quality assurance
- Troubleshooting
- Compliance requirements

---

## Scheduled Movement Execution

The system automatically executes scheduled movements using a cron job that runs every 10 seconds. When a scheduled movement's time arrives:

1. System checks if bed is in emergency stop mode (if yes, skips)
2. Executes the movement
3. Updates motor positions
4. Marks the scheduled movement as executed
5. Logs the complete movement in history

---

## Error Handling

Common error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Bed is in emergency stop mode",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Bed not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Bed number already exists",
  "error": "Conflict"
}
```

---

## Position System

Each motor tracks position on a 0-100 scale:
- **0**: Fully retracted/lowered
- **100**: Fully extended/raised
- **Movement calculation**: ~10 units per second

Example: 5 seconds UP from position 30 = new position 80 (30 + 50)

---

## Best Practices

1. **Always check bed status** before manual control
2. **Use emergency stop** when needed - it's there for safety
3. **Add meaningful notes** to movements for medical records
4. **Monitor scheduled movements** to ensure they execute as planned
5. **Review bed history** regularly for quality assurance
6. **Reset emergency stop** only after verifying bed is safe to operate

---

## Testing the API

You can test using curl, Postman, or any HTTP client:

```bash
# Get all beds
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/beds

# Manual control
curl -X POST http://localhost:3000/beds/1/manual-control \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "motorType": "HEAD",
    "direction": "UP",
    "duration": 5
  }'

# Emergency stop
curl -X POST http://localhost:3000/beds/1/emergency-stop \
  -H "Authorization: Bearer YOUR_TOKEN"
```
