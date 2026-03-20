# Halleyx Custom Dashboard Builder — MERN Stack

A full-stack MERN application implementing the Custom Dashboard Builder as per the Halleyx Full Stack Engineer Challenge II (2026).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Chart.js / react-chartjs-2 |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose) |
| Styling | Custom CSS (design system) |

---

## Project Structure

```
halleyx-dashboard/
├── server/                    # Express + Mongoose API
│   ├── models/
│   │   ├── Order.js           # Customer Order schema
│   │   └── Dashboard.js       # Dashboard widget config schema
│   ├── routes/
│   │   ├── orders.js          # CRUD + aggregate endpoints
│   │   └── dashboard.js       # Dashboard config endpoints
│   ├── index.js               # Server entry point
│   └── .env                   # Environment variables
│
└── client/                    # React SPA
    └── src/
        ├── components/
        │   ├── Layout/
        │   │   └── Sidebar.jsx
        │   ├── CustomerOrder/
        │   │   └── OrderForm.jsx        # Create/Edit order modal
        │   ├── Dashboard/
        │   │   ├── DashboardConfig.jsx  # Drag-and-drop canvas
        │   │   └── WidgetSettingsPanel.jsx
        │   └── Widgets/
        │       └── WidgetRenderers.jsx  # All widget types
        ├── context/
        │   └── ToastContext.jsx
        ├── pages/
        │   ├── DashboardPage.jsx        # View + Configure mode
        │   └── CustomerOrderPage.jsx    # Orders table
        └── utils/
            ├── api.js                   # Axios API calls
            └── constants.js            # Enums, options, etc.
```

---

## Setup & Run

### Prerequisites
- Node.js >= 18
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Install Dependencies

```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure Environment

Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/halleyx_dashboard
```

### 3. Start Development

**Option A — Both servers concurrently (from root):**
```bash
npm run dev
```

**Option B — Separately:**
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Features Implemented

### Dashboard Page
- **Empty state** by default with "Configure Dashboard" CTA
- **Configure Dashboard** navigates to full configuration view
- **Real-time data** from Customer Order module
- **Responsive layout**:
  - Desktop: 12-column grid
  - Tablet (768px): 8-column grid with auto-reflow
  - Mobile (< 768px): 4-column grid, stacked layout

### Dashboard Configuration
- **Widget Palette** — draggable widget types:
  - KPI Card
  - Bar Chart / Line Chart / Area Chart / Scatter Plot
  - Pie Chart
  - Table
  - Date Filter
- **Drag-and-drop canvas** with drop preview placeholder
- **Widget hover** reveals Settings (⚙) and Delete (✕) icons
- **Settings side panel** — full configuration per widget spec
- **Save Configuration** persists to MongoDB

### Widget Types
| Widget | Config Fields |
|--------|--------------|
| KPI Card | Metric, Aggregation (Sum/Avg/Count), Data Format, Decimal Precision |
| Bar/Line/Area/Scatter | X-Axis, Y-Axis, Color picker, Show data label |
| Pie Chart | Chart data field, Show legend |
| Table | Column multiselect, Sort, Pagination, Filters, Font size, Header color |
| Date Filter | Date range picker, filters dashboard data |

### Customer Order Module
- Full CRUD with popup form
- Mandatory field validation: "Please fill the field"
- Auto-calculated Total Amount (Quantity × Unit Price)
- Context menu (right-click ⋮) for Edit / Delete
- Delete confirmation dialog
- Status badges: Pending / In Progress / Completed

### Widget Configuration Details (per spec)
- **KPI**: Aggregation disabled for non-numeric fields
- **Charts**: Valid HEX color picker + text input
- **Table**: Column multiselect, 3 sort modes, 3 page sizes, multi-filter support
- **All widgets**: Width/Height inputs with min=1 validation

---

## API Endpoints

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (supports `startDate`, `endDate` query params) |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |
| GET | `/api/orders/stats/aggregate` | KPI aggregation data |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard config |
| PUT | `/api/dashboard` | Save dashboard config |
