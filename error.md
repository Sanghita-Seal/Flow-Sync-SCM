# Error Log - Cognizant-SCM Frontend Update

## Date: 2026-08-26

### Errors Encountered
None during implementation.

### Potential Issues to Watch For

1. **Database table requirement**: The `assignDocks()` and `getDockAssignments()` functions require the `e2.dock_assignments` table to exist in PostgreSQL. If this table doesn't exist, you'll need to create it:
```sql
CREATE TABLE e2.dock_assignments (
  id SERIAL PRIMARY KEY,
  trailer_id VARCHAR(50) NOT NULL,
  dock_code VARCHAR(50) NOT NULL,
  yard_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **API response format**: The backend uses `ApiResponse.ok()` and `ApiResponse.list()` which return `{ success: true, data: ... }`. Frontend accesses this via `res.data.data`.

3. **CORS configuration**: Backend CORS is set to `http://localhost:5173` (Vite dev server). Frontend API calls should work in development.

4. **Authentication**: Backend has `authMiddleware` applied to all routes. Frontend `apiClient.js` already handles Bearer token injection from localStorage.

5. **Alert API fallback**: The Alerts page tries the backend API first, then falls back to client-side computation. If the alerts module isn't deployed, it will use the fallback automatically.

### Testing Checklist
- [ ] Verify `GET /api/e2/alerts` returns delayed trucks
- [ ] Verify `GET /api/e2/alerts/dock/:yard_name` returns dock availability
- [ ] Verify `GET /api/e2/alerts/yard/:yard_name` returns yard capacity
- [ ] Verify `POST /api/e2/dock/assign` assigns trucks to docks
- [ ] Verify `GET /api/e2/dock/assignments` returns all assignments
- [ ] Verify Alerts page displays API alerts correctly
- [ ] Verify Docks page shows assignments table
- [ ] Verify Auto-Assign button triggers assignment and refreshes data
