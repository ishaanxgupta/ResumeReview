# Resume Review Platform

A comprehensive web-based platform for resume upload and review management with magic link authentication, drag & drop upload, and admin review capabilities.
Frontend - https://resumeflow.vercel.app/
Backend - https://resumereview-t238.onrender.com
## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** - DEPLOYED using ATLAS
- **Magic Link Authentication** with JWT tokens
- **Email Service** Twilio SendGRID Emailing Service

### Frontend
- **Next.js**

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/ishaanxgupta/ResumeReview
cd resume-review-platform
```

### 2. Install dependencies

# Install backend dependencies
```bash
cd server
npm install
```

# Install frontend dependencies
```bash
cd client
npm install
```

### 3. Environment Setup

#### Backend Environment (.env in server folder)
```env
MONGODB_URI = mongodb://localhost:27017/resume-review (for development)
MONGODB_URI = mongodb+srv://<user_id>:<pwd>cluster0.u8sad5z.mongodb.net/resume_flow?retryWrites=true&w=majority&appName=Cluster0 (for production) 
JWT_SECRET=your_jwt_secret_here

FRONTEND_URL=http://localhost:3000 (change for production)
PORT=5000 (change to 10000 for production)
NODE_ENV = development (change to production for production)
SENDGRID_API_KEY = "your_twilio_sendgrid_api_key"
```

#### Frontend Environment (.env.local in client folder)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api (change in production)
```

### 4. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the necessary collections and indexes.

## Running the Application

### Development Mode
# From server
```bash
npm start
```

# From client
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).


## API Endpoints

### Authentication
- `POST /api/auth/request-magic-link` - Request magic link
- `GET /api/auth/verify` - Verify magic link and login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Resumes
- `POST /api/resumes/upload` - Upload resume (authenticated)
- `GET /api/resumes/my-resumes` - Get user's resumes (authenticated)
- `GET /api/resumes/all` - Get all resumes (admin only)
- `GET /api/resumes/:id` - Get specific resume (admin only)
- `PUT /api/resumes/:id/review` - Update resume review (admin only)
- `DELETE /api/resumes/:id` - Delete resume (admin only)

## Future Improvements
- Enforce short-lived magic-link tokens, single-use consumption, and IP/user-agent binding
- Toggle between dark and light mode
- Add idempotency keys for magic-link requests to prevent spamming
- Health, readiness, and liveness endpoints with dependency checks
- Rate limiting per route and per action
- skeleton loaders for key pages
- Accessibility pass (focus management, keyboard nav, ARIA, color contrast)
- Connection pooling for DB, indexes for frequent queries, pagination on lists
- Add integration tests for user flow
- Fix Download Button 

## Design choices
- Gmail SMTP on free-tier hosting services (like Render) often runs into authentication and deliverability issues (e.g., blocked ports, OAuth complexity). Twilio’s SendGrid API offers a more reliable, production-friendly solution for transactional emails.
- Render provides an easy deployment pipeline with managed services, automatic HTTPS, and free-tier options—making it quick to spin up a production-ready Node/Express backend.
- Next.js chosen for server-side rendering (SSR) and built-in SEO optimizations, which ensure faster first-page loads and better discoverability compared to client-only frameworks.
- MongoDB - Used for its flexible schema design, which is ideal for storing unstructured data like resumes and review statuses. MongoDB’s JSON-like document model makes it simple to evolve the schema as the platform grows (e.g., adding notes, scores, statuses). Its scalability and integration with Node.js (via Mongoose or the official driver) make it a natural fit.
- Keeping frontend (Next.js) and backend (Express API) in a single monorepo simplifies development, testing, and deployment.


