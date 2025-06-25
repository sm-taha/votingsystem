# Online Voting System

## 📋 Prerequisites

- Node.js 18+
- Microsoft SQL Server (Local/Express)
- SQL Server Command Line Utilities (sqlcmd)

### 🔄 Setting Up from GitHub

If you're cloning this project from GitHub, follow these steps:

#### 1. Clone and Navigate

```bash
git clone <your-github-repo-url>
cd votingsystem
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Database Setup (MS SQL Server Required)

```bash
# Create database and tables
sqlcmd -S localhost -E -i scripts/database-setup.sql

# Insert sample data for testing (optional)
sqlcmd -S localhost -E -d VotingSystemDB -i scripts/insert-sample-data.sql
```

#### 4. Environment Configuration

```bash
# Copy the environment template
copy .env.local.template .env.local
```

Edit `.env.local` with your SQL Server details:

```env
DB_SERVER=localhost
DB_DATABASE=VotingSystemDB
DB_TRUSTED_CONNECTION=true
```

#### 5. Start the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Key Components

- **`lib/actions.ts`**: Server actions for elections, voting, candidates
- **`lib/db-sqlcmd.ts`**: SQL Server database connection and query execution
- **`scripts/database-setup.sql`**: Complete database schema
- **`src/app/elections/`**: Election browsing and voting pages

**Database Connection Error:**

- Ensure SQL Server is running: `services.msc` → SQL Server service
- Check if sqlcmd is installed: `sqlcmd -?`
- Verify server name in `.env.local` (try `localhost`, `.\SQLEXPRESS`, or your computer name)

**"Database does not exist" Error:**

```bash
# Create database manually first
sqlcmd -S localhost -E -Q "CREATE DATABASE VotingSystemDB"
sqlcmd -S localhost -E -i scripts/database-setup.sql
```

### Need Help?

- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 18+)
- Ensure SQL Server is accessible: `sqlcmd -S localhost -E -Q "SELECT @@VERSION"`
