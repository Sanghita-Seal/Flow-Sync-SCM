# Changelog - Cognizant-SCM Frontend Update

## Date: 2026-08-26

### Backend Changes

#### Added
- `backend/src/module/e2/alerts/alert.routes.js` - Express router for alerts endpoints (3 routes)
- `backend/src/module/e2/alerts/alert.controller.js` - Controller with 3 static methods
- `backend/src/module/e2/alerts/alert.service.js` - Business logic layer
- `backend/src/module/e2/alerts/alert.model.js` - PostgreSQL queries for alerts

#### Modified
- `backend/src/app.js` - Added import and mounting of alertRouter at `/api/e2/alerts`
- `backend/src/module/e2/dock/dock.routes.js` - Added `POST /assign` and `GET /assignments` endpoints
- `backend/src/module/e2/dock/dock.controller.js` - Added `assignDocks()` and `getDockAssignments()` methods
- `backend/src/module/e2/dock/dock.service.js` - Added `assignDocks()` and `getDockAssignments()` methods
- `backend/src/module/e2/dock/dock.model.js` - Added `assignDocks()` transaction and `getDockAssignments()` query

### Frontend Changes

#### Modified
- `frontend/src/features/e2/alerts/alert.service.js` - Added API-based functions: fetchDelayedTruckAlerts(), checkDockAvailability(), checkYardCapacity()
- `frontend/src/pages/alerts/Alerts.jsx` - Updated to call backend API first, fallback to client-side; displays richer alert data with priority, location, ETA
- `frontend/src/features/e2/docks/dock.service.js` - Added `getDockAssignments()` and `assignDocks()` functions
- `frontend/src/pages/e2/Docks.jsx` - Added dock assignments table, auto-assign button, and result display

#### Added
- `frontend/src/features/e2/docks/components/DockAssignments.jsx` - New component for dock assignments table

### New API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/e2/alerts` | Get delayed truck alerts |
| GET | `/api/e2/alerts/dock/:yard_name` | Check dock availability per yard |
| GET | `/api/e2/alerts/yard/:yard_name` | Check yard capacity |
| POST | `/api/e2/dock/assign` | Auto-assign trucks to docks |
| GET | `/api/e2/dock/assignments` | Get all current dock assignments |
