# 🚀 CodeBuddy API

Backend API for **CodeBuddy**, a developer networking and collaboration platform.

Built with **Node.js, Express.js, MongoDB, Socket.IO, JWT, and Razorpay**.

---

## 📸 Overview

CodeBuddy provides a platform where developers can:
*   👨‍💻 **Profiles:** Create and manage developer profiles
*   🔍 **Discovery:** Discover other developers
*   🤝 **Networking:** Send and manage connection requests
*   💬 **Chat:** Communicate through real-time chat
*   🔔 **Alerts:** Receive notifications
*   💎 **Premium:** Access premium features
*   💳 **Payments:** Make secure payments using Razorpay
*   🔐 **Security:** Authenticate securely using HTTP-only cookies

---

## 🚀 Features

*   User authentication with JWT
*   Secure HTTP-only cookie authentication
*   Developer profiles and profile updates
*   Developer feed with pagination
*   Connection requests
*   Real-time chat using Socket.IO
*   Razorpay premium payment integration
*   Email notifications
*   Centralized error handling
*   API validation and authorization
*   CORS configuration for frontend integration

---

## 🛠️ Tech Stack

*   **Node.js**
*   **Express.js**
*   **MongoDB + Mongoose**
*   **Socket.IO**
*   **JWT**
*   **bcrypt**
*   **Razorpay**
*   **Brevo**
*   **Docker**

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173
LOCAL_HOST=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

BREVO_API_KEY=your_brevo_api_key
```

> ⚠️ **Important:** Never commit your `.env` file or expose secret keys in the repository.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd codebuddy-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env` and add the required variables.

### 4. Start the development server
```bash
npm run dev
```

The backend will run on:
```text
http://localhost:3000
```

---

## 🔐 Authentication

CodeBuddy uses **JWT-based authentication** with HTTP-only cookies.

**Authentication flow:**
```text
Login / Signup
      ↓
JWT generated
      ↓
HTTP-only Cookie
      ↓
Authenticated API Requests
```

*Note: Passwords are hashed using **bcrypt** before being stored in MongoDB.*

---

## 💳 Payment

CodeBuddy uses **Razorpay** for premium membership payments.

**Payment flow:**
```text
Frontend
   ↓
Create Payment Order
   ↓
Backend
   ↓
Razorpay
   ↓
Payment
   ↓
Payment Verification
   ↓
Premium Membership
```

*Note: Payment credentials are kept server-side and are never exposed through the frontend.*

---

## 💬 Real-Time Chat

Real-time messaging is implemented using **Socket.IO**.

```text
User A
  ↕
Socket.IO Server
  ↕
User B
```

---

## 📡 Main API Routes

| Route | Purpose |
| :--- | :--- |
| `/auth` | Signup, login, logout |
| `/user` | User-related operations |
| `/profile` | Profile management |
| `/request` | Connection requests |
| `/payment` | Razorpay payment operations |

---

## 🐳 Docker

The backend can also be containerized using Docker.

```bash
docker build -t codebuddy-backend .
docker run -p 3000:3000 codebuddy-backend
```

---

## 📄 License

This project is built for learning, portfolio, and demonstration purposes.

