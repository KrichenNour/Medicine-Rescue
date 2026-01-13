# 🩺 Medicine Rescue – MedSurplus Connect

MedSurplus Connect is a web platform that helps healthcare facilities and individuals redistribute surplus medical supplies to institutions and people in need.  
Every user can act as both a **donor** (by adding supplies) and a **recipient** (by requesting supplies).

---

## 🚀 Features

- 🔐 Authentication (Sign up / Log in)
- 👤 Single user type: each user can donate and request
- 📦 Add surplus medicines and supplies
- 🔎 Search and filter available supplies
- 🗺️ Map view to locate supplies geographically
- 📨 Messaging between users
- 📄 Request system to track supply requests
- 📊 Dashboard for managing supplies and requests

---
## 🧰 Tech Stack

### Frontend
- Next.js (React, App Router)
- TypeScript
- Tailwind CSS
- Leaflet / ArcGIS for maps

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication

---

## 🔑 User Flow

1. User signs up and logs in  
2. User can add medical supplies (acts as donor)  
3. User can request supplies from others (acts as recipient)  
4. Users can chat about a request  
5. Request status is updated  

---
## 🗺️ Map Integration

-Uses ArcGIS
-Shows supply locations
-Shows user location
-Route planning to supplies
---

## ⚙️ Installation & Setup

### 1. Clone the project

```bash
git clone https://github.com/your-username/Medicine-Rescue.git
cd Medicine-Rescue
```
### 2. Run Frontend
```bash
cd app
npm install
npm run dev

```
### 3. Run Backend
```bash
cd backend
npm install
npm run dev

```

---
