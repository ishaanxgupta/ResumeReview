# Resume Review Platform

A comprehensive web-based platform for resume upload and review management with magic link authentication, drag & drop upload, and admin review capabilities.

## Features

### User Features
- **Magic Link Authentication**: Secure, passwordless login via email
- **Resume Upload**: Drag & drop interface with PDF preview
- **Status Dashboard**: Track resume review status (Pending, Under Review, Approved, Needs Revision, Rejected)
- **Download Resumes**: Access previously uploaded resumes

### Admin Features
- **Resume Management**: View all uploaded resumes with filtering and search
- **Review System**: Update status, assign scores (0-100), add review notes, and tag resumes
- **Email Notifications**: Automatic email notifications when resume status changes
- **Statistics Dashboard**: Overview of all resumes and their statuses

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Magic Link Authentication** with JWT tokens
- **Email Service** with Nodemailer
- **File Upload** with Multer
- **Rate Limiting** for API protection

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React PDF** for PDF preview
- **React Dropzone** for file uploads
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Email service (Gmail, Outlook, etc.)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd resume-review-platform
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Backend Environment (.env in server folder)
```env
MONGODB_URI=mongodb://localhost:27017/resume-review
JWT_SECRET=your_jwt_secret_here_change_this_in_production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
PORT=5000
```

#### Frontend Environment (.env.local in client folder)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the necessary collections and indexes.

### 5. Email Configuration
For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

## Running the Application

### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## Usage

### 1. User Workflow
1. Visit `http://localhost:3000`
2. Enter your name and email to request a magic link
3. Check your email and click the magic link to login
4. Upload your resume using the drag & drop interface
5. View your resume status and download previous uploads

### 2. Admin Workflow
1. An admin user needs to be created manually in the database or through the API
2. Login with admin credentials
3. Access the admin panel at `/admin`
4. Review resumes, update status, assign scores, and add notes
5. Users will receive email notifications when their resume status changes

### Creating an Admin User
You can create an admin user by updating the user document in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

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
- `GET /api/resumes/:id/download` - Download resume file
- `PUT /api/resumes/:id/review` - Update resume review (admin only)
- `DELETE /api/resumes/:id` - Delete resume (admin only)

## File Structure

```
resume-review-platform/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── uploads/         # File upload directory
│   └── package.json
└── package.json         # Root package.json
```

## Security Features

- **Rate Limiting**: API endpoints are rate-limited
- **File Validation**: Only PDF files are accepted
- **File Size Limits**: 10MB maximum file size
- **Magic Link Expiration**: Links expire after 15 minutes
- **JWT Tokens**: Secure authentication with 7-day expiration
- **Input Validation**: All inputs are validated and sanitized

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.
