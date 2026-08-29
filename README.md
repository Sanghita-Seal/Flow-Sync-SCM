# FlowSync

### Supply Chain Management — Planning ↔ Execution

FlowSync connects **Supply Chain Planning (P2)** and **Execution (E2)** through a continuous feedback loop.

<p align="center">

**[🌐 Live Demo](https://flowsyncs.site)** · **[🎥 Demo Video](https://youtu.be/your-video-link)**

</p>

---

## 📌 Overview

Supply chains often operate with **planning and execution in separate systems**.

Planning teams create procurement plans, while execution teams independently track shipments. When a shipment is delayed, the planning team may not know until the delay has already impacted the plan.

**FlowSync closes this gap by connecting planning and execution in one platform.**

```text
Plan → Execute → Monitor → Respond → Replan
```

Every procurement plan creates a shipment, and every shipment sends execution status back to its linked procurement plan.

When a shipment is delayed:

1. E2 detects the delay.
2. P2 identifies the affected procurement plan as **at risk**.
3. The AI Copilot analyzes the situation.
4. A corrective recommendation is generated.
5. The planner can adjust the next planning cycle.

---

## 🚀 Key Features

### P2 — Planning

| Module                    | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| **S&OP Cycles**           | Create planning periods, generate plans, and track status |
| **Demand Planning**       | Generate weekly demand forecasts for each SKU             |
| **Production Scheduling** | Compare plant capacity with planned production            |
| **Inventory**             | Monitor current stock levels and inventory risks          |
| **Procurement Plans**     | Manage fabric orders, suppliers, lead times, and risks    |
| **Markdown Decisions**    | Generate discount recommendations for excess inventory    |
| **Risk Monitor**          | Identify plans affected by execution delays               |
| **Recommendations**       | Generate AI- and rule-based corrective actions            |

### E2 — Execution

| Module            | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| **Shipments**     | Track shipments, quantities, and status                              |
| **Truck Tracker** | Monitor truck locations using a live GPS map with simulated movement |
| **Docks**         | Automatically assign trucks to loading docks                         |
| **Yards**         | Monitor yard occupancy and capacity                                  |
| **Alerts**        | Detect delayed trucks, unavailable docks, and full yards             |

---

## 🔄 P2 ↔ E2 Integration

The key integration point is the relationship between a **procurement plan** and the **shipment created from that plan**.

Every shipment contains a `procurement_plan_id`, which links it back to the P2 procurement plan.

### Integration Flow

```text
P2: Procurement Plan #42 created
                │
                ▼
E2: Shipment SHP-001 created
    linked to Procurement Plan #42
                │
                ▼
E2: Truck TRK-101 tracking...
    Status: DELAYED
                │
                ▼
P2: Risk Monitor flags Plan #42
    Status: AT RISK
                │
                ▼
AI Copilot:
"Contact supplier for expedited delivery"
```

This creates a continuous feedback loop:

```text
Plan
  ↓
Execute
  ↓
Monitor
  ↓
Respond
  ↓
Replan
  ↺
```

---

## 🤖 AI Copilot

FlowSync includes an AI Copilot that uses planning and execution context to generate actionable recommendations.

For example:

> **Shipment SHP-001 is delayed by 3 days.**
> **Recommendation:** Contact the supplier for expedited delivery.

The AI layer helps planners move from **detecting a risk** to **deciding what action to take**.

---

## 🧠 Business Rules

FlowSync uses rule-based logic to identify supply chain risks and opportunities.

| #  | Rule                     | Formula / Condition                                 | Severity |
| -- | ------------------------ | --------------------------------------------------- | -------- |
| 1  | **Required Production**  | `max(0, demand - inventory)`                        | —        |
| 2  | **Planned Production**   | `min(required, capacity)`                           | —        |
| 3  | **Ending Inventory**     | `inventory + production - demand`                   | —        |
| 4  | **Supply Gap**           | `max(0, -ending)`                                   | —        |
| 5  | **Plan Status**          | `gap > 0 → SHORTAGE`, otherwise `EXCESS / BALANCED` | —        |
| 6  | **Inventory Shortage**   | `ending < 0`                                        | HIGH     |
| 7  | **Excess Inventory**     | `ending > demand × 0.5`                             | MEDIUM   |
| 8  | **Capacity Shortage**    | `required > capacity`                               | HIGH     |
| 9  | **High Utilization**     | `utilization ≥ 90%`                                 | MEDIUM   |
| 10 | **Procurement Shortage** | `order < required`                                  | HIGH     |
| 11 | **Long Lead Time**       | `lead ≥ 4 weeks`                                    | MEDIUM   |
| 12 | **Markdown Opportunity** | `ending > demand × 0.5`                             | MEDIUM   |
| 13 | **Shipment Delay**       | `ETA > planned` and `delay ≥ 3 days`                | HIGH     |
| 14 | **Dock Assignment**      | Priority-based transactional assignment             | —        |

---

## 🛠️ Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| **Frontend**       | React 19, Vite 8, Tailwind CSS v4           |
| **UI Components**  | shadcn/ui, Framer Motion, Recharts          |
| **Maps**           | Leaflet, react-leaflet                      |
| **Backend**        | Express 5, Node.js                          |
| **Database**       | PostgreSQL (Neon)                           |
| **Authentication** | Clerk                                       |
| **AI**             | OpenAI GPT-4.1-nano                         |
| **Hosting**        | Vercel (frontend), Node.js server (backend) |

---

## 📂 Project Structure

```text
Cognizant-SCM/
│
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── common/
│       ├── module/
│       │   ├── p2/
│       │   ├── e2/
│       │   └── ai/
│       ├── rules/
│       └── db/
│           └── seed/
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── context/
│       ├── routes/
│       ├── components/
│       │   ├── layout/
│       │   ├── ui/
│       │   └── charts/
│       ├── features/
│       │   ├── p2/
│       │   ├── e2/
│       │   └── ai/
│       ├── hooks/
│       └── pages/
│
├── ARCHITECTURE.md
└── FLOWSYNC_EXPLAINED.md
```

---

## 🔌 API Endpoints

### P2 — Planning APIs

| Method  | Endpoint                                       | Description               |
| ------- | ---------------------------------------------- | ------------------------- |
| `GET`   | `/api/demand`                                  | Demand forecasts          |
| `GET`   | `/api/demand/summary`                          | Demand summary            |
| `GET`   | `/api/demand/trend`                            | Demand trend              |
| `GET`   | `/api/inventory`                               | Inventory                 |
| `GET`   | `/api/inventory/summary`                       | Inventory summary         |
| `GET`   | `/api/inventory/risk`                          | Inventory risk            |
| `GET`   | `/api/production`                              | Production capacity       |
| `GET`   | `/api/production/summary`                      | Production summary        |
| `GET`   | `/api/production/capacity`                     | Capacity breakdown        |
| `GET`   | `/api/procurement`                             | Procurement plans         |
| `GET`   | `/api/procurement/summary`                     | Procurement summary       |
| `GET`   | `/api/procurement/risk`                        | At-risk procurement plans |
| `GET`   | `/api/procurement/plans/:id/shipments`         | Plan and linked shipments |
| `GET`   | `/api/markdown`                                | Markdown history          |
| `GET`   | `/api/markdown/summary`                        | Markdown summary          |
| `GET`   | `/api/sop/cycles`                              | S&OP cycles               |
| `POST`  | `/api/sop/cycles`                              | Create S&OP cycle         |
| `PATCH` | `/api/sop/cycles/:id/status`                   | Update cycle status       |
| `GET`   | `/api/sop/cycles/:id/plan`                     | Get S&OP plan             |
| `POST`  | `/api/sop/cycles/:id/plan/generate`            | Generate plan             |
| `GET`   | `/api/sop/cycles/:id/recommendations`          | Get recommendations       |
| `POST`  | `/api/sop/cycles/:id/recommendations/generate` | Generate recommendations  |
| `GET`   | `/api/p2/overview`                             | P2 overview               |

### E2 — Execution APIs

| Method | Endpoint                           | Description                       |
| ------ | ---------------------------------- | --------------------------------- |
| `GET`  | `/api/e2/truck`                    | Get all trucks                    |
| `GET`  | `/api/e2/truck/locations`          | Get truck GPS locations           |
| `GET`  | `/api/e2/truck/status/:status`     | Get trucks by status              |
| `GET`  | `/api/e2/shipment`                 | Get all shipments                 |
| `GET`  | `/api/e2/shipment/procurement/:id` | Get shipments by procurement plan |
| `GET`  | `/api/e2/dock`                     | Get all docks                     |
| `GET`  | `/api/e2/dock/assignments`         | Get dock assignments              |
| `POST` | `/api/e2/dock/assign`              | Automatically assign docks        |
| `GET`  | `/api/e2/yard`                     | Get all yards                     |
| `GET`  | `/api/e2/alerts`                   | Get delayed truck alerts          |
| `GET`  | `/api/e2/alerts/dock/:yard`        | Get dock availability             |
| `GET`  | `/api/e2/alerts/yard/:yard`        | Get yard capacity                 |
| `GET`  | `/api/e2/overview`                 | E2 overview                       |

### AI & User APIs

| Method  | Endpoint              | Description      |
| ------- | --------------------- | ---------------- |
| `POST`  | `/api/ai/insight`     | AI Copilot       |
| `GET`   | `/api/users`          | List users       |
| `PATCH` | `/api/users/:id/role` | Update user role |

---

## ⚙️ Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL or Neon account
* Clerk account
* OpenAI API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Cognizant-SCM
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```env
DATABASE_URL=your_database_url
CLERK_SECRET=your_clerk_secret
OPENAI_API_KEY=your_openai_api_key
```

Seed the planning and execution data:

```bash
npm run seed:p2
npm run seed:e2
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file with:

```env
VITE_API_URL=your_api_url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## 📊 Seed Data

The seed scripts load data from Excel files located in:

```text
backend/src/db/seed/
```

| Dataset                              | Description                |
| ------------------------------------ | -------------------------- |
| `P2_cleaned_validated_dataset.xlsx`  | 13 sheets of planning data |
| `E2_Prototype_Final_Dataset_v2.xlsx` | 6 sheets of execution data |

---


## 👥 Team

Built for the **Cognizant Supply Chain Management Hackathon**.

| Name              | Role                   |
| ----------------- | ---------------------- |
| **Sanghita Seal** | P2 Backend & Frontend & Integration |
| **Aniket Maity**  | E2 Backend & Architecture |
| **Gautam Gambhir**  | Frontend              |
| **Dhiren Gupta**  | Frontend              |


## 📄 License

This project was built for the **Cognizant SCM Hackathon**.

For inquiries, please contact the team.

---


