# CodeMate — Personal Coding Companion

> **Production Deployment Architecture Preparation (Render + Supabase)**

CodeMate is a full-stack personal coding companion designed for students and developers to track coding problems, categorize by Logic & DSA, organize by topics, maintain coding streaks, meet daily targets, and interact with an AI coding companion (CodeCat).

---

## 1. Final Deployment Architecture

```text
User Browser
     │
     ▼ (HTTPS)
[Render Static Site] ── React 19 + Vite (dist)
     │
     ▼ (REST / JWT via VITE_API_BASE_URL)
[Render Web Service] ── Spring Boot 3.3.x (Port: $PORT / 8080)
     │
     ├──────► [Supabase PostgreSQL] (JDBC + HikariCP + SSL)
     ├──────► [Google Cloud OAuth 2.0] (Spring Security OpenID Connect)
     ├──────► [GitHub OAuth 2.0] (Spring Security OAuth App)
     └──────► [External AI Provider] (CodeCat Gemini API / AI Gateway)
```

### Architectural Highlights
1. **Frontend:** React 19 + Vite compiled to pure static assets (`dist`), deployed on **Render Static Site**. Zero Node.js runtime required in production.
2. **Backend:** Spring Boot 3.3.x running on Java 17, deployed as a **Render Web Service** with automated PORT binding (`server.port=${PORT:8080}`) and non-root user execution.
3. **Database:** **Supabase PostgreSQL** via standard PostgreSQL JDBC driver with HikariCP connection pooling and SSL mode (`sslmode=require`).
4. **Authentication:** Pure Spring Security with stateless HMAC-SHA256 JWT, BCrypt password hashing, official Google OAuth 2.0 / OpenID Connect, and official GitHub OAuth 2.0.
5. **AI Companion:** **CodeCat** runs 100% server-side through Spring Boot. AI credentials (`AI_API_KEY`) remain strictly protected on the backend.

---

## 2. Local Development

### Prerequisites
- Node.js 18+ & npm
- Java 17+ (JDK) & Apache Maven 3.8+
- PostgreSQL database (Local or Cloud Supabase instance)

### A. Run Spring Boot Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set local environment variables (or create `backend/.env`):
   ```bash
   export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/codemate_db"
   export SPRING_DATASOURCE_USERNAME="postgres"
   export SPRING_DATASOURCE_PASSWORD="your_postgres_password"
   export SPRING_JPA_HIBERNATE_DDL_AUTO="update"
   export SERVER_PORT="8080"
   export JWT_SECRET="your-256-bit-secure-jwt-secret-key-goes-here"
   export FRONTEND_URL="http://localhost:3000"
   export AI_API_KEY="your_optional_gemini_api_key"
   ```
3. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will be available at `http://localhost:8080` with safe health diagnostics at `http://localhost:8080/api/health`.

### B. Run React Frontend
1. In the project root directory:
   ```bash
   npm install
   npm run dev
   ```
2. Access the frontend preview at `http://localhost:3000`.

---

## 3. Supabase PostgreSQL Setup

1. **Create a Supabase Project:**
   - Log into [Supabase](https://supabase.com) and create a new project.
   - Set a strong database password and select your preferred region.

2. **Obtain Connection Details:**
   - Go to **Project Settings** → **Database** → **Connection string**.
   - Select the **JDBC** or **URI** tab.
   - Format:
     ```text
     jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require
     ```
     *(Or use Supabase Transaction/Session Pooler on port 6543 for serverless scale).*

3. **Configure in Render Backend:**
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `postgres` (or `postgres.<PROJECT_REF>`)
   - `SPRING_DATASOURCE_PASSWORD`: `<YOUR_SUPABASE_DB_PASSWORD>`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`

Upon initial launch, Hibernate automatically verifies and generates the 5 core tables:
- `users`
- `problems`
- `user_settings`
- `conversations`
- `messages`

---

## 4. Render Frontend Deployment (Static Site)

1. Create a new **Static Site** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure settings:
   - **Name:** `codemate-frontend` (or your choice)
   - **Root Directory:** `.` (leave empty / root)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Environment Variables:**
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://<your-render-backend-name>.onrender.com` | Production Spring Boot API base URL |
   | `VITE_APP_ENV` | `production` | Production environment flag |
5. **Client-Side Routing / Rewrites:**
   - In Render Static Site settings under **Redirects/Rewrites**:
     - **Source:** `/*`
     - **Destination:** `/index.html`
     - **Action:** `Rewrite`

---

## 5. Render Backend Deployment (Web Service)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure settings:
   - **Name:** `codemate-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Java` or `Docker`
   - **Build Command:** `mvn clean package -DskipTests` (or `./mvnw clean package -DskipTests`)
   - **Start Command:** `java -jar target/codemate-backend.jar`
   - **Health Check Path:** `/api/health`
4. **Environment Variables:**
   | Variable | Example / Description |
   |---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` |
   | `SPRING_DATASOURCE_PASSWORD` | `<YOUR_SUPABASE_PASSWORD>` |
   | `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
   | `JWT_SECRET` | Secure 256-bit secret string for HMAC-SHA256 |
   | `JWT_EXPIRATION_MS` | `86400000` (24 hours) |
   | `FRONTEND_URL` | `https://<your-render-frontend-name>.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://<your-render-frontend-name>.onrender.com,http://localhost:3000` |
   | `GOOGLE_CLIENT_ID` | `<YOUR_GOOGLE_CLIENT_ID>` (Optional for Google OAuth) |
   | `GOOGLE_CLIENT_SECRET` | `<YOUR_GOOGLE_CLIENT_SECRET>` (Optional for Google OAuth) |
   | `GITHUB_CLIENT_ID` | `<YOUR_GITHUB_CLIENT_ID>` (Optional for GitHub OAuth) |
   | `GITHUB_CLIENT_SECRET` | `<YOUR_GITHUB_CLIENT_SECRET>` (Optional for GitHub OAuth) |
   | `AI_API_KEY` | `<YOUR_GEMINI_API_KEY>` (Optional for CodeCat Gemini AI) |
   | `AI_MODEL` | `gemini-2.5-flash` |
   | `AI_BASE_URL` | `https://generativelanguage.googleapis.com` |

---

## 6. Google OAuth 2.0 Production Configuration

To enable official Google Sign-In with Spring Boot:
1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Create or edit an **OAuth 2.0 Client ID** (Web application).
3. **Authorized JavaScript Origins:**
   - `http://localhost:3000` (Local development)
   - `https://<your-render-frontend-name>.onrender.com` (Render Static Site)
4. **Authorized Redirect URIs:**
   - `http://localhost:8080/login/oauth2/code/google` (Local development)
   - `https://<your-render-backend-name>.onrender.com/login/oauth2/code/google` (Render Web Service)
5. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to Render Backend environment variables.

---

## 7. GitHub OAuth 2.0 Production Configuration

To enable official GitHub Authentication with Spring Boot:
1. Open [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps**.
2. Click **New OAuth App**:
   - **Application name:** `CodeMate`
   - **Homepage URL:** `https://<your-render-frontend-name>.onrender.com` (or `http://localhost:3000` for local dev)
   - **Authorization callback URL:**
     - Local development: `http://localhost:8080/login/oauth2/code/github`
     - Render Web Service: `https://<your-render-backend-name>.onrender.com/login/oauth2/code/github`
3. Generate a new **Client Secret**.
4. Set the following environment variables on your Render Backend Web Service:
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
5. **How it works:**
   - User clicks **Continue with GitHub** on the CodeMate login screen.
   - Spring Security redirects the browser to `https://github.com/login/oauth/authorize`.
   - After authorization, GitHub redirects to `/login/oauth2/code/github`.
   - Spring Security verifies the identity, retrieves verified email via GitHub API if private, provisions/links the CodeMate user, and redirects to the frontend with a signed JWT.

---

## 8. CodeCat AI Production Configuration

CodeCat companion features are managed entirely backend-side:
- **Backend Key Handling:** `AI_API_KEY` is loaded into Spring Boot only and never exposed to the frontend bundle.
- **Provider Architecture:** CodeCat queries the configured real AI provider (Google Gemini) through Spring Boot.
- **Error Handling:** If `AI_API_KEY` is missing, invalid, rate-limited, or the provider is unavailable, the backend returns a clean application-level error (`AiServiceUnavailableException`) and the frontend displays a friendly CodeCat unavailable notification. No simulated or hardcoded Java fallbacks are used.

---

## 9. Health Diagnostics (`/api/health`)

Check the backend health status:
```bash
curl -i https://<your-render-backend-name>.onrender.com/api/health
```

**Expected Response (HTTP 200 OK):**
```json
{
  "status": "UP",
  "database": "UP (PostgreSQL 16.x)",
  "databaseConnected": true,
  "service": "CodeMate Spring Boot Backend",
  "version": "1.0.0"
}
```
*Sensitive passwords, tokens, and credentials are never leaked in health or diagnostic responses.*
