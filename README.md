# Expense Tracker — Full-Stack Application

A production-ready full-stack **Expense Tracker** application that allows users to register, log in, and manage their personal income and expenses. Built with modern technologies and best practices.

## 🛠 Tech Stack

| Layer             | Technology                     |
| ----------------- | ------------------------------ |
| **Backend**       | Node.js + Express.js           |
| **Frontend**      | Next.js 14 (React)             |
| **Database**      | PostgreSQL                     |
| **ORM**           | Prisma                         |
| **Authentication**| JWT (JSON Web Tokens)          |
| **Validation**    | Zod                            |
| **Containerization** | Docker + Docker Compose     |

## ✨ Features

- **User Authentication** — Register and login with email/password (bcrypt hashing + JWT)
- **Financial Dashboard** — View total income, total expenses, and balance at a glance
- **Transaction Management** — Full CRUD for income and expense transactions
- **Category Management** — Full CRUD for custom categories (INCOME / EXPENSE types)
- **Filtering & Search** — Filter transactions by type, category, and date range
- **Pagination** — Server-side pagination for transactions
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- **Docker Support** — One-command deployment with Docker Compose

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v14 or higher) — [Download](https://www.postgresql.org/download/)
- **Docker & Docker Compose** (optional, for containerized deployment) — [Download](https://www.docker.com/)

## 📁 Project Structure

```
Expense_Tracker__Nasor_Hidar/
├── backend/                      # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.js               # Database seed script
│   ├── src/
│   │   ├── config/               # Environment & database config
│   │   ├── middlewares/           # Auth, validation, error handling
│   │   ├── modules/
│   │   │   ├── auth/             # Authentication module
│   │   │   ├── category/         # Category CRUD module
│   │   │   └── transaction/      # Transaction CRUD module
│   │   ├── utils/                # Helpers (ApiError, catchAsync, response)
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/                     # Next.js 14 Application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── (auth)/           # Login & Register pages
│   │   │   └── (dashboard)/      # Dashboard, Transactions, Categories
│   │   ├── components/           # Reusable React components
│   │   ├── context/              # Auth context provider
│   │   └── lib/                  # API client & utilities
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Installation & Setup

### Option 1: Run with Docker (Recommended)

The easiest way to run the entire application:

```bash
# Clone the repository
git clone <repository-url>
cd Expense_Tracker__Nasor_Hidar

# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up --build
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

### Option 2: Run Locally (Without Docker)

#### 1. Set up the Database

Make sure PostgreSQL is running, then create the database:

```bash
# Connect to PostgreSQL and create database
psql -U postgres
CREATE DATABASE expense_tracker;
\q
```

#### 2. Set up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your database credentials if needed

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with demo data
npm run db:seed

# Start the backend server
npm run dev
```

The backend will start on **http://localhost:5000**.

#### 3. Set up the Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start the frontend dev server
npm run dev
```

The frontend will start on **http://localhost:3000**.

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable       | Default Value                                      | Description                    |
| -------------- | -------------------------------------------------- | ------------------------------ |
| `PORT`         | `5000`                                             | API server port                |
| `NODE_ENV`     | `development`                                      | Environment mode               |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public` | PostgreSQL connection string   |
| `JWT_SECRET`   | `your-super-secret-jwt-key-change-in-production`   | Secret key for JWT signing     |
| `JWT_EXPIRES_IN` | `7d`                                             | JWT token expiration duration  |

### Frontend (`frontend/.env.local`)

| Variable              | Default Value                    | Description          |
| --------------------- | -------------------------------- | -------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:5000/api`      | Backend API base URL |

## 🗄 Database Schema

The application uses three main tables:

### Users
| Column    | Type     | Constraints        |
| --------- | -------- | ------------------ |
| id        | UUID     | Primary Key        |
| fullName  | String   | Required           |
| email     | String   | Unique, Required   |
| password  | String   | Hashed, Required   |
| createdAt | DateTime | Auto-generated     |
| updatedAt | DateTime | Auto-updated       |

### Categories
| Column    | Type            | Constraints                 |
| --------- | --------------- | --------------------------- |
| id        | UUID            | Primary Key                 |
| name      | String          | Required                    |
| type      | INCOME/EXPENSE  | Enum, Required              |
| userId    | UUID            | Foreign Key → Users         |
| createdAt | DateTime        | Auto-generated              |
| updatedAt | DateTime        | Auto-updated                |

*Unique constraint on (name, type, userId)*

### Transactions
| Column          | Type            | Constraints                    |
| --------------- | --------------- | ------------------------------ |
| id              | UUID            | Primary Key                    |
| title           | String          | Required                       |
| amount          | Decimal(12,2)   | Required, Positive             |
| type            | INCOME/EXPENSE  | Enum, Required                 |
| categoryId      | UUID            | Foreign Key → Categories       |
| transactionDate | DateTime        | Required                       |
| userId          | UUID            | Foreign Key → Users            |
| createdAt       | DateTime        | Auto-generated                 |
| updatedAt       | DateTime        | Auto-updated                   |

### Migration Commands

```bash
# Create a new migration
cd backend
npx prisma migrate dev --name <migration_name>

# Apply migrations to production
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint             | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register` | No   | Register a new user      |
| POST   | `/api/auth/login`    | No   | Login and receive JWT    |
| GET    | `/api/auth/me`       | Yes  | Get current user profile |

### Categories
| Method | Endpoint               | Auth | Description              |
| ------ | ---------------------- | ---- | ------------------------ |
| GET    | `/api/categories`      | Yes  | List all categories      |
| POST   | `/api/categories`      | Yes  | Create a category        |
| PUT    | `/api/categories/:id`  | Yes  | Update a category        |
| DELETE | `/api/categories/:id`  | Yes  | Delete a category        |

### Transactions
| Method | Endpoint                      | Auth | Description                          |
| ------ | ----------------------------- | ---- | ------------------------------------ |
| GET    | `/api/transactions`           | Yes  | List transactions (with filters)     |
| GET    | `/api/transactions/summary`   | Yes  | Get financial summary                |
| POST   | `/api/transactions`           | Yes  | Create a transaction                 |
| PUT    | `/api/transactions/:id`       | Yes  | Update a transaction                 |
| DELETE | `/api/transactions/:id`       | Yes  | Delete a transaction                 |

**Transaction Filters (Query Parameters):**
- `type` — INCOME or EXPENSE
- `categoryId` — Filter by category UUID
- `startDate` — Start date (YYYY-MM-DD)
- `endDate` — End date (YYYY-MM-DD)
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20)
- `sortBy` — Sort field (transactionDate, amount, title, createdAt)
- `sortOrder` — asc or desc

## 🧪 Testing the API

You can test the API using cURL or any API client (Postman, Insomnia):

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Nasor Hidar", "email": "nasor@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nasor@example.com", "password": "password123"}'

# Use the token from login response for authenticated requests
# Get financial summary
curl http://localhost:5000/api/transactions/summary \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 📦 Packaging for Submission

To create the submission zip file:

```bash
# From the project root directory
# On Windows (PowerShell):
Compress-Archive -Path backend, frontend, docker-compose.yml, .gitignore, README.md -DestinationPath Expense_Tracker_Nasor_Hidar.zip

# On Linux/Mac:
zip -r Expense_Tracker_Nasor_Hidar.zip \
  backend/ frontend/ docker-compose.yml .gitignore README.md \
  -x "*/node_modules/*" "*/.next/*" "*/dist/*" "*/.env" "*/.env.local"
```

> **Important:** Make sure `node_modules/`, `.next/`, `dist/`, and `.env` files are excluded from the zip.

## 👤 Author

**Nasor Hidar**

---

*Built as part of the Ontik Technology Software Engineering Internship assignment.*