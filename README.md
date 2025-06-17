# 🚨 Disaster Incident Reporter

A full-stack disaster reporting web application that enables users to report and visualize real-time incidents such as fire, flood, explosion, and medical emergencies.

This project fulfills the assignment requirements for building a disaster monitoring dashboard with reporting, filtering, geolocation, and visual indicators for critical incidents.

---

## 🔗 Live Demo

- 🌐 **Frontend (Vercel)**: [https://disaster-report.vercel.app](https://disaster-report.vercel.app)  
- 🛠️ **Backend (Render)**: [https://disaster-report.onrender.com](https://disaster-report.onrender.com)

---

## 🧩 Objective

Build a full-stack web app that allows users to:

- Report disaster incidents (e.g., fire, flood)
- View incidents on an interactive map
- Filter and explore incidents by:
  - Type
  - Severity
  - Date range

---

## 🔧 Tech Stack

### Frontend
- **ReactJS** (with **TypeScript**)
- **Vite** (build tool)
- **Redux Toolkit** – State management
- **Leaflet.js** – Interactive map with marker rendering
- **Tailwind CSS** – For responsive UI design

### Backend
- **Node.js** with **Express**
- **SQLite (in-memory)** – Lightweight database for demo

---

## ✅ Features Implemented

### 1. 📋 Incident Reporting Form
- Fields: Incident Type, Severity, Description, Location (map-click), Reporter Name (optional)
- Clicking the map sets the incident location
- Form submits data to the backend and updates the incident list and map

### 2. 🗺️ Interactive Map
- Leaflet map with two basemap styles: Streets & Satellite
- Markers displayed with different colors per type
- Critical incidents (Fire or Explosion with Critical severity):
  - Highlighted on map with animated **pulse**
  - Also styled distinctly in the list

### 3. 📑 Incident List & Filters
- Displays all reported incidents in reverse chronological order
- Clicking an incident recenters the map to that location
- Real-time filters:
  - ✅ Type (multi-select)
  - ✅ Severity (multi-select)
  - ✅ Date Range (from-to)

---

## 🔥 Bonus: Highlighting Critical Incidents
- Fire or Explosion + Critical severity incidents:
  - Marker animates with CSS pulse
  - List item styled in red with bold font and background

---

## 📁 API Endpoints

| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/api/incidents` | Fetch all incidents (with filters) |
| POST   | `/api/incidents` | Submit a new incident              |

⚙️ Setup Instructions
🔹 Backend Setup
bash
Copy
Edit
cd server
npm install
node index.js
Runs at: http://localhost:3001

🔹 Frontend Setup
bash
Copy
Edit
npm install
Create a .env file in the root:

env
Copy
Edit
VITE_BACKEND_URL=http://localhost:3001
In production, this is set to:
https://disaster-report.onrender.com

Then start the frontend:

bash
Copy
Edit
npm run dev
Runs at: http://localhost:5173

⚖️ Assumptions & Trade-offs
Used SQLite in-memory database for simplicity and fast setup; this means data is not persisted between backend restarts

Leaflet was used instead of ArcGIS SDK due to open-source flexibility and faster integration with React

Application assumes only one user reporting at a time (no auth or multi-user logic)

Styling and animations are CSS-based, optimized for quick interaction over custom rendering engines

🐞 Known Issues
❌ Data resets when the backend restarts due to in-memory SQLite

❌ No user authentication or access control

🔁 API does not support pagination or large dataset handling (for demo scope only)

🚫 No backend validation of coordinate ranges or text fields beyond required checks

🙌 Author
Chirag Mehroliya
Full stack Developer
GitHub: @Vincenzo1208
