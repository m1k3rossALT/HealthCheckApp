# HealthCheckApp

A simple web-based health monitoring tool to check the status of URLs and their login accessibility.

## 🔧 Features

- ✅ Categorized URL monitoring
- ✅ Status indication (Green/Orange/Red)
- ✅ Failures listed per category
- ✅ Dropdowns to view URLs per category
- ✅ Backend with Express + Axios for SSL-bypassed checks

## 🚀 How to Run

### Frontend

```bash
Open index.html in your browser


Backend (Node.js)
bash
Copy
Edit
cd backend
npm install
node server.js
Make sure your urls.json is placed inside backend/ and properly formatted.

🧪 Tech Stack
HTML/CSS/JavaScript

Node.js

Express

Axios

📁 Project Structure
pgsql
Copy
Edit
HealthCheckApp/
│
├── backend/
│   ├── server.js
│   ├── checkUrls.js
│   └── urls.json
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── index.js
│
├── .gitignore
└── README.md

## 📊 API Flow Diagram

This diagram shows how the frontend interacts with backend APIs:

![API Flow](./docs/api-flow-diagram.png)