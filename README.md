# BloodBridge — Real-Time Blood Bank Demand Matching

> **Connecting verified hospital demand with compatible blood supply in real time.**  
> *Phase 2 Hackathon Project — Software Track*  
> **Team Members:** Eram Khan • Roshan Ali

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-rose.svg)](https://ais-pre-sllyrqqqlldlqazlu36ah2-901202211946.asia-east1.run.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

---

## 📌 Overview & Problem Statement

In metropolitan healthcare systems, emergency blood supply coordination is often plagued by fragmentation:
- **Siloed Records**: Hospitals and blood banks maintain independent ledgers with static availability lists.
- **Coordination Delays**: Critical trauma and obstetric emergencies rely on chaotic manual phone calls or unverified chat groups.
- **Wastage vs. Shortage**: Blood components near safe expiration are frequently discarded while nearby clinics face acute shortages.
- **Uncoordinated Donor Summoning**: Broad, non-targeted donor alerts cause fatigue and lack closed-loop status resolution.

**BloodBridge** transforms fragmented coordination into an **event-driven real-time matching platform** that connects verified clinical demand with compatible inventory and targeted donor fallback.

---

## 🚀 Key Features & Architectural Modules

### 1. 🏥 Hospital Emergency Operations Dashboard
- **Structured Demand Creation**: Broadcast requests specifying patient details, ABO/Rh blood group, component (Packed RBCs, Platelets, FFP, Whole Blood), required units, and urgency level (`CRITICAL_TRAUMA`, `HIGH_SURGERY`, `STANDARD_ELECTIVE`).
- **5-Factor Smart Matching Engine**: Instant ranking of available regional blood bank batches with transparent match score breakdowns.
- **Partial Fulfillment & Split Reservations**: Reserve available stock immediately from primary depots and route remaining units to secondary depots.
- **Emergency Sirens & Audio Feedback**: Web Audio API-powered auditory notifications for critical alerts.

### 2. 🏛️ Blood Bank Depot Management
- **FEFO (First-Expired, First-Out) Prioritization**: Automated shelf-life ranking prioritizing batches approaching expiration within safe windows to minimize wastage.
- **Dynamic Lot Reservation Locks**: Real-time reservation mechanism locking units during transit to prevent double-booking.
- **Interactive Dispatch Tracking**: Acceptance workflows, delivery ETA estimates, and cold-chain temperature telemetry logging.

### 3. 👤 Donor Standby & Targeted Fallback Portal
- **Inventory-First Safeguard**: Donors are contacted *only* when regional blood bank inventory cannot fulfill the demand.
- **Privacy Shield Protection**: Uses approximate geographic radius masking until dispatch is confirmed.
- **1-Click Response & ETA Submission**: Donors can accept summons, provide estimated arrival times, or manage opt-in notification preferences.

### 4. 🎛️ Central Admin & Logistics Radar
- **Live Metropolitan Vector Radar**: Real-time interactive map showing hospitals, blood banks, standby donors, and active transit routes.
- **Tunable Matching Algorithm**: Sliders allowing administrators to adjust algorithmic weights (Urgency, Compatibility, Distance, FEFO Expiry, Quantity Coverage).
- **Immutable Audit Trail**: Chronological event log tracking all system events, state transitions, reservations, and cancellations.

### 5. 📑 12-Slide Presentation Companion
- Built-in interactive slide deck matching the hackathon technical specification with 1-click execution of 4 demonstration scenarios.

---

## 🧮 Smart Matching Algorithm

Candidates are ranked using a multi-factor transparent scoring formula:

$$\text{Score} = (W_u \times S_u) + (W_c \times S_c) + (W_d \times S_d) + (W_e \times S_e) + (W_q \times S_q)$$

| Factor | Default Weight | Description |
| :--- | :---: | :--- |
| **Urgency ($S_u$)** | **40%** | Code Red traumas and emergency surgical interventions receive highest priority. |
| **Compatibility ($S_c$)** | **25%** | Strict ABO/Rh immunohematology clinical rules (zero incompatible matches). |
| **ETA / Distance ($S_d$)** | **15%** | Proximity and verified transit time to the destination hospital. |
| **FEFO Expiry ($S_e$)** | **10%** | Prioritizes usable batches closer to expiration to reduce clinical waste. |
| **Quantity Coverage ($S_q$)** | **10%** | Higher scores for depots able to satisfy complete unit requirements. |

---

## 📊 Expected Impact: Traditional Approach vs. BloodBridge

| Metric / Dimension | Traditional / Legacy Approach | BloodBridge Platform |
| :--- | :--- | :--- |
| **Data Synchronization** | Static lists updated manually | **Real-time event-driven feeds** |
| **Match Generation** | 30–90 minutes via manual calls | **< 2 seconds automated matching** |
| **Donor Engagement** | Broad, uncoordinated broadcasts | **Targeted fallback only on inventory deficit** |
| **Wastage Prevention** | Nearest-unit only (high expiry risk) | **FEFO-aware shelf-life prioritization** |
| **Lifecycle Tracking** | Open-ended (duplicate calls persist) | **Closed-loop auto-cancellation upon fulfillment** |
| **Explainability** | Opaque manual decisions | **100% transparent weighted scoring & audit log** |

---

## 🛠️ Technology Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS, Lucide Icons
- **Animation & Audio**: Modern CSS transitions, Web Audio API synthesis
- **State Management**: Reactive multi-role state machine with closed-loop synchronization
- **Mapping**: Dynamic SVG vector radar with real-time beacon telemetry
- **Bundler & Build**: Vite, ESBuild

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/bloodbridge.git

# Navigate to the project directory
cd bloodbridge

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Build for Production
```bash
npm run build
```

---

## 🎯 Demo Scenarios

The application includes pre-configured demo scenarios accessible from the header:
1. **Scenario 1: Code Red O- Trauma** — Massive hemorrhage requiring immediate emergency uncrossmatched blood.
2. **Scenario 2: Platelet Shortfall + Donor Fallback** — Obstetric emergency triggering targeted opt-in donor alerts.
3. **Scenario 3: FEFO Wastage Prevention** — Dynamic prioritization of near-expiry inventory.
4. **Scenario 4: Multi-Unit Disaster Emergency** — Multi-casualty incident coordinating distributed network fulfillment.

---

## 👥 Authors & Team
- **Eram Khan** ([eramkhan23391@gmail.com](mailto:eramkhan23391@gmail.com))
- **Roshan Ali**
