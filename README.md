# URL Shortener

A modern, full-stack URL Shortener application built using the MERN stack. It enables users to create, manage, and analyze shortened URLs with secure authentication, custom aliases, QR code generation, and click analytics through an intuitive dashboard.

## Live Demo

**Frontend:** https://url-shortner-frontend.vercel.app/

> Replace the above URL if your deployed frontend uses a different domain.

---

## Features

- User Registration and Login
- JWT Authentication (Access Token & Refresh Token)
- Secure Password Hashing using bcrypt
- Create Short URLs
- Custom Alias Support
- QR Code Generation for Short URLs
- URL Redirection
- Click Tracking and Analytics
- User Dashboard
- Copy URL with One Click
- Responsive UI
- Protected Routes
- RESTful API Architecture

---

## Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Cookie Parser
- CORS

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Architecture

```
                   React + Vite
                          │
                    Axios API Calls
                          │
                          ▼
                 Express.js REST API
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
 Authentication      URL Controller     Analytics
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                     MongoDB Atlas
```

---

## Folder Structure

```
URL_SHORTNER
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── context
│   │   ├── services
│   │   └── App.jsx
│   └── package.json
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── config
│   └── index.js
│
└── README.md
```

---

## Authentication Flow

```
User Login
     │
     ▼
Verify Credentials
     │
     ▼
Generate JWT Tokens
     │
     ├──────────► Access Token
     │
     └──────────► Refresh Token
                     │
                     ▼
             Stored Securely
                     │
                     ▼
         Protected API Requests
```

---

## URL Shortening Workflow

```
User enters URL
        │
        ▼
Validate URL
        │
        ▼
Generate Short Code
        │
        ▼
Save to MongoDB
        │
        ▼
Return Short URL
        │
        ▼
User Visits Short URL
        │
        ▼
Increment Click Count
        │
        ▼
Redirect to Original URL
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/devesh2206200/URL_SHORTNER.git
```

```
cd URL_SHORTNER
```

---

## Backend Setup

```
cd server
npm install
```

Create a `.env` file.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_secret

ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_secret

REFRESH_TOKEN_EXPIRY=7d

CLIENT_URL=http://localhost:5173
```

Start backend

```bash
npm run dev
```

---

## Frontend Setup

```
cd client
npm install
```

Create a `.env` file.

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend

```bash
npm run dev
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |
| POST | `/api/auth/logout` | Logout User |

---

### URL

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/url/shorten` | Create Short URL |
| GET | `/api/url/:shortCode` | Redirect URL |
| GET | `/api/url/user` | User URLs |
| DELETE | `/api/url/:id` | Delete URL |

---

## Security

- JWT Authentication
- Password Hashing with bcrypt
- Protected API Routes
- HTTP Only Cookies
- CORS Configuration
- Environment Variables
- MongoDB Validation

---

## Screenshots

### Home Page

_Add screenshot here_

### Dashboard

_Add screenshot here_

### Authentication

_Add screenshot here_

### Analytics

_Add screenshot here_

---

## Future Improvements

- URL Expiration
- Password Protected URLs
- Custom Domains
- Advanced Analytics
- Team Collaboration
- Dark Mode
- Bulk URL Import
- Download Analytics as CSV
- Email Notifications

---

## Author

**Devesh Gaur**

GitHub: https://github.com/devesh2206200

LinkedIn: https://www.linkedin.com/in/devesh-gaur-a00266297/

---

## License

This project is licensed under the MIT License.
