# Online Voting System - API Documentation

## 📋 **Table of Contents**

- [Database Schema](#database-schema)
- [Server Actions](#server-actions)
- [Frontend Components](#frontend-components)
- [Database Queries](#database-queries)
- [Status Management](#status-management)

---

## 🗄️ **Database Schema**

### **Elections Table**

```sql
CREATE TABLE Elections (
    ElectionID INT IDENTITY(1,1) PRIMARY KEY,
    ElectionName NVARCHAR(255) NOT NULL,
    ElectionType NVARCHAR(100) NOT NULL,
    ElectionDate DATE NOT NULL,
    ElectionYear INT NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Upcoming',
    VotingStart DATETIME NOT NULL,
    VotingEnd DATETIME NOT NULL
);
```

### **Candidates Table**

```sql
CREATE TABLE Candidates (
    CandidateID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateName NVARCHAR(255) NOT NULL,
    PartyName NVARCHAR(255) NOT NULL,
    ElectionSymbol NVARCHAR(100) NOT NULL,
    Constituency NVARCHAR(100) NOT NULL,
    Province NVARCHAR(100) NOT NULL,
    CandidateAge INT NOT NULL,
    ElectionID INT NOT NULL,
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID)
);
```

### **OnlineVotes Table**

```sql
CREATE TABLE OnlineVotes (
    VoteNo INT IDENTITY(1,1) PRIMARY KEY,
    CNIC VARCHAR(15) NOT NULL,
    CandidateID INT NOT NULL,
    ElectionID INT NOT NULL,
    Constituency VARCHAR(20) NOT NULL,
    VoteDate DATETIME DEFAULT GETDATE(),
    VotingLocation VARCHAR(100),
    FOREIGN KEY (CNIC) REFERENCES Voters(CNIC),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
    UNIQUE(CNIC, ElectionID) -- Prevents duplicate voting
);
```

### **Voters Table**

```sql
CREATE TABLE Voters (
    CNIC VARCHAR(15) PRIMARY KEY,
    VoterName VARCHAR(100) NOT NULL,
    Age INT CHECK (Age >= 18 AND Age <= 80),
    City VARCHAR(40) NOT NULL,
    Province VARCHAR(30) NOT NULL,
    Gender CHAR(1) CHECK (Gender IN ('M', 'F')),
    RegistrationDate DATE DEFAULT GETDATE(),
    Email VARCHAR(100) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(15) UNIQUE,
    OnlineStatus VARCHAR(20) DEFAULT 'Active'
);
```

---

## ⚡ **Server Actions**

### **Election Management**

#### `getElections()`

**Purpose**: Retrieve all elections with computed status  
**Returns**: `Election[]` with computed_status field  
**Status Logic**:

- `upcoming`: current time < voting start
- `active`: voting start ≤ current time ≤ voting end
- `completed`: current time > voting end

```typescript
interface Election {
	ElectionID: number;
	ElectionName: string;
	ElectionType: string;
	ElectionDate: string;
	ElectionYear: number;
	Status: string;
	VotingStart: string;
	VotingEnd: string;
	computed_status: "upcoming" | "active" | "completed";
}
```

#### `createElection(name, type, date, year, start, end)`

**Purpose**: Create new election with automatic status assignment  
**Parameters**:

- `electionName`: string
- `electionType`: string
- `electionDate`: string
- `electionYear`: number
- `votingStart`: string (datetime)
- `votingEnd`: string (datetime)

**Returns**: `{success: boolean, message: string}`

#### `updateElectionStatuses()`

**Purpose**: Batch update all election statuses in database  
**SQL Query**:

```sql
UPDATE Elections
SET Status = CASE
    WHEN GETDATE() < VotingStart THEN 'Upcoming'
    WHEN GETDATE() >= VotingStart AND GETDATE() <= VotingEnd THEN 'Active'
    WHEN GETDATE() > VotingEnd THEN 'Completed'
    ELSE Status
END
```

### **Candidate Management**

#### `getCandidatesByElection(electionId)`

**Purpose**: Get all candidates for specific election  
**Parameters**: `electionId: number`  
**Returns**: `Candidate[]`

```typescript
interface Candidate {
	CandidateID: number;
	CandidateName: string;
	PartyName: string;
	ElectionSymbol: string;
	Constituency: string;
	Province: string;
	CandidateAge: number;
	ElectionID: number;
}
```

#### `addCandidate(electionId, name, party, symbol, constituency, province, age)`

**Purpose**: Add new candidate to election  
**Parameters**:

- `electionId`: number
- `candidateName`: string
- `partyName`: string
- `electionSymbol`: string
- `constituency`: string
- `province`: string
- `candidateAge`: number

### **Voting System**

#### `castVote(electionId, candidateId, voterCNIC)`

**Purpose**: Cast vote with duplicate prevention  
**Parameters**:

- `electionId`: number
- `candidateId`: number
- `voterCNIC`: string (13 digits)

**Validation**:

1. Check if CNIC already voted in this election
2. Prevent duplicate voting
3. Record vote with timestamp

**Error Cases**:

- "You have already voted in this election"
- "Failed to cast vote"

### **Results & Analytics**

#### `getCompletedElectionsWithResults()`

**Purpose**: Get results for all completed elections  
**Logic**: Filters elections where `current time > voting end time`  
**Returns**: Array of election results with vote counts and percentages

```typescript
interface ElectionResult {
	id: number;
	title: string;
	description: string;
	endDate: string;
	totalVotes: number;
	results: Array<{
		candidate: string;
		party: string;
		votes: number;
		percentage: number;
	}>;
	winner: string;
}
```

---

## 🎨 **Frontend Components**

### **Election Creation**

- **File**: `components/create-election-form.tsx`
- **Features**: Date validation, automatic status computation
- **Form Fields**: Name, Type, Date, Year, Start Time, End Time

### **Candidate Management**

- **File**: `components/add-candidate-form.tsx`
- **Features**: Party selection, symbol selection, constituency input
- **Validation**: Age minimum (25), required fields

### **Voting Interface**

- **File**: `src/app/elections/[id]/vote/page.tsx`
- **Features**: CNIC validation, candidate selection, duplicate prevention
- **Security**: 13-digit CNIC validation, server-side duplicate checking

### **Admin Dashboard**

- **File**: `src/app/admin/page.tsx`
- **Features**: Election management, status display, candidate management links

### **Results Display**

- **File**: `src/app/results/page.tsx`
- **Features**: Vote counting, percentage calculation, winner determination

---

## 🔍 **Complete Database Queries**

### **Election Management Queries**

#### **Get All Elections with Status**

```sql
SELECT
    ElectionID,
    ElectionName,
    ElectionType,
    ElectionDate,
    ElectionYear,
    Status,
    VotingStart,
    VotingEnd,
    CASE
        WHEN GETDATE() < VotingStart THEN 'upcoming'
        WHEN GETDATE() >= VotingStart AND GETDATE() <= VotingEnd THEN 'active'
        WHEN GETDATE() > VotingEnd THEN 'completed'
        ELSE 'unknown'
    END as computed_status
FROM Elections
ORDER BY VotingStart DESC;
```

#### **Create New Election**

```sql
INSERT INTO Elections (ElectionName, ElectionType, ElectionDate, ElectionYear, Status, VotingStart, VotingEnd)
VALUES (@ElectionName, @ElectionType, @ElectionDate, @ElectionYear, @Status, @VotingStart, @VotingEnd);
```

#### **Update All Election Statuses (Batch)**

```sql
UPDATE Elections
SET Status = CASE
    WHEN GETDATE() < VotingStart THEN 'Upcoming'
    WHEN GETDATE() >= VotingStart AND GETDATE() <= VotingEnd THEN 'Active'
    WHEN GETDATE() > VotingEnd THEN 'Completed'
    ELSE Status
END;
```

### **Candidate Management Queries**

#### **Get Candidates by Election**

```sql
SELECT
    CandidateID,
    CandidateName,
    PartyName,
    ElectionSymbol,
    Constituency,
    Province,
    CandidateAge,
    ElectionID
FROM Candidates
WHERE ElectionID = @ElectionID
ORDER BY CandidateName;
```

#### **Add New Candidate**

```sql
INSERT INTO Candidates (CandidateName, PartyName, ElectionSymbol, Constituency, Province, CandidateAge, ElectionID)
VALUES (@CandidateName, @PartyName, @ElectionSymbol, @Constituency, @Province, @CandidateAge, @ElectionID);
```

### **Voting System Queries**

#### **Check for Duplicate Vote**

```sql
SELECT COUNT(*) as VoteCount
FROM Votes
WHERE ElectionID = @ElectionID AND CNIC = @VoterCNIC;
```

#### **Cast Vote**

```sql
INSERT INTO Votes (ElectionID, CandidateID, CNIC, VoteDate)
VALUES (@ElectionID, @CandidateID, @VoterCNIC, GETDATE());
```

#### **Get Election Results**

```sql
SELECT
    c.CandidateName,
    c.PartyName,
    c.ElectionSymbol,
    c.Constituency,
    c.Province,
    COUNT(v.VoteID) as VoteCount,
    ROUND(
        (COUNT(v.VoteID) * 100.0) / NULLIF(
            (SELECT COUNT(*) FROM Votes WHERE ElectionID = c.ElectionID), 0
        ), 2
    ) as Percentage
FROM Candidates c
LEFT JOIN Votes v ON c.CandidateID = v.CandidateID
WHERE c.ElectionID = @ElectionID
GROUP BY c.CandidateID, c.CandidateName, c.PartyName, c.ElectionSymbol,
         c.Constituency, c.Province, c.ElectionID
ORDER BY VoteCount DESC;
```

### **Results and Analytics Queries**

#### **Get Completed Elections with Results**

```sql
SELECT
    e.ElectionID,
    e.ElectionName,
    e.ElectionType,
    e.ElectionDate,
    e.ElectionYear,
    e.Status,
    e.VotingStart,
    e.VotingEnd,
    COUNT(v.VoteID) as TotalVotes
FROM Elections e
LEFT JOIN Votes v ON e.ElectionID = v.ElectionID
WHERE GETDATE() > e.VotingEnd
GROUP BY e.ElectionID, e.ElectionName, e.ElectionType, e.ElectionDate,
         e.ElectionYear, e.Status, e.VotingStart, e.VotingEnd
ORDER BY e.VotingEnd DESC;
```

#### **Get Election Winner**

```sql
SELECT TOP 1
    c.CandidateName,
    c.PartyName,
    COUNT(v.VoteID) as VoteCount
FROM Candidates c
LEFT JOIN Votes v ON c.CandidateID = v.CandidateID
WHERE c.ElectionID = @ElectionID
GROUP BY c.CandidateID, c.CandidateName, c.PartyName
ORDER BY VoteCount DESC;
```

### **Administrative Queries**

#### **Get Election Statistics**

```sql
SELECT
    e.ElectionID,
    e.ElectionName,
    COUNT(DISTINCT c.CandidateID) as TotalCandidates,
    COUNT(v.VoteID) as TotalVotes,
    CASE
        WHEN GETDATE() < e.VotingStart THEN 'upcoming'
        WHEN GETDATE() >= e.VotingStart AND GETDATE() <= e.VotingEnd THEN 'active'
        WHEN GETDATE() > e.VotingEnd THEN 'completed'
        ELSE 'unknown'
    END as computed_status
FROM Elections e
LEFT JOIN Candidates c ON e.ElectionID = c.ElectionID
LEFT JOIN Votes v ON e.ElectionID = v.ElectionID
GROUP BY e.ElectionID, e.ElectionName, e.VotingStart, e.VotingEnd
ORDER BY e.VotingStart DESC;
```

#### **Validate CNIC Format** (Application Level)

```typescript
const validateCNIC = (cnic: string): boolean => {
	return /^\d{5}-\d{7}-\d{1}$/.test(cnic);
};
```

#### **Security Constraints (Database Level)**

```sql
-- Prevent duplicate voting
ALTER TABLE Votes
ADD CONSTRAINT Unique_Vote UNIQUE (CNIC, ElectionID);

-- Election status validation
ALTER TABLE Elections
ADD CONSTRAINT Check_Election_Status
CHECK (Status IN ('Upcoming', 'Active', 'Completed', 'Cancelled'));

-- Age validation for candidates
ALTER TABLE Candidates
ADD CONSTRAINT Check_Candidate_Age
CHECK (CandidateAge >= 25);
```

---

## 📊 **Status Management System**

### **Computed Status Logic**

```typescript
const now = new Date();
const startDate = new Date(election.VotingStart);
const endDate = new Date(election.VotingEnd);

let computed_status: "upcoming" | "active" | "completed";
if (now < startDate) {
	computed_status = "upcoming";
} else if (now >= startDate && now <= endDate) {
	computed_status = "active";
} else {
	computed_status = "completed";
}
```

### **Database Status Sync**

- **Automatic**: Status computed in real-time in frontend
- **Manual**: `updateElectionStatuses()` for database consistency
- **Hybrid**: Uses computed status for logic, database for persistence

### **Status Display Mapping**

```typescript
const statusColors = {
	upcoming: "bg-blue-100 text-blue-800",
	active: "bg-green-100 text-green-800",
	completed: "bg-gray-100 text-gray-800",
};
```

---

## 🛡️ **Security Features**

### **Voting Security**

- CNIC-based voter identification
- Duplicate vote prevention at database level
- Server-side validation for all vote operations

### **Data Validation**

- 13-digit CNIC format validation
- Age restrictions for candidates (minimum 25)
- Date validation for election scheduling

### **Error Handling**

- Comprehensive try-catch blocks
- User-friendly error messages
- Graceful fallbacks for database issues

---

## 📱 **API Endpoints Summary**

| Function                             | Purpose             | Parameters                | Returns            |
| ------------------------------------ | ------------------- | ------------------------- | ------------------ |
| `getElections()`                     | List all elections  | None                      | `Election[]`       |
| `createElection()`                   | Create new election | Election details          | Success/Error      |
| `getCandidatesByElection()`          | Get candidates      | `electionId`              | `Candidate[]`      |
| `addCandidate()`                     | Add candidate       | Candidate details         | Success/Error      |
| `castVote()`                         | Cast vote           | Election, Candidate, CNIC | Success/Error      |
| `getCompletedElectionsWithResults()` | Get results         | None                      | `ElectionResult[]` |
| `updateElectionStatuses()`           | Sync statuses       | None                      | Success/Error      |

---

## 🔧 **Development Notes**

### **Environment Setup**

- Database: SQL Server with Windows Authentication
- Framework: Next.js 14 with TypeScript
- Styling: Tailwind CSS with shadcn/ui components

### **Key Dependencies**

```json
{
	"mssql": "^11.0.1",
	"@types/mssql": "^9.1.7",
	"next": "14.x",
	"typescript": "5.8.3"
}
```

### **Database Connection**

- Server: `DESKTOP-FQAMMPA`
- Database: `OnlineVotingSystem`
- Authentication: Windows Authentication (trustedConnection)

This documentation covers the complete Online Voting System with all current implementations and optimizations.
