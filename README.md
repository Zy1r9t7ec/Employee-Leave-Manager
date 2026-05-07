# Employee Leave Management System

A full-stack application for managing employee leave requests with role-based access control (Employee, Manager, HR Admin).

## Tech Stack

- **Backend:** Node.js + Express.js + MongoDB
- **Frontend:** React.js
- **Email:** Nodemailer (with Mailtrap for testing)
- **Reports:** JSP + Apache Tomcat

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and email credentials
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# App opens on http://localhost:3000
```

## Documentation

All documentation is in the `/docs` folder. Start with [docs/README.md](docs/README.md) for navigation.

## Project Structure

See [docs/13-folder-structure.md](docs/13-folder-structure.md) for detailed folder organization.

## Deployment & Monitoring (Phase 5)

This application is configured for robust production deployment:
- **CI/CD:** Github Actions pipeline configured in `.github/workflows/ci.yml`.
- **Monitoring:** Uptime and health can be monitored via `GET /api/health`.
- **Production Infrastructure:**
  - Frontend: Deployable to Netlify or Vercel.
  - Backend: Node.js/Express deployable to AWS EC2, Heroku, or Render.
  - Database: MongoDB Atlas.
  - Reporting: Apache Tomcat for serving `.jsp` files (can run parallel on backend VM).
  - Email: Configure `MAIL_*` env vars to a production SMTP provider like SendGrid.
