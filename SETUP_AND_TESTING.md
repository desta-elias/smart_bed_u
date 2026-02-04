# Setup and Testing Guide - Smart Bed Management System

## Prerequisites

- Node.js (v18 or higher)
- MySQL or PostgreSQL database
- npm or yarn package manager

---

## Backend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update your `.env` file with database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306                # 3306 for MySQL, 5432 for PostgreSQL
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=smart_bed

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
```

### 3. Run Database Migrations

TypeORM will automatically create tables when you start the application (synchronize: true in development).

For production, disable auto-sync and use migrations:

```bash
npm run typeorm migration:generate -- -n CreateBedTables
npm run typeorm migration:run
```

### 4. Seed Initial Bed Data

Create a seed script or manually add beds via API:

```bash
# Using the seed file
npm run seed:beds
```

Or add this script to package.json:
```json
"scripts": {
  "seed:beds": "ts-node -r tsconfig-paths/register src/database/seed-beds.ts"
}
```

### 5. Start the Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server will start on `http://localhost:3000`

---

## Testing the API

### 1. Register a User (Doctor/Nurse)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "username": "Dr. Smith",
    "password": "SecurePassword123!",
    "role": "doctor"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "..."
}
```

Save the `access_token` for subsequent requests.

---

### 3. Create Beds

```bash
curl -X POST http://localhost:3000/beds \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bedNumber": "BED-101",
    "room": "ICU-1",
    "status": "AVAILABLE",
    "notes": "New smart bed with 4 motors"
  }'
```

### 4. Get All Beds

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/beds
```

### 5. Create a Patient with Bed Assignment

```bash
curl -X POST http://localhost:3000/patients \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "bed": "BED-101",
    "room": "ICU-1",
    "condition": "Post-surgery recovery",
    "age": 45,
    "gender": "Male",
    "admitted": "2026-01-31"
  }'
```

This will:
- Create the patient record
- Assign BED-101 to the patient
- Update bed status to OCCUPIED

### 6. Manual Bed Control

```bash
# Move HEAD motor UP for 5 seconds
curl -X POST http://localhost:3000/beds/1/manual-control \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "motorType": "HEAD",
    "direction": "UP",
    "duration": 5,
    "notes": "Adjusting head position for patient comfort"
  }'
```

**Response:**
```json
{
  "bed": {
    "id": 1,
    "bedNumber": "BED-101",
    "headPosition": 50,
    "emergencyStop": false
  },
  "history": {
    "id": 1,
    "movementType": "MANUAL",
    "motorType": "HEAD",
    "direction": "UP",
    "duration": 5,
    "previousPosition": 0,
    "newPosition": 50,
    "timestamp": "2026-01-31T10:30:00.000Z"
  }
}
```

### 7. Schedule a Movement

```bash
# Schedule leg elevation at 2:30 PM today
curl -X POST http://localhost:3000/beds/1/schedule-movement \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "motorType": "LEG",
    "direction": "UP",
    "duration": 10,
    "scheduledFor": "14:30:00",
    "notes": "Scheduled leg elevation for circulation"
  }'
```

The system will automatically execute this movement at 14:30:00.

### 8. Emergency Stop

```bash
curl -X POST http://localhost:3000/beds/1/emergency-stop \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

This will:
- Stop all bed movements immediately
- Prevent any further movements
- Log the emergency stop event

### 9. Reset Emergency Stop

```bash
curl -X POST http://localhost:3000/beds/1/reset-emergency-stop \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10. Get Bed Movement History

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:3000/beds/1/history?limit=20"
```

### 11. Get Scheduled Movements

```bash
# All scheduled movements
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/beds/scheduled-movements

# For specific bed
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:3000/beds/scheduled-movements?bedId=1"
```

---

## Testing Workflow Example

Here's a complete workflow to test all features:

### Step 1: Setup
```bash
# Start the server
npm run start:dev

# In another terminal, register a doctor
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "username": "Dr. Smith",
    "password": "Doctor123!",
    "role": "doctor"
  }'

# Login and save token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "Doctor123!"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

### Step 2: Create Beds
```bash
# Create multiple beds
for i in 101 102 103; do
  curl -X POST http://localhost:3000/beds \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"bedNumber\": \"BED-$i\",
      \"room\": \"ICU-1\",
      \"status\": \"AVAILABLE\"
    }"
done

# Verify beds were created
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/beds | jq
```

### Step 3: Register Patient
```bash
curl -X POST http://localhost:3000/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "bed": "BED-101",
    "room": "ICU-1",
    "condition": "Post-surgery",
    "age": 45,
    "gender": "Male",
    "admitted": "2026-01-31"
  }' | jq
```

### Step 4: Control the Bed
```bash
# Test all 4 motors
motors=("HEAD" "RIGHT_TILT" "LEFT_TILT" "LEG")
for motor in "${motors[@]}"; do
  echo "Testing $motor motor..."
  curl -X POST http://localhost:3000/beds/1/manual-control \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"motorType\": \"$motor\",
      \"direction\": \"UP\",
      \"duration\": 3
    }" | jq
  sleep 2
done

# Check current positions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/beds/1 | jq '.headPosition, .rightTiltPosition, .leftTiltPosition, .legPosition'
```

### Step 5: Schedule Future Movement
```bash
# Get current time + 2 minutes
SCHED_TIME=$(date -d '+2 minutes' '+%H:%M:%S')

echo "Scheduling movement for: $SCHED_TIME"

curl -X POST http://localhost:3000/beds/1/schedule-movement \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"motorType\": \"HEAD\",
    \"direction\": \"DOWN\",
    \"duration\": 5,
    \"scheduledFor\": \"$SCHED_TIME\",
    \"notes\": \"Automated test - scheduled movement\"
  }" | jq

# Wait and check if it executed
echo "Waiting for scheduled movement to execute..."
sleep 130

# Check history
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/beds/1/history?limit=5" | jq
```

### Step 6: Test Emergency Stop
```bash
# Activate emergency stop
curl -X POST http://localhost:3000/beds/1/emergency-stop \
  -H "Authorization: Bearer $TOKEN" | jq

# Try to move bed (should fail)
curl -X POST http://localhost:3000/beds/1/manual-control \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "motorType": "HEAD",
    "direction": "UP",
    "duration": 3
  }'

# Reset emergency stop
curl -X POST http://localhost:3000/beds/1/reset-emergency-stop \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Step 7: View Complete History
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/beds/1/history?limit=50" | jq
```

---

## Using Postman

Import this collection to Postman:

1. Create a new collection "Smart Bed Management"
2. Add environment variables:
   - `base_url`: http://localhost:3000
   - `token`: (will be set after login)

3. Add requests:
   - POST `/auth/register`
   - POST `/auth/login` (save token to environment)
   - GET `/beds`
   - POST `/beds`
   - POST `/beds/assign`
   - POST `/beds/:id/manual-control`
   - POST `/beds/:id/schedule-movement`
   - POST `/beds/:id/emergency-stop`
   - GET `/beds/:id/history`

---

## Database Verification

Connect to your database and verify:

```sql
-- Check beds
SELECT * FROM beds;

-- Check movement history
SELECT * FROM bed_movement_history ORDER BY timestamp DESC LIMIT 10;

-- Check patient bed assignments
SELECT p.name, p.bed, b.bedNumber, b.status
FROM patient p
LEFT JOIN beds b ON p.bed = b.bedNumber;

-- Get movement statistics
SELECT 
  motorType, 
  direction, 
  COUNT(*) as count 
FROM bed_movement_history 
GROUP BY motorType, direction;
```

---

## Common Issues and Solutions

### Issue 1: "Bed not found"
**Solution**: Make sure beds are created first using POST /beds

### Issue 2: "Bed is already occupied"
**Solution**: Unassign the bed first or use a different bed

### Issue 3: "Bed is in emergency stop mode"
**Solution**: Reset emergency stop using POST /beds/:id/reset-emergency-stop

### Issue 4: Scheduled movements not executing
**Solution**: 
- Check server logs for cron job execution
- Verify scheduled time is in the future
- Ensure bed is not in emergency stop mode

### Issue 5: Authentication errors
**Solution**: 
- Ensure token is included in Authorization header
- Token might be expired (15 min default), login again
- Check JWT_SECRET is set in .env

---

## Monitoring

Check logs for:
- Scheduled movement execution: `[BedSchedulerService] Executing N scheduled movement(s)`
- Emergency stops: Look for EMERGENCY_STOP movement type
- Errors: Any failed movements or validations

```bash
# Watch logs in real-time
npm run start:dev

# In production
tail -f logs/application.log
```

---

## Performance Testing

Test with multiple concurrent bed controls:

```bash
# Create 10 concurrent manual controls
for i in {1..10}; do
  curl -X POST http://localhost:3000/beds/1/manual-control \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "motorType": "HEAD",
      "direction": "UP",
      "duration": 1
    }' &
done
wait

# Check history to verify all movements were logged
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/beds/1/history?limit=20" | jq 'length'
```

---

## Next Steps

1. ✅ Backend implementation complete
2. ✅ API documentation complete
3. ✅ Testing guide complete
4. 📋 Build frontend application (see FRONTEND_IMPLEMENTATION_GUIDE.md)
5. 📋 Implement real-time updates with WebSockets
6. 📋 Add notifications for scheduled movements
7. 📋 Create admin dashboard
8. 📋 Deploy to production

For frontend development, refer to [FRONTEND_IMPLEMENTATION_GUIDE.md](./FRONTEND_IMPLEMENTATION_GUIDE.md)
