# Perfume E-Commerce & Admin Dashboard

A modern, full-stack e-commerce application built with **Next.js 16**, **Prisma**, and **PostgreSQL**. This project features a customer-facing storefront for purchasing fragrances and a robust Admin Dashboard for managing products, complex inventory batches, orders, and users.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS & Shadcn UI
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form & Zod
- **Charts:** Recharts
- **Authentication:** Better-Auth / NextAuth (Adapt based on your specific setup)

---

## 📋 Prerequisites & Minimum Requirements

Before you begin, ensure you have the following installed:

### 1. Node.js (Critical)

This project uses Next.js 16.

- **Minimum Requirement:** Node.js **v20.09.0** or later.
- **Recommended:** Node.js **v20.x (LTS)** or **v22.x**.

Check your version:

```bash
node -v
```

### 2. PostgreSQL (Database)

You must have a PostgreSQL database running locally or in the cloud.

**Option A: Local Installation**

- Download and install [PostgreSQL](https://www.postgresql.org/download/) for your OS.
- Ensure the service is running on port `5432` (default).

**Option B: Docker (Recommended)**
If you have Docker Desktop installed, you can spin up a database instantly:

```bash
docker run --name perfume-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

## 🚀 Getting Started

### Step 1: Clone & Install

```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)

cd your-repo-name

pnpm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```
Configure your PostgreSQL connection string in .env:
```bash
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/perfume_db?schema=public"
```

## Database Migration & Seeding
We use Prisma Migrate to manage database schema changes and Seeders to populate initial data (like admin users and categories).

## Run Migrations
This command creates the tables in your PostgreSQL database based on schema.prisma.

### 1. Run Migrations
```bash
npx prisma migrate
```
### 2. Generate Client
Ensure your TypeScript types are in sync with your database schema.
```bash
npx prisma generate
```

### 3. Seed the Database
```bash
pnpm seed
```