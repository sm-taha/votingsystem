# Online Voting System

A secure, modern web-based voting system built with Next.js, TypeScript, and SQL Server for conducting transparent elections .

## 🚀 Features

- **Real-time Election Management**: Create and manage elections with start/end times
- **Candidate Registration**: Add candidates with party affiliations and constituencies
- **Secure Voting**: One vote per CNIC per election with validation
- **Live Results**: Real-time vote counting and results display
- **Pakistani Context**: Built-in support for Pakistani constituencies and electoral system
- **Responsive Design**: Modern UI that works on all devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Microsoft SQL Server with sqlcmd
- **UI Components**: Shadcn/ui
- **Authentication**: CNIC-based voter validation

## 📋 Prerequisites

- Node.js 18+
- Microsoft SQL Server (Local/Express)
- SQL Server Command Line Utilities (sqlcmd)

## ⚡ Quick Start

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

#### 6. Access the System

Open your browser and go to: `http://localhost:3000`

### 🚀 One-Command Setup (After Clone)

For experienced users with MS SQL Server already running:

```bash
npm install && copy .env.local.template .env.local && sqlcmd -S localhost -E -i scripts/database-setup.sql && sqlcmd -S localhost -E -d VotingSystemDB -i scripts/insert-sample-data.sql && npm run dev
```

Then visit `http://localhost:3000`

### 🎯 Quick Test

1. Go to **Elections** page
2. Click on any active election
3. Click **Vote Now**
4. Enter any valid CNIC format (e.g., `12345-1234567-1`)
5. Select a candidate and submit your vote
6. Check **Results** page to see your vote counted

## 🗳️ How to Use

### For Administrators

1. **Create Election**: Set election details, dates, and voting period
2. **Add Candidates**: Register candidates with party and constituency info
3. **Monitor Results**: View real-time voting statistics

### For Voters

1. **Browse Elections**: View active elections
2. **Cast Vote**: Select candidate and submit with CNIC verification
3. **View Results**: Check election outcomes after voting ends

## 📁 Project Structure

```
votingsystem/
├── src/app/           # Next.js pages and API routes
├── lib/               # Database logic and server actions
├── components/        # Reusable UI components
├── scripts/          # Database setup scripts
└── public/           # Static assets
```

## 🔧 Key Components

- **`lib/actions.ts`**: Server actions for elections, voting, candidates
- **`lib/db-sqlcmd.ts`**: SQL Server database connection and query execution
- **`scripts/database-setup.sql`**: Complete database schema
- **`src/app/elections/`**: Election browsing and voting pages

## 📊 Database Schema

Core tables:

- `Elections`: Election metadata and timing
- `Candidates`: Candidate information and party affiliation
- `Voters`: Voter registration data
- `OnlineVotes`: Secure vote records with CNIC validation

## 🔒 Security Features

- **CNIC Validation**: Prevents duplicate voting
- **Vote Integrity**: Secure vote casting with foreign key constraints
- **SQL Injection Protection**: Parameterized queries throughout
- **Election Timing**: Automatic status updates based on voting periods

## 🚀 Deployment

For production deployment:

1. Configure production SQL Server connection
2. Set environment variables in production
3. Build and deploy: `npm run build && npm start`

## 🔧 Troubleshooting

### Common Setup Issues

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

**Permission Issues:**

- Run Command Prompt as Administrator
- Or use SQL Server Authentication instead of Windows Authentication

**Port 3000 Already in Use:**

```bash
# Use different port
npm run dev -- -p 3001
```

### Need Help?

- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 18+)
- Ensure SQL Server is accessible: `sqlcmd -S localhost -E -Q "SELECT @@VERSION"`

## 🤝 Contributing

This project is designed for educational and demonstration purposes. Feel free to extend functionality or adapt for other electoral systems.

## 📄 License

Built for academic/educational use. Adapt as needed for your requirements.

---

**Ready for Production** ✅ - Clean codebase, working features, comprehensive documentation.
