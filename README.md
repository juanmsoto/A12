# DevSecOps Demo Application

A minimal but complete demo application for university assignments covering **DevSecOps**, **Hypothesis-Driven Development (HDD)**, **Feature Toggles**, **Security Design**, and **Reliability Engineering**.

## 📋 Overview

This application demonstrates:

- **Assignment 11**: DevSecOps + Feature Toggling + HDD
- **Assignment 12**: Reliability Engineering (logs, metrics, SLI/SLO/SLA, runbooks, chaos engineering plan)

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and set your `JWT_SECRET` (use a strong random string in production):
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=3000
   FEATURE_WELCOME_BANNER=true
   FEATURE_SPAM_REPORT_BUTTON=true
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Default Credentials

- **Email**: `test@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
.
├── src/
│   ├── app.js                 # Main Express application
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   ├── featureToggles.js # Feature toggle configuration
│   │   └── logging.js        # Winston logger setup
│   ├── routes/
│   │   ├── auth.js           # Login endpoint
│   │   ├── dashboard.js      # Dashboard route
│   │   ├── messages.js       # Messages and spam reporting
│   │   └── health.js         # Health check endpoint
│   ├── services/
│   │   └── spamService.js    # Spam reporting service
│   ├── metrics/
│   │   └── metrics.js        # Prometheus metrics setup
│   └── views/
│       ├── login.ejs         # Login page
│       ├── dashboard.ejs     # Dashboard page
│       └── messages.ejs      # Messages page
├── config/
│   └── toggles.json          # Default feature toggle values
├── docs/
│   ├── reliability.md        # SLI/SLO/SLA documentation
│   └── runbooks.md           # Incident response runbooks
├── package.json
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔐 Authentication

The application uses **JWT (JSON Web Tokens)** for authentication.

### Login Flow

1. POST to `/login` with email and password
2. On success, receive a JWT token
3. Include token in `Authorization: Bearer <token>` header for protected routes

### Protected Routes

All routes except `/login`, `/health`, and `/metrics` require authentication.

## 🎛️ Feature Toggles

The application implements two feature toggles for **Hypothesis-Driven Development**:

### Feature 1: Welcome Banner (`FEATURE_WELCOME_BANNER`)

**Hypothesis**: "If we show a welcome banner after login with a clear benefit message, then the % of users who visit the dashboard will increase."

- **When ON**: Dashboard displays a welcome banner
- **When OFF**: Dashboard shows no banner

### Feature 2: Spam Report Button (`FEATURE_SPAM_REPORT_BUTTON`)

**Hypothesis**: "If we add a one-click 'report spam' button on a page, the number of support tickets related to spam will decrease."

- **When ON**: Messages page shows "Report Spam" buttons
- **When OFF**: Buttons are hidden

### Configuring Feature Toggles

Feature toggles can be configured in two ways (environment variables take precedence):

1. **Environment Variables** (`.env` file):
   ```env
   FEATURE_WELCOME_BANNER=true
   FEATURE_SPAM_REPORT_BUTTON=false
   ```

2. **JSON Config File** (`config/toggles.json`):
   ```json
   {
     "FEATURE_WELCOME_BANNER": false,
     "FEATURE_SPAM_REPORT_BUTTON": false
   }
   ```

## 📊 API Endpoints

### Public Endpoints

- `GET /` - Redirects to login
- `GET /login` - Login page
- `POST /login` - Authenticate and get JWT token
- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics (Prometheus format)

### Protected Endpoints (Require JWT)

- `GET /dashboard` - User dashboard
- `GET /messages` - List messages
- `POST /report-spam/:id` - Report a message as spam

## 🔒 Security Features

### Authentication & Authorization

- JWT-based authentication
- Protected routes using middleware
- Token expiration (24 hours)
- Environment variable for JWT secret

### Security Best Practices

- Secrets stored in environment variables (not in code)
- Input validation on login endpoint
- Error messages don't leak sensitive information
- Comments in code explain security boundaries

## 📈 Observability

### Logging

The application uses **Winston** for structured logging. Logs include:

- HTTP requests (method, path, user, feature toggles, status, duration)
- Errors (with stack traces)
- Important events (login success/failure, spam reports)

Log levels: `info`, `warn`, `error`

### Metrics

Prometheus metrics are exposed at `/metrics`. Metrics include:

- `http_requests_total` - Total HTTP requests by route and status code
- `http_request_duration_seconds` - Request duration histogram
- `spam_reports_total` - Total spam reports submitted

### Health Check

The `/health` endpoint returns:
- Service status
- Uptime
- Timestamp

## 🛠️ Software Composition Analysis (SCA)

This project is **SCA-friendly** and can be scanned for vulnerabilities:

### Using GitHub Dependabot

If this repository is on GitHub, Dependabot will automatically:
- Scan `package.json` for known vulnerabilities
- Create pull requests to update vulnerable dependencies

### Manual SCA Tools

You can use tools like:
- `npm audit` - Built into npm
- Snyk
- WhiteSource
- Sonatype Nexus

### Fixing Vulnerabilities

When vulnerabilities are found:
1. Review the security advisory
2. Update the dependency version in `package.json`
3. Run `npm install` to update
4. Test the application
5. Commit the changes

Example:
```bash
npm audit
npm audit fix
```

## 📚 Documentation

Additional documentation is available in the `docs/` directory:

- **`docs/reliability.md`** - SLI/SLO/SLA definitions and examples
- **`docs/runbooks.md`** - Incident response runbooks

## 🧪 Development

### Running in Development Mode

Install `nodemon` (already in devDependencies) and run:
```bash
npm run dev
```

This will automatically restart the server on file changes.

## 📝 Assignment Context

This application is designed for:

- **Assignment 11**: DevSecOps + Feature Toggling + HDD
  - Demonstrates feature toggles
  - Shows hypothesis-driven development
  - Implements security best practices

- **Assignment 12**: Reliability Engineering
  - Logging and metrics
  - SLI/SLO/SLA definitions
  - Runbooks for incident response
  - Health checks

## 🎯 Key Concepts Demonstrated

1. **Feature Toggles**: Enable/disable features without code changes
2. **JWT Authentication**: Secure API access
3. **Structured Logging**: Winston for observability
4. **Prometheus Metrics**: Standard metrics format
5. **Health Checks**: Service availability monitoring
6. **Security Design**: Environment variables, middleware, comments
7. **SCA Compatibility**: Standard package.json structure

## ⚠️ Important Notes

- This is a **demo/educational application**, not production-ready
- Hard-coded credentials are used for simplicity
- No database is used (data is in-memory)
- JWT secret should be changed in production
- Feature toggles are simple (no advanced toggle service)

## 📄 License

MIT

## 🤝 Contributing

This is a university assignment demo. Feel free to use it as a reference or starting point for your own projects.

---

**Built for DevSecOps and Reliability Engineering assignments**

