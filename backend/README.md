# FoodDelivery Backend (Express + MongoDB)

This is a minimal backend scaffold for the FoodDelivery project.

Features:
- User model with hashed passwords (bcrypt)
- Auth routes: signup, login, refresh, logout, me
- JWT-based access token + refresh token rotation using httpOnly cookie
- Helmet, CORS, rate-limit

Setup

1. Copy `.env.example` to `.env` and fill in values (MONGO_URI and JWT secrets).
2. Install dependencies:

```powershell
cd backend
npm install
```

3. Start server:

```powershell
npm start
```

Notes
- The refresh token is stored in the `jid` cookie and in the user document for simple revocation.
- In production, ensure `FRONTEND_ORIGIN` is set to your front-end URL and that HTTPS is used.
