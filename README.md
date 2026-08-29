<![CDATA[<div align="center">

# FlowSync

### Supply Chain Management — Planning ↔ Execution

[![Live](https://img.shields.io/badge/Live%20Site-blue?style=for-the-badge&logo=vercel)](https://flowsyncs.site)
[![Video](https://img.shields.io/badge/Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/your-video-link)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat&logo=tailwindcss)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4.1-412991?style=flat&logo=openai)

</div>

---

## What is FlowSync?

Supply chains fail because **Planning** and **Execution** don't talk to each other. The planning team creates procurement plans on spreadsheets. The execution team tracks shipments on separate systems. When a shipment is delayed, nobody in planning knows — until it's too late.

**FlowSync fixes this.** It connects P2 (Planning) and E2 (Execution) in one continuous loop:

```
Plan → Execute → Monitor → Respond → Replan
```

Every procurement plan creates a shipment. Every shipment feeds back status to the plan. When a shipment is delayed, P2 sees it as a risk, AI generates recommendations, and the planner adjusts the next cycle.

---

## Live Demo

**🔗 [flowsyncs.site](https://flowsyncs.site)**

**📹 [Watch the Demo Video](https://youtu.be/your-video-link)**

> Demo credentials: Sign up with your email, then contact the team to get manager access.

---

## How It Works

### P2 — Planning

| Module | What It Does |
|--------|-------------|
| **S&OP Cycles** | Create planning periods, generate plans, track status |
| **Demand Planning** | Weekly demand forecasts per SKU |
| **Production Scheduling** | Plant capacity vs planned production |
| **Inventory** | Current stock levels and risk assessment |
| **Procurement Plans** | Fabric orders with supplier, lead time, risk |
| **Markdown Decisions** | Discount recommendations for excess stock |
| **Risk Monitor** | Plans at risk due to execution delays |
| **Recommendations** | AI + rule-generated corrective actions |

### E2 — Execution

| Module | What It Does |
|--------|-------------|
| **Shipments** | Track all shipments with status and quantities |
| **Truck Tracker** | Live GPS map with simulated truck movement |
| **Docks** | Auto-assign trucks to loading docks |
| **Yards** | Yard occupancy and capacity monitoring |
| **Alerts** | Delayed trucks, dock unavailability, yard full |

### The Integration

The key: every shipment has a `procurement_plan_id` linking it back to the P2 plan that created it.

```
P2: Procurement Plan #42 created
         │
         ▼
E2: Shipment SHP-001 created (linked to plan #42)
         │
         ▼
E2: Truck TRK-101 tracking... DELAYED
         │
         ▼
P2: Risk Monitor flags plan #42 as AT RISK
         │
         ▼
P2: AI recommends "Contact supplier for expedited delivery"
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| UI Components | shadcn/ui, Framer Motion, Recharts |
| Maps | Leaflet + react-leaflet |
| Backend | Express 5, Node.js |
| Database | PostgreSQL (Neon) |
| Auth | Clerk |
| AI | OpenAI GPT-4.1-nano |
| Hosting | Vercel (frontend), Node.js server (backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Neon account)
- Clerk account
- OpenAI API key

### Backend Setup

```bash
cd backend
npm install
cp .env-example .env   # Fill in your DATABASE_URL, CLERK_SECRET, OPENAI_API_KEY
npm run seed:p2         # Seed planning data from Excel
npm run seed:e2         # Seed execution data from Excel
npm run dev             # Starts on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env with VITE_API_URL, VITE_CLERK_PUBLISHABLE_KEY
npm run dev             # Starts on http://localhost:5173
```

### Seed Data

The seed scripts read from Excel files in `backend/src/db/seed/`:
- `P2_cleaned_validated_dataset.xlsx` — 13 sheets of planning data
- `E2_Prototype_Final_Dataset_v2.xlsx` — 6 sheets of execution data

---

## Project Structure

```
Cognizant-SCM/
├── backend/
│   ├── server.js                    # Entry point
│   └── src/
│       ├── app.js                   # Express configuration
│       ├── common/                  # Middleware, utils, DTOs
│       ├── module/
│       │   ├── p2/                  # Planning APIs
│       │   ├── e2/                  # Execution APIs
│       │   └── ai/                  # AI copilot
│       ├── rules/                   # Business rule engines
│       └── db/seed/                 # Seed scripts + Excel data
│
├── frontend/
│   └── src/
│       ├── api/                     # Axios client
│       ├── context/                 # React contexts (4)
│       ├── routes/                  # Route definitions
│       ├── components/
│       │   ├── layout/              # MainLayout, Navbar, Sidebar
│       │   ├── ui/                  # Reusable UI components
│       │   └── charts/              # Recharts components
│       ├── features/
│       │   ├── p2/                  # Planning features
│       │   ├── e2/                  # Execution features
│       │   └── ai/                  # AI copilot
│       ├── hooks/                   # Custom hooks
│       └── pages/                   # Route pages
│
├── ARCHITECTURE.md                  # Detailed architecture docs
└── FLOWSYNC_EXPLAINED.md            # Complete project walkthrough
```

---

## Business Rules

| # | Rule | Formula | Severity |
|---|------|---------|----------|
| 1 | Required Production | `max(0, demand - inventory)` | -- |
| 2 | Planned Production | `min(required, capacity)` | -- |
| 3 | Ending Inventory | `inventory + production - demand` | -- |
| 4 | Supply Gap | `max(0, -ending)` | -- |
| 5 | Plan Status | gap > 0 → SHORTAGE, else EXCESS / BALANCED | -- |
| 6 | Inventory Shortage | `ending < 0` | HIGH |
| 7 | Excess Inventory | `ending > demand × 0.5` | MEDIUM |
| 8 | Capacity Shortage | `required > capacity` | HIGH |
| 9 | High Utilization | `utilization ≥ 90%` | MEDIUM |
| 10 | Procurement Shortage | `order < required` | HIGH |
| 11 | Long Lead Time | `lead ≥ 4 weeks` | MEDIUM |
| 12 | Markdown Opportunity | `ending > demand × 0.5` | MEDIUM |
| 13 | Shipment Delay | `ETA > planned, delay ≥ 3 days` | HIGH |
| 14 | Dock Assignment | Priority-based, transactional | -- |

---

## API Endpoints

<details>
<summary>P2 (Planning) Endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demand` | Demand forecasts |
| GET | `/api/demand/summary` | Demand summary |
| GET | `/api/demand/trend` | Demand trend |
| GET | `/api/inventory` | Inventory |
| GET | `/api/inventory/summary` | Inventory summary |
| GET | `/api/inventory/risk` | Inventory risk |
| GET | `/api/production` | Production capacity |
| GET | `/api/production/summary` | Production summary |
| GET | `/api/production/capacity` | Full capacity breakdown |
| GET | `/api/procurement` | Procurement plans |
| GET | `/api/procurement/summary` | Procurement summary |
| GET | `/api/procurement/risk` | At-risk plans |
| GET | `/api/procurement/plans/:id/shipments` | Plan + linked shipments |
| GET | `/api/markdown` | Markdown history |
| GET | `/api/markdown/summary` | Markdown summary |
| GET | `/api/sop/cycles` | S&OP cycles |
| POST | `/api/sop/cycles` | Create cycle |
| PATCH | `/api/sop/cycles/:id/status` | Update cycle status |
| GET | `/api/sop/cycles/:id/plan` | Get S&OP plan |
| POST | `/api/sop/cycles/:id/plan/generate` | Generate plan |
| GET | `/api/sop/cycles/:id/recommendations` | Get recommendations |
| POST | `/api/sop/cycles/:id/recommendations/generate` | Generate recommendations |
| GET | `/api/p2/overview` | P2 overview |

</details>

<details>
<summary>E2 (Execution) Endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/e2/truck` | All trucks |
| GET | `/api/e2/truck/locations` | Truck GPS locations |
| GET | `/api/e2/truck/status/:status` | Trucks by status |
| GET | `/api/e2/shipment` | All shipments |
| GET | `/api/e2/shipment/procurement/:id` | Shipments by plan |
| GET | `/api/e2/dock` | All docks |
| GET | `/api/e2/dock/assignments` | Dock assignments |
| POST | `/api/e2/dock/assign` | Auto-assign docks |
| GET | `/api/e2/yard` | All yards |
| GET | `/api/e2/alerts` | Delayed truck alerts |
| GET | `/api/e2/alerts/dock/:yard` | Dock availability |
| GET | `/api/e2/alerts/yard/:yard` | Yard capacity |
| GET | `/api/e2/overview` | E2 overview |

</details>

<details>
<summary>Other Endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/insight` | AI copilot |
| GET | `/api/users` | List users |
| PATCH | `/api/users/:id/role` | Update user role |

</details>

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Detailed system architecture, database schema, component hierarchy |
| [FLOWSYNC_EXPLAINED.md](./FLOWSYNC_EXPLAINED.md) | Complete project walkthrough — problem to solution, every decision explained |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | All 20 business rules with formulas and thresholds |
| [changelog.md](./changelog.md) | Phase-by-phase development changelog |

---

## Team

Built at the **Cognizant Supply Chain Management Hackathon**

| Name | Role |
|------|------|
| Sanghita Seal | Frontend & Integration |
| Aniket Maity | Backend & Architecture |
| [Teammate 3] | [Role] |
| [Teammate 4] | [Role] |

---

## License

This project was built for the Cognizant SCM Hackathon. For inquiries, contact the team.

---

<div align="center">

**[Live Site](https://flowsyncs.site)** · **[Demo Video](https://youtu.be/your-video-link)** · **[Architecture Docs](./ARCHITECTURE.md)**

</div>
]]>