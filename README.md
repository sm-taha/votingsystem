# Pakistani Online Voting System

A complete, production-ready **Pakistani Online Voting System** built with Next.js 14, TypeScript, and SQL Server integration. This system handles Pakistani elections with comprehensive candidate management, secure voting, and real-time results.

## 📋 **Project Status**: ✅ **PRODUCTION READY & CLEANED**

> **Database Schema**: Uses the complete Pakistani Online Voting System schema with `Elections`, `Candidates`, `Voters`, and `OnlineVotes` tables as defined in `SQLQuery1 Final Database.sql`.

## ✨ Features

- **🗳️ Pakistani Elections**: Complete support for Pakistani election system with CNIC-based voting
- **💾 SQL Server Integration**: Robust database backend with optimized Pakistani schema
- **🎨 Modern UI**: Responsive design with Tailwind CSS and Radix UI components
- **🔒 Secure Voting**: CNIC validation, duplicate prevention, and comprehensive security
- **📊 Live Results**: Real-time election results with vote percentages and winner determination
- **⏰ Smart Status Management**: Automatic election status computation (upcoming/active/completed)
- **🖥️ SSMS Compatible**: Full SQL Server Management Studio support for database management
- **👨‍💼 Admin Panel**: Create and manage Pakistani elections and candidates
- **📝 Election Creation**: Easy-to-use forms for creating new Pakistani elections
- **👥 Candidate Management**: Comprehensive candidate management with party affiliations and symbols
- **🛡️ Security**: CNIC format validation, age restrictions, and comprehensive data validation

## 🏗️ Database Schema

The system uses the **Pakistani Online Voting System** schema with the following core tables:

### **Core Tables**

- **Elections**: Pakistani election details with voting windows and status management
- **Candidates**: Pakistani candidates with party affiliations, symbols, and constituencies
- **Votes**: Secure vote records with CNIC-based voter identification

### **Key Features**:

- ✅ CNIC-based voter identification (Pakistani National ID)
- ✅ Foreign key constraints for data integrity
- ✅ Automatic timestamp generation
- ✅ Duplicate vote prevention with unique constraints
- ✅ Optimized indexes for performance
- ✅ Real-time status computation
- ✅ Pakistani constituency and province management

## 🚀 Setup Instructions

### 1. Database Setup

**Option A: Automated Setup (Recommended)**

```bash
# Run the automated setup script
setup-database.bat
```

**Option B: Manual Setup**

1. **Create the Database**:

   ```sql
   CREATE DATABASE OnlineVotingSystem;
   ```

2. **Run the Schema Script**:
   Execute the **application-aligned** database script: `d:\Taha\UMT\sem 4\DB\project\SQLQuery1 Final Database - Application Aligned.sql`

   **⚠️ Important**: Use the "Application Aligned" version, not the original SQL file, as it matches the application code structure.

3. **Verify Setup**:
   ```sql
   USE OnlineVotingSystem;
   SELECT COUNT(*) FROM Elections; -- Should return sample elections
   SELECT COUNT(*) FROM Candidates; -- Should return sample candidates
   SELECT COUNT(*) FROM Votes; -- Should return 0 (no votes initially)
   ```

### 2. Environment Configuration

Create or update `.env.local`:

```env
# SQL Server Configuration
DB_NAME=OnlineVotingSystem
DB_SERVER=DESKTOP-FQAMMPA  # Replace with your server name
```

2. **Windows Authentication**:
   The system is configured for Windows Authentication. Make sure your SQL Server instance supports it.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗳️ Voting Process

When you cast a vote through the application:

1. **Duplicate Check**: System verifies the voter hasn't already voted in the election
2. **Vote Recording**: Vote is inserted into the VOTE table with timestamp
3. **Database Update**: Vote count is immediately reflected in results
4. **Real-time Results**: Election results page shows updated vote counts and percentages

### Example Vote Flow:

```typescript
// When user clicks "Cast Vote" button:
await castVote(voterId: 1, candidateId: 5, electionId: 2);

// Database executes:
// 1. Check: SELECT COUNT(*) FROM VOTE WHERE voter_id = 1 AND election_id = 2
// 2. Insert: INSERT INTO VOTE (voter_id, candidate_id, election_id) VALUES (1, 5, 2)
// 3. Result: Vote appears immediately in SQL Server and application results
```

## 📁 Project Structure

```
votingsystem/
├── src/app/
│   ├── elections/              # Elections listing page
│   │   └── [id]/vote/         # Voting interface for specific election
│   ├── results/               # Election results and statistics
│   └── admin/                 # Election management panel
│       └── elections/[id]/manage/  # Candidate management for elections
├── lib/
│   ├── db.ts                  # SQL Server connection and configuration
│   ├── actions.ts             # Database operations and server actions
│   └── utils.ts               # Utility functions
├── components/ui/             # Reusable UI components (Radix UI)
│   ├── create-election-form.tsx   # Form for creating new elections
│   └── add-candidate-form.tsx     # Form for adding candidates
├── scripts/
│   ├── database-setup.sql     # Complete SQL Server schema
│   └── insert-data-corrected.sql  # Sample data insertion
└── setup-database.bat        # Automated database setup script
```

## 🔧 Database Operations

### Key Server Actions

- **`getElections()`**: Fetch all elections with computed status (upcoming/active/completed)
- **`getCandidatesByElection(id)`**: Get candidates for specific election with manifestos
- **`getElectionResults(id)`**: Get voting results with vote counts and percentages
- **`castVote(voterId, candidateId, electionId)`**: Securely record a vote with validation
- **`getCompletedElectionsWithResults()`**: Get all completed elections with full results
- **`createElection(title, description, startDate, endDate)`**: Create a new election
- **`addCandidate(name, party, manifesto, electionId)`**: Add a candidate to an election

### Database Views

The system includes optimized views for common queries:

- **`ElectionStatus`**: Elections with computed status and vote counts
- **`ElectionResults`**: Detailed results with candidate rankings and percentages

### Sample Queries for SQL Server Management Studio

**View All Elections with Status**:

```sql
USE VotingSystem;
SELECT * FROM ElectionStatus;
```

**Get Election Results**:

```sql
SELECT
    candidate_name,
    vote_count,
    percentage
FROM ElectionResults
WHERE election_id = 1
ORDER BY vote_count DESC;
```

**Monitor Voting Activity**:

```sql
SELECT
    v.vote_id,
    vo.name as voter_name,
    c.name as candidate_name,
    e.title as election_title,
    v.timestamp
FROM VOTE v
JOIN VOTER vo ON v.voter_id = vo.voter_id
JOIN CANDIDATE c ON v.candidate_id = c.candidate_id
JOIN ELECTION e ON v.election_id = e.election_id
ORDER BY v.timestamp DESC;
```

```sql
SELECT * FROM ElectionResults WHERE election_id = 3;
```

**Check Vote Count**:

```sql
SELECT
    e.title,
    COUNT(v.vote_id) as total_votes
FROM ELECTION e
LEFT JOIN VOTE v ON e.election_id = v.election_id
GROUP BY e.election_id, e.title;
```

## 📊 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: Microsoft SQL Server
- **ORM**: Native SQL with mssql package
- **Authentication**: Windows Authentication
- **Development**: Hot reload, ESLint, Prettier

## 🚀 Getting Started

1. **Clone and install**:

   ```bash
   cd votingsystem
   npm install
   ```

2. **Set up SQL Server database**:

   ```bash
   setup-database.bat
   ```

3. **Configure environment**:
   Update `.env.local` with your server name

4. **Start development server**:

   ```bash
   npm run dev
   ```

5. **Open application**:
   Navigate to `http://localhost:3000`

## ⚠️ Connection Troubleshooting

If you encounter a connection error like "Failed to connect to DESKTOP-FQAMMPA:1433", this means TCP/IP is not enabled for SQL Server.

### Quick Fix:

1. **Open SQL Server Configuration Manager**:

   - Press `Win + R`, type `SQLServerManager15.msc`
   - Or search "SQL Server Configuration Manager"

2. **Enable TCP/IP**:

   - Go to: `SQL Server Network Configuration` > `Protocols for [Instance]`
   - Right-click `TCP/IP` → `Enable`
   - Double-click `TCP/IP` → `IP Addresses` tab → Scroll to `IPALL`
   - Set `TCP Port` to `1433` → Click `OK`

3. **Restart SQL Server**:

   - Go to `SQL Server Services`
   - Right-click `SQL Server (Instance)` → `Restart`

4. **Test**: Run `npm run dev` again

📖 **Detailed troubleshooting guide**: See `ENABLE_TCP_IP.md`

## 🔍 Testing the Vote Casting

To verify votes are being recorded in the database:

1. **Cast a vote** through the web interface
2. **Check in SQL Server Management Studio**:

   ```sql
   USE VotingSystem;

   -- View recent votes
   SELECT TOP 5
       v.vote_id,
       vo.name as voter,
       c.name as candidate,
       e.title as election,
       v.timestamp
   FROM VOTE v
   JOIN VOTER vo ON v.voter_id = vo.voter_id
   JOIN CANDIDATE c ON v.candidate_id = c.candidate_id
   JOIN ELECTION e ON v.election_id = e.election_id
   ORDER BY v.timestamp DESC;
   ```

3. **View updated results**:
   Check the `/results` page in your application to see real-time updates

## 📝 License

This project is for educational purposes as part of a Database Systems course.

## 🤝 Contributing

This is a course project. For suggestions or improvements, please create an issue or pull request.

---

**Database Course Project** | **University of Management and Technology** | **Semester 4**
