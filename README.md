# EventPlan - Tactical Industrial Event Orchestration Platform 🛡️⚡

EventPlan is a high-performance, real-time event organization platform built for the **e3 Computer Networks** project. It features a premium **Enay Industrial Tactical** aesthetic, designed for maximum legibility and professional coordination.

## 🚀 The Aesthetic: "Enay Industrial"
The platform has been redesigned from the ground up with a "Pro-Tool" design language:
- **Nuclear Palette**: Deep Charcoal (#0A0A0A) background with high-visibility **Nuclear Lime** accents.
- **Safety Critical**: **Safety Orange** indicators for terminated sessions, deleted records, and critical alerts.
- **Typography Matrix**: Industrial headers (Space Grotesk) paired with technical data mono-fonts (JetBrains Mono).
- **Industrial Layout**: "Tactical Cards" and "Experience Dossiers" replace traditional UI containers.

## 🛠 Strategic Features
- **Global Notification Hub**: Real-time cross-event alerts. Receive toast notifications for votes, messages, and status changes regardless of your current location in the app.
- **Comms Link (Real-Time Chat)**: A terminal-style data stream for every event, powered by dedicated WebSocket rooms.
- **Live Preference Polling**: Real-time voting modules that update instantly across all connected units.
- **Experience Dossiers**: Comprehensive data sheets for every gathering, featuring geographic coordinates, ISO timestamps, and personnel logs.
- **Admin System Override**: A centralized control node to moderate users (Block/Unblock), terminate active sessions, or decommission entire experiences.
- **Stateless Auth**: Robust JWT-based authentication with high-clearance role management.

## 🚀 Deployment Instructions

### 1. Prerequisites
- **Python 3.9+** & **Node.js/npm**
- **MongoDB Atlas** (Connection URI is pre-configured in `backend/config.py`)

### 2. Backend Initialization
1. Navigate to `/backend`
2. Initialize virtual environment: `python -m venv venv`
3. Activate: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Execute server: `uvicorn main:app --reload` (Default port: 8000)

### 3. Frontend Initialization
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Standard dev launch: `npm run dev`
4. Access Node: `http://localhost:5173`

## 📡 Technical Stack
- **Backend Core**: FastAPI (Python)
- **Database Architecture**: MongoDB with Beanie ODM
- **Real-Time Stream**: WebSockets (Broadcast & Global Hub)
- **Frontend Core**: React with Vite
- **Iconography**: Lucide-React (Tactical Variant)

## ⚖️ Admin Privileges
To elevate a standard unit to Administrator:
1. Register a new identity.
2. Trigger the command: `POST /admin/make-me-admin` (or use the override button in the Personnel Dossier/Profile view).
3. The **Admin Shield** module will become accessible in the primary navigation header.

---
*Created for Project e3 Computer Networks - Industrial-Grade Event Orchestration.*
