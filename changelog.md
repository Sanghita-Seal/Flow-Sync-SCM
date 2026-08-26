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

---

## Phase 2: P2 ↔ E2 Frontend Integration

### New Frontend Files

#### P2 Services (7 files)
- `features/p2/demand/demand.service.js` - Demand API calls
- `features/p2/inventory/inventory.service.js` - Inventory API calls
- `features/p2/production/production.service.js` - Production API calls
- `features/p2/procurement/procurement.service.js` - Procurement API calls + plan shipments
- `features/p2/sop/sop.service.js` - S&OP cycles, plans, recommendations
- `features/p2/markdown/markdown.service.js` - Markdown API calls
- `features/p2/overview/overview.service.js` - P2 overview API

#### Context (1 file)
- `context/CycleContext.jsx` - Planning cycle selection state provider

#### P2 Pages (5 files)
- `pages/p2/ProcurementPlans.jsx` - Procurement plans table with search and cycle filter
- `pages/p2/ProcurementPlanDetail.jsx` - P2 plan detail + linked E2 shipments (key integration page)
- `pages/p2/SopCycles.jsx` - S&OP cycle selection with navigation
- `pages/p2/RiskMonitor.jsx` - Procurement risk from E2 execution delays
- `pages/p2/Recommendations.jsx` - S&OP recommendations with severity and links

#### E2 Pages (1 file)
- `pages/e2/ShipmentDetail.jsx` - Shipment detail with P2 backlink and timeline

### Modified Frontend Files
- `features/e2/shipments/normalizeShipment.js` - Added procurementPlanId, quantities
- `features/e2/shipments/components/ShipmentTable.jsx` - Added procurement link column, clickable rows
- `pages/dashboard/Dashboard.jsx` - Added P2 KPIs and module cards
- `components/layout/Sidebar.jsx` - Added P2 navigation sections with dividers
- `routes/AppRoutes.jsx` - Added P2 and E2 detail routes
- `App.jsx` - Added CycleProvider wrapper

### New Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/p2/sop` | SopCycles | S&OP cycle selection |
| `/p2/procurement` | ProcurementPlans | Procurement plans list |
| `/p2/procurement/:planId` | ProcurementPlanDetail | P2 plan + E2 shipments |
| `/p2/risk` | RiskMonitor | Procurement risk monitor |
| `/p2/recommendations` | Recommendations | S&OP recommendations |
| `/e2/shipments/:reference` | ShipmentDetail | Shipment detail with P2 link |

### Integration Flow
```
P2 Planning → Procurement Plan → E2 Shipment → Truck → Location/ETA → Yard/Dock → P2 Risk → Recommendation
```

### Key Design Decisions
1. Used `procurement_plan_id` as integration key (not SKU)
2. Bidirectional navigation: P2→E2 and E2→P2
3. CycleContext for planning cycle selection across all P2 pages
4. P2 shows linked E2 shipments (not duplicated)
5. E2 shows linked P2 procurement plan

---

## Phase 3: Premium UI Upgrade

### Modified Frontend Files
- `components/layout/MainLayout.jsx` - Fixed-height layout with scrollable main content area
- `components/layout/Sidebar.jsx` - Fixed sidebar height with internal scroll
- `components/ui/SpotlightCard.jsx` - New Aceternity-style spotlight hover effect component
- `components/ui/Card.jsx` - shadcn Card components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- `components/ui/Badge.jsx` - shadcn Badge component with variant support
- `components/ui/Button.jsx` - shadcn Button component with variant/size support
- `components/ui/Select.jsx` - shadcn Select components (Select, SelectTrigger, SelectValue, SelectContent, SelectItem)
- `pages/dashboard/Dashboard.jsx` - Added Motion animations, Recharts (GroupedBar, MultiLine, Donut, RadialGauge), SpotlightCard effects, shadcn components
- `pages/p2/ProcurementPlans.jsx` - Added Motion animations, shadcn Card/Badge/Button, SpotlightCard effects
- `pages/p2/ProcurementPlanDetail.jsx` - Added Motion animations, shadcn components
- `pages/p2/SopCycles.jsx` - Added Motion animations, shadcn components
- `pages/p2/RiskMonitor.jsx` - Added Motion animations, shadcn components
- `pages/p2/Recommendations.jsx` - Added Motion animations, shadcn components
- `pages/e2/ShipmentDetail.jsx` - Added Motion animations, shadcn components

### New Dependencies
- `motion` (framer-motion) - Animation library
- `recharts` - Chart library
- `@radix-ui/react-select` - Select component primitives

---

## Phase 4: Collapsible Sidebar

### Modified Frontend Files
- `components/layout/Sidebar.jsx` - Added SidebarContext, hamburger menu toggle, slide-in animation, backdrop overlay
- `context/SidebarContext.jsx` - New context for sidebar open/close state
- `components/layout/MainLayout.jsx` - Integrated SidebarProvider wrapper

---

## Phase 5: Truck Tracker — Auto-Simulation

### Modified Frontend Files
- `hooks/useTruckSimulation.js` - New hook: frontend-only truck movement simulation using API lat/lng as starting point, increments by 0.00005 every 300ms
- `features/e2/trucks/components/TruckMap.jsx` - Shows only selected truck when one is picked, zooms to level 14, uses simulated position for IN_TRANSIT trucks
- `features/e2/trucks/components/TruckDetails.jsx` - Clean detail panel (Trailer, Shipment, Status, Load Type, Priority, ETA)
- `pages/e2/TruckTracker.jsx` - Auto-simulates IN_TRANSIT trucks on selection, no manual controls needed

### Behavior
- Click any truck → map zooms to it, shows only that truck
- IN_TRANSIT trucks → marker moves automatically (simulated GPS)
- DELAYED/ARRIVED trucks → static marker
- Selecting a different truck → resets and zooms to new truck
