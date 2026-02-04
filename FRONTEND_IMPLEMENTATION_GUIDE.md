# Frontend Implementation Guide - Smart Bed Management

## Overview

This guide explains how to build a frontend application to interact with the Smart Bed Management backend. The frontend will replicate and enhance the functionality from your Arduino web interface.

---

## Technology Recommendations

### Option 1: React with TypeScript (Recommended)
- **Framework**: React 18+ with Vite or Next.js
- **UI Library**: Material-UI, Ant Design, or Chakra UI
- **State Management**: React Query (TanStack Query) or Redux Toolkit
- **HTTP Client**: Axios or Fetch API
- **Real-time Updates**: Socket.io or polling
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation

### Option 2: Vue.js 3
- **Framework**: Vue 3 with Vite or Nuxt 3
- **UI Library**: Vuetify, Element Plus, or Naive UI
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Forms**: VeeValidate

### Option 3: Vanilla JavaScript
- Simple HTML/CSS/JS with Bootstrap or Tailwind CSS

---

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── auth.ts          # Authentication API calls
│   │   ├── beds.ts          # Bed management API calls
│   │   └── patients.ts      # Patient API calls
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── beds/
│   │   │   ├── BedList.tsx
│   │   │   ├── BedCard.tsx
│   │   │   ├── BedControlPanel.tsx
│   │   │   ├── ManualControl.tsx
│   │   │   ├── ScheduleControl.tsx
│   │   │   ├── BedHistory.tsx
│   │   │   └── EmergencyStop.tsx
│   │   ├── patients/
│   │   │   ├── PatientList.tsx
│   │   │   └── AssignBedModal.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Layout.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBeds.ts
│   │   └── usePatients.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── BedManagement.tsx
│   │   ├── BedControl.tsx
│   │   └── PatientManagement.tsx
│   ├── types/
│   │   ├── bed.types.ts
│   │   ├── patient.types.ts
│   │   └── user.types.ts
│   ├── utils/
│   │   ├── api-client.ts
│   │   └── auth-storage.ts
│   ├── App.tsx
│   └── main.tsx
```

---

## Core Data Types (TypeScript)

```typescript
// types/bed.types.ts

export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum MotorType {
  HEAD = 'HEAD',
  RIGHT_TILT = 'RIGHT_TILT',
  LEFT_TILT = 'LEFT_TILT',
  LEG = 'LEG',
}

export enum MotorDirection {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum MovementType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  EMERGENCY_STOP = 'EMERGENCY_STOP',
}

export interface Bed {
  id: number;
  bedNumber: string;
  room: string;
  status: BedStatus;
  notes?: string;
  headPosition: number;
  rightTiltPosition: number;
  leftTiltPosition: number;
  legPosition: number;
  emergencyStop: boolean;
  currentPatient?: Patient;
  createdAt: string;
  updatedAt: string;
}

export interface BedMovementHistory {
  id: number;
  bedId: number;
  performedBy: number;
  patientId?: string;
  movementType: MovementType;
  motorType?: MotorType;
  direction?: MotorDirection;
  duration?: number;
  previousPosition?: number;
  newPosition?: number;
  scheduledFor?: string;
  executed: boolean;
  notes?: string;
  timestamp: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  patient?: Patient;
}

export interface ManualControlRequest {
  motorType: MotorType;
  direction: MotorDirection;
  duration: number;
  notes?: string;
}

export interface ScheduleMovementRequest {
  motorType: MotorType;
  direction: MotorDirection;
  duration: number;
  scheduledFor: string;
  notes?: string;
}
```

---

## API Client Setup

```typescript
// utils/api-client.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

```typescript
// api/beds.ts

import { apiClient } from '../utils/api-client';
import { Bed, BedMovementHistory, ManualControlRequest, ScheduleMovementRequest } from '../types/bed.types';

export const bedApi = {
  // Get all beds
  getAllBeds: () => apiClient.get<Bed[]>('/beds'),

  // Get available beds
  getAvailableBeds: () => apiClient.get<Bed[]>('/beds/available'),

  // Get single bed
  getBed: (id: number) => apiClient.get<Bed>(`/beds/${id}`),

  // Create bed
  createBed: (data: Partial<Bed>) => apiClient.post<Bed>('/beds', data),

  // Update bed
  updateBed: (id: number, data: Partial<Bed>) => apiClient.patch<Bed>(`/beds/${id}`, data),

  // Delete bed
  deleteBed: (id: number) => apiClient.delete(`/beds/${id}`),

  // Assign bed
  assignBed: (patientId: string, bedNumber: string) =>
    apiClient.post('/beds/assign', { patientId, bedNumber }),

  // Unassign bed
  unassignBed: (id: number) => apiClient.post(`/beds/${id}/unassign`),

  // Manual control
  manualControl: (id: number, data: ManualControlRequest) =>
    apiClient.post(`/beds/${id}/manual-control`, data),

  // Schedule movement
  scheduleMovement: (id: number, data: ScheduleMovementRequest) =>
    apiClient.post(`/beds/${id}/schedule-movement`, data),

  // Emergency stop
  emergencyStop: (id: number) => apiClient.post(`/beds/${id}/emergency-stop`),

  // Reset emergency stop
  resetEmergencyStop: (id: number) => apiClient.post(`/beds/${id}/reset-emergency-stop`),

  // Get bed history
  getBedHistory: (id: number, limit = 50) =>
    apiClient.get<BedMovementHistory[]>(`/beds/${id}/history?limit=${limit}`),

  // Get scheduled movements
  getScheduledMovements: (bedId?: number) =>
    apiClient.get<BedMovementHistory[]>(`/beds/scheduled-movements${bedId ? `?bedId=${bedId}` : ''}`),
};
```

---

## Key React Components

### 1. Manual Control Component

```tsx
// components/beds/ManualControl.tsx

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bedApi } from '../../api/beds';
import { MotorType, MotorDirection } from '../../types/bed.types';

interface ManualControlProps {
  bedId: number;
  disabled?: boolean;
}

export const ManualControl: React.FC<ManualControlProps> = ({ bedId, disabled }) => {
  const queryClient = useQueryClient();

  const controlMutation = useMutation({
    mutationFn: (data: { motorType: MotorType; direction: MotorDirection }) =>
      bedApi.manualControl(bedId, { ...data, duration: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bed', bedId]);
      queryClient.invalidateQueries(['bed-history', bedId]);
    },
  });

  const handleControl = (motorType: MotorType, direction: MotorDirection) => {
    controlMutation.mutate({ motorType, direction });
  };

  const motors = [
    { type: MotorType.HEAD, label: 'HEAD' },
    { type: MotorType.RIGHT_TILT, label: 'RIGHT-TILT' },
    { type: MotorType.LEFT_TILT, label: 'LEFT-TILT' },
    { type: MotorType.LEG, label: 'LEG' },
  ];

  return (
    <div className="manual-control">
      <h3>Manual Controller</h3>
      <div className="motor-grid">
        {motors.map((motor) => (
          <div key={motor.type} className="motor-box">
            <div className="motor-label">{motor.label}</div>
            <button
              onClick={() => handleControl(motor.type, MotorDirection.UP)}
              disabled={disabled || controlMutation.isLoading}
              className="btn-up"
            >
              ▲
            </button>
            <button
              onClick={() => handleControl(motor.type, MotorDirection.DOWN)}
              disabled={disabled || controlMutation.isLoading}
              className="btn-down"
            >
              ▼
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. Schedule Control Component

```tsx
// components/beds/ScheduleControl.tsx

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bedApi } from '../../api/beds';
import { MotorType, MotorDirection } from '../../types/bed.types';

interface ScheduleControlProps {
  bedId: number;
}

export const ScheduleControl: React.FC<ScheduleControlProps> = ({ bedId }) => {
  const [motorType, setMotorType] = useState<MotorType>(MotorType.HEAD);
  const [direction, setDirection] = useState<MotorDirection>(MotorDirection.UP);
  const [duration, setDuration] = useState(5);
  const [scheduledTime, setScheduledTime] = useState('12:00:00');

  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: () =>
      bedApi.scheduleMovement(bedId, {
        motorType,
        direction,
        duration,
        scheduledFor: scheduledTime,
      }),
    onSuccess: () => {
      alert('Movement scheduled successfully!');
      queryClient.invalidateQueries(['scheduled-movements', bedId]);
    },
  });

  return (
    <div className="schedule-control">
      <h3>Real-Time Scheduler</h3>
      
      <label>Motor</label>
      <select value={motorType} onChange={(e) => setMotorType(e.target.value as MotorType)}>
        <option value={MotorType.HEAD}>🟢 Head</option>
        <option value={MotorType.RIGHT_TILT}>🟡 Right Tilt</option>
        <option value={MotorType.LEFT_TILT}>🔵 Left Tilt</option>
        <option value={MotorType.LEG}>🟣 Leg</option>
      </select>

      <label>Direction</label>
      <select value={direction} onChange={(e) => setDirection(e.target.value as MotorDirection)}>
        <option value={MotorDirection.UP}>⬆️ EXTEND</option>
        <option value={MotorDirection.DOWN}>⬇️ RETRACT</option>
      </select>

      <label>Execution Time (24h Format)</label>
      <input
        type="text"
        value={scheduledTime}
        onChange={(e) => setScheduledTime(e.target.value)}
        placeholder="HH:MM:SS"
      />

      <label>Move Duration (Sec)</label>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        min={1}
        max={60}
      />

      <button
        onClick={() => scheduleMutation.mutate()}
        disabled={scheduleMutation.isLoading}
        className="btn-schedule"
      >
        SET SCHEDULE
      </button>
    </div>
  );
};
```

### 3. Emergency Stop Component

```tsx
// components/beds/EmergencyStop.tsx

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bedApi } from '../../api/beds';

interface EmergencyStopProps {
  bedId: number;
}

export const EmergencyStop: React.FC<EmergencyStopProps> = ({ bedId }) => {
  const queryClient = useQueryClient();

  const emergencyStopMutation = useMutation({
    mutationFn: () => bedApi.emergencyStop(bedId),
    onSuccess: () => {
      queryClient.invalidateQueries(['bed', bedId]);
      alert('EMERGENCY STOP ACTIVATED');
    },
  });

  return (
    <button
      onClick={() => {
        if (confirm('Activate EMERGENCY STOP?')) {
          emergencyStopMutation.mutate();
        }
      }}
      className="btn-emergency"
    >
      EMERGENCY STOP
    </button>
  );
};
```

### 4. Bed History Component

```tsx
// components/beds/BedHistory.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { bedApi } from '../../api/beds';

interface BedHistoryProps {
  bedId: number;
}

export const BedHistory: React.FC<BedHistoryProps> = ({ bedId }) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['bed-history', bedId],
    queryFn: () => bedApi.getBedHistory(bedId, 20),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) return <div>Loading history...</div>;

  return (
    <div className="bed-history">
      <h3>Movement History</h3>
      <div className="history-list">
        {history?.data.map((entry) => (
          <div key={entry.id} className="history-item">
            <div className="history-time">
              {new Date(entry.timestamp).toLocaleString()}
            </div>
            <div className="history-details">
              <strong>{entry.movementType}</strong>
              {entry.motorType && (
                <>
                  {' - '}
                  {entry.motorType} {entry.direction} ({entry.duration}s)
                </>
              )}
            </div>
            <div className="history-user">
              By: {entry.user.username}
            </div>
            {entry.notes && <div className="history-notes">{entry.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5. Bed Control Page

```tsx
// pages/BedControl.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bedApi } from '../api/beds';
import { ManualControl } from '../components/beds/ManualControl';
import { ScheduleControl } from '../components/beds/ScheduleControl';
import { EmergencyStop } from '../components/beds/EmergencyStop';
import { BedHistory } from '../components/beds/BedHistory';

export const BedControl: React.FC = () => {
  const { bedId } = useParams<{ bedId: string }>();
  const id = Number(bedId);

  const { data: bed, isLoading } = useQuery({
    queryKey: ['bed', id],
    queryFn: () => bedApi.getBed(id),
    refetchInterval: 3000, // Poll every 3 seconds for position updates
  });

  if (isLoading) return <div>Loading...</div>;

  const bedData = bed?.data;

  return (
    <div className="bed-control-page">
      <div className="header">
        <div className="clock">{new Date().toLocaleTimeString()}</div>
        <h1>SMART BED PRO</h1>
        <h2>Bed: {bedData?.bedNumber}</h2>
        {bedData?.currentPatient && (
          <p>Patient: {bedData.currentPatient.name}</p>
        )}
      </div>

      {bedData?.emergencyStop && (
        <div className="emergency-alert">
          ⚠️ EMERGENCY STOP ACTIVE - Bed movements disabled
        </div>
      )}

      <div className="control-grid">
        <div className="card">
          <ManualControl bedId={id} disabled={bedData?.emergencyStop} />
        </div>

        <div className="card">
          <ScheduleControl bedId={id} />
          <EmergencyStop bedId={id} />
        </div>

        <div className="card">
          <div className="positions">
            <h3>Current Positions</h3>
            <div className="position-item">
              <span>Head:</span>
              <div className="progress-bar">
                <div style={{ width: `${bedData?.headPosition}%` }} />
              </div>
              <span>{bedData?.headPosition}%</span>
            </div>
            <div className="position-item">
              <span>Right Tilt:</span>
              <div className="progress-bar">
                <div style={{ width: `${bedData?.rightTiltPosition}%` }} />
              </div>
              <span>{bedData?.rightTiltPosition}%</span>
            </div>
            <div className="position-item">
              <span>Left Tilt:</span>
              <div className="progress-bar">
                <div style={{ width: `${bedData?.leftTiltPosition}%` }} />
              </div>
              <span>{bedData?.leftTiltPosition}%</span>
            </div>
            <div className="position-item">
              <span>Leg:</span>
              <div className="progress-bar">
                <div style={{ width: `${bedData?.legPosition}%` }} />
              </div>
              <span>{bedData?.legPosition}%</span>
            </div>
          </div>
        </div>
      </div>

      <BedHistory bedId={id} />
    </div>
  );
};
```

---

## Styling (CSS similar to Arduino interface)

```css
/* styles/bed-control.css */

:root {
  --primary: #00f2fe;
  --secondary: #4facfe;
  --error: #ff4b2b;
  --glass: rgba(255, 255, 255, 0.05);
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #0f172a;
  color: white;
  margin: 0;
}

.bed-control-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.clock {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 10px;
}

.card {
  background: var(--glass);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 24px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.motor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}

.motor-box {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.motor-label {
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 0.9em;
}

button {
  cursor: pointer;
  border: none;
  font-weight: bold;
  color: white;
  transition: 0.1s;
}

.btn-up,
.btn-down {
  width: 45%;
  padding: 10px;
  border-radius: 8px;
  margin: 2px;
}

.btn-up {
  background: #0084a8;
  box-shadow: 0 4px 0 #00566e;
}

.btn-down {
  background: #334155;
  box-shadow: 0 4px 0 #1e293b;
}

.btn-up:active,
.btn-down:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 transparent;
}

.btn-schedule {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(145deg, #4facfe, #00f2fe);
  color: #001e3c;
  font-weight: 800;
  box-shadow: 0 5px 0 #0084a8;
  margin-top: 15px;
}

.btn-emergency {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  border: 2px solid var(--error);
  background: transparent;
  color: var(--error);
  border-radius: 12px;
  font-weight: bold;
}

.btn-emergency:hover {
  background: var(--error);
  color: white;
}

.emergency-alert {
  background: var(--error);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

label {
  display: block;
  margin-bottom: 8px;
  margin-top: 15px;
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.75em;
  text-transform: uppercase;
}

select,
input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 1em;
  outline: none;
  box-sizing: border-box;
}

.position-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar > div {
  height: 100%;
  background: linear-gradient(90deg, var(--secondary), var(--primary));
  transition: width 0.3s;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 3px solid var(--primary);
}

.history-time {
  font-size: 0.85em;
  color: #94a3b8;
  margin-bottom: 5px;
}

.history-details {
  margin-bottom: 5px;
}

.history-user {
  font-size: 0.85em;
  color: #94a3b8;
}

.history-notes {
  margin-top: 5px;
  font-style: italic;
  color: #cbd5e1;
}
```

---

## Setup Instructions

### 1. Create React + TypeScript Project

```bash
npm create vite@latest smart-bed-frontend -- --template react-ts
cd smart-bed-frontend
npm install
```

### 2. Install Dependencies

```bash
npm install @tanstack/react-query axios react-router-dom
npm install -D @types/node
```

### 3. Setup Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:3000
```

### 4. Configure API Base URL

Update `src/utils/api-client.ts` with your backend URL.

### 5. Add React Query Provider

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 6. Setup Routing

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BedControl } from './pages/BedControl';

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/beds/:bedId"
          element={isAuthenticated ? <BedControl /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Additional Features to Implement

### 1. Real-time Updates with WebSockets

For live position updates, consider implementing Socket.io:

```typescript
// Backend: Add Socket.io
import { Server } from 'socket.io';

// Emit on bed update
io.emit('bed-updated', { bedId, positions });

// Frontend: Listen for updates
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
socket.on('bed-updated', (data) => {
  queryClient.setQueryData(['bed', data.bedId], data);
});
```

### 2. Role-Based Access Control

Add role checks to show/hide features:
- Doctors: Full control
- Nurses: Limited control
- Admins: System configuration

### 3. Mobile Responsive Design

Use media queries and touch-friendly controls for tablets and phones.

### 4. Notifications

Implement toast notifications for:
- Movement completed
- Emergency stop activated
- Scheduled movement executed
- Errors

### 5. Dashboard Overview

Show all beds status in a grid:
- Color coding by status
- Quick access to controls
- Filter by room, status, or patient

---

## Testing the Integration

1. **Start the backend**: `npm run start:dev`
2. **Start the frontend**: `npm run dev`
3. **Login** with your credentials
4. **Navigate to bed control** page
5. **Test manual controls** - should update positions immediately
6. **Test scheduling** - should execute at specified time
7. **Test emergency stop** - should prevent further movements
8. **Check history** - should log all actions

---

## Deployment

### Backend
- Deploy to AWS, Railway, Render, or Heroku
- Setup PostgreSQL or MySQL database
- Configure environment variables
- Enable CORS for frontend domain

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Update `VITE_API_URL` to production backend URL

---

## Next Steps

1. Implement authentication (login/register)
2. Create bed list/dashboard page
3. Build bed control interface (replicate Arduino UI)
4. Add patient management
5. Implement history viewing
6. Add real-time updates
7. Create admin panel for system configuration
8. Add mobile responsiveness
9. Implement role-based permissions
10. Add unit and E2E tests

This architecture will give you a scalable, maintainable frontend that seamlessly integrates with your bed management backend!
